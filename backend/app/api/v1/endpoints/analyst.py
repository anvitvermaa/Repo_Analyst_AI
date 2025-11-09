from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import analyst_service
from fastapi.responses import StreamingResponse

router = APIRouter()

# --- 1. Define Request/Response Models ---

class StartSessionRequest(BaseModel):
    repo_url: str

class StartSessionResponse(BaseModel):
    session_id: str

class ChatRequest(BaseModel):
    session_id: str
    question: str

# --- 2. Create the "Start Session" Endpoint ---
@router.post("/analyst/start-session", response_model=StartSessionResponse)
async def start_session_endpoint(request: StartSessionRequest):
    """
    Takes a repo URL, creates a new analysis session,
    and returns a new session_id.
    """
    try:
        session_id = await analyst_service.create_analysis_session(request.repo_url)
        return StartSessionResponse(session_id=session_id)
    except Exception as e:
        print(f"Error starting session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. Create the "Chat" Endpoint ---
@router.post("/analyst/chat")
async def chat_endpoint(request: ChatRequest):
    """
    Takes a session_id and a question, and streams back the
    LLM's answer.
    """
    try:
        # --- THIS IS THE FIX ---
        # We must 'await' the async function to get the stream
        answer_stream = await analyst_service.chat_with_repo(
            request.session_id, request.question
        )
        # --- END OF FIX ---
        
        # Stream the response back to the client
        return StreamingResponse(answer_stream, media_type="text/plain")
        
    except Exception as e:
        print(f"Error during chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))
