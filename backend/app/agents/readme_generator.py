import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_community.document_loaders.generic import GenericLoader
from langchain_community.document_loaders.parsers import LanguageParser
from langchain_text_splitters import RecursiveCharacterTextSplitter, Language
from langchain_community.vectorstores import Chroma
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langchain_ollama import ChatOllama, OllamaEmbeddings
from app.services import git_service

llm = ChatOllama(model="llama3:8b")
embeddings = OllamaEmbeddings(model="nomic-embed-text")

class ReadmeAgentState(TypedDict):
    repo_url: str
    local_path: str
    vector_store: Chroma
    readme_content: str
    error: str

def load_repo_files_manually(repo_path: str) -> List[Document]:
    print("---README AGENT: Loading files manually with path---")
    docs = []
    suffixes = [".py", ".js", ".jsx", ".tsx", ".ts", ".go", ".java", ".md", ".rs", ".css", ".html"]
    for root, _, files in os.walk(repo_path):
        for file in files:
            if any(file.endswith(s) for s in suffixes):
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, repo_path).replace("\\", "/")
                if ".git" in relative_path:
                    continue
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    text_with_header = f"--- FILE: {relative_path} ---\n\n{content}"
                    doc = Document(page_content=text_with_header, metadata={"source": relative_path})
                    docs.append(doc)
                except Exception: pass
    return docs

def load_and_index_repo(state: ReadmeAgentState):
    print("---AGENT: Loading and Indexing Repo---")
    repo_url = state["repo_url"]
    try:
        local_path = git_service.clone_repo(repo_url)
        docs = load_repo_files_manually(local_path)
        if not docs: return {"error": "No parseable code documents found."}
        splitter = RecursiveCharacterTextSplitter(chunk_size=2000, chunk_overlap=200)
        split_docs = splitter.split_documents(docs)
        print(f"Creating vector store from {len(split_docs)} chunks...")
        vector_store = Chroma.from_documents(documents=split_docs, embedding=embeddings)
        return {"local_path": local_path, "vector_store": vector_store}
    except Exception as e:
        return {"error": str(e)}

def generate_readme(state: ReadmeAgentState):
    print("---AGENT: Generating README---")
    if "error" in state and state["error"]: return {}
    try:
        vector_store = state["vector_store"]
        all_docs_list = vector_store.similarity_search("", k=1000)
        context_string = "\n\n".join(doc.page_content for doc in all_docs_list)
        prompt = ChatPromptTemplate.from_template(
            """
You are an expert technical writer. Your task is to generate a high-quality, professional README.md file.
Analyze all the code and produce a README that includes:
1.  **Project Title**
2.  **Overview**
3.  **Tech Stack**
4.  **Key Features**
5.  **Getting Started**
6.  **Folder Structure**

Use the following context (the entire codebase) to write the README:
----------------
{context}
----------------
Generate the README.md content. Start with '# [Project Title]'.
"""
        )
        simple_chain = prompt | llm | StrOutputParser()
        readme_content = simple_chain.invoke({"context": context_string})
        return {"readme_content": readme_content}
    except Exception as e:
        return {"error": str(e)}

def cleanup_temp_repo(state: ReadmeAgentState):
    print("---AGENT: Cleaning Up---")
    local_path = state.get("local_path")
    if local_path and os.path.exists(local_path):
        git_service.cleanup_repo(local_path)
    return {}

def should_continue(state: ReadmeAgentState):
    return "end" if "error" in state and state["error"] else "continue"

workflow = StateGraph(ReadmeAgentState)
workflow.add_node("load_and_index", load_and_index_repo)
workflow.add_node("generate_readme", generate_readme)
workflow.add_node("cleanup", cleanup_temp_repo)
workflow.set_entry_point("load_and_index")
workflow.add_conditional_edges("load_and_index", should_continue, {"continue": "generate_readme", "end": "cleanup"}) # Go to cleanup on fail
workflow.add_conditional_edges("generate_readme", should_continue, {"continue": "cleanup", "end": "cleanup"}) # Always cleanup
workflow.add_edge("cleanup", END)
app_agent = workflow.compile()

def run_readme_agent(repo_url: str):
    inputs = {"repo_url": repo_url}
    final_state = app_agent.invoke(inputs)
    if final_state.get("error"):
        raise Exception(final_state["error"])
    return final_state.get("readme_content")
