import os
import uuid
import shutil
from typing import Dict, List
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_core.documents import Document
from langchain_ollama import ChatOllama, OllamaEmbeddings

# Import our own git service
from app.services import git_service

# --- 1. Define AI Models ---
llm = ChatOllama(model="llama3:8b")
embeddings = OllamaEmbeddings(model="nomic-embed-text")

# --- 2. In-Memory Session Storage ---
active_sessions: Dict[str, Chroma] = {}

# --- 3. The RAG Chain Definition ---
rag_prompt = ChatPromptTemplate.from_template(
    """
You are an expert developer and AI assistant. A user is asking a question about a 
codebase. Answer their question based *only* on the following code context provided.
If the context doesn't contain the answer, just say "I'm sorry, I couldn't find 
that information in the provided code."

CONTEXT:
{context}

QUESTION:
{question}

ANSWER:
"""
)

def format_docs(docs: List) -> str:
    """
    Converts a list of Document objects into a single string.
    """
    return "\n\n".join(doc.page_content for doc in docs)

# --- 4. The Main Service Functions ---

# *** THIS IS THE NEW, FIXED LOADER FUNCTION ***
def load_repo_files_manually(repo_path: str) -> List[Document]:
    """
    Manually walks the directory and reads files, prepending the
    file path to the content. This forces the LLM to know the filename.
    """
    print("---ANALYST: Loading files manually with path---")
    docs = []
    
    # Define the suffixes we care about
    suffixes = [".py", ".js", ".jsx", ".tsx", ".ts", ".go", ".java", ".md", ".rs", ".css", ".html"]
    
    for root, _, files in os.walk(repo_path):
        for file in files:
            if any(file.endswith(s) for s in suffixes):
                file_path = os.path.join(root, file)
                
                # Make the path relative and OS-independent
                relative_path = os.path.relpath(file_path, repo_path).replace("\\", "/")
                
                # Ignore files in .git directory
                if ".git" in relative_path:
                    continue
                    
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # --- THE CRITICAL FIX ---
                    # We add the file path directly into the content
                    text_with_header = f"--- FILE: {relative_path} ---\n\n{content}"
                    
                    doc = Document(
                        page_content=text_with_header,
                        metadata={"source": relative_path}
                    )
                    docs.append(doc)
                except Exception as e:
                    print(f"Warning: Could not read file {file_path}: {e}")
                    
    return docs

async def create_analysis_session(repo_url: str) -> str:
    """
    This is the "start" function.
    It clones, loads, and creates a vector store, then saves it to memory.
    """
    print(f"---ANALYST: Creating session for {repo_url}---")
    local_path = "" # Define here for error handling
    try:
        # 1. Clone Repo
        local_path = git_service.clone_repo(repo_url)
        
        # 2. Load Code (Using our NEW manual function)
        docs = load_repo_files_manually(local_path)
        
        if not docs:
            raise Exception("No parseable code documents found.")

        # 3. Split Code
        # We use a simple splitter now, not a language-specific one
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=200
        )
        split_docs = splitter.split_documents(docs)
        
        # 4. Create Vector Store
        print(f"Creating vector store from {len(split_docs)} chunks...")
        vector_store = Chroma.from_documents(
            documents=split_docs, 
            embedding=embeddings
        )
        
        # 5. Create session, save store to memory
        session_id = str(uuid.uuid4())
        active_sessions[session_id] = vector_store
        print(f"---ANALYST: Session {session_id} created successfully.---")
        
        return session_id

    except Exception as e:
        print(f"Error in create_analysis_session: {e}")
        raise e # Re-raise the exception to be caught by the API
    finally:
        # 6. ALWAYS clean up the local files
        if local_path and os.path.exists(local_path):
            git_service.cleanup_repo(local_path)


async def chat_with_repo(session_id: str, question: str):
    """
    This is the "chat" function.
    It finds the vector store and runs the RAG chain.
    """
    print(f"---ANALYST: Chat received for session {session_id}---")
    
    # 1. Find the vector store
    vector_store = active_sessions.get(session_id)
    if not vector_store:
        raise Exception("Invalid or expired session ID.")
        
    # 2. Create the RAG chain
    retriever = vector_store.as_retriever(search_kwargs={"k": 5}) # Get top 5 chunks
    
    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | rag_prompt
        | llm
        | StrOutputParser()
    )
    
    # 3. Invoke the chain and stream the response
    return rag_chain.astream(question)