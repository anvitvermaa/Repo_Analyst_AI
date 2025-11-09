from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

# Import the "brain"
from app.agents.readme_generator import run_readme_agent

router = APIRouter()

# --- 1. Define the Request Model ---
# This tells FastAPI what the JSON request from the frontend will look like
class RepoRequest(BaseModel):
    repo_url: str

# --- 2. Define the Response Model ---
# This tells FastAPI what the JSON response will look like
class ReadmeResponse(BaseModel):
    content: str

# --- 3. Create the Generation Endpoint ---
@router.post("/readme/generate", response_model=ReadmeResponse)
async def generate_readme_endpoint(request: RepoRequest):
    """
    The main API endpoint to generate a README.
    It takes a repo_url and returns the generated README content.
    """
    try:
        print(f"Received request to generate README for: {request.repo_url}")
        
        # This is where we call our agent!
        readme_content = run_readme_agent(request.repo_url)
        
        if not readme_content:
            raise HTTPException(status_code=500, detail="Agent failed to produce content.")
            
        return ReadmeResponse(content=readme_content)

    except HTTPException as e:
        # Re-raise HTTPExceptions (like our 400 error from the git_service)
        raise e
    except Exception as e:
        # Catch any other unexpected errors from the agent
        print(f"Unhandled exception in agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))