from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.agents.repo_pathfinder import run_pathfinder_agent

router = APIRouter()

# --- 1. Define the Request Model ---
class SearchRequest(BaseModel):
    query: str

# --- 2. Define the Response Model ---
class PathfinderResponse(BaseModel):
    report: str

# --- 3. Create the Search Endpoint ---
@router.post("/pathfinder/find", response_model=PathfinderResponse)
async def find_repos_endpoint(request: SearchRequest):
    """
    The main API endpoint to find and analyze repos.
    """
    try:
        print(f"Received pathfinder request for: {request.query}")
        
        # Call our new async agent
        report_content = await run_pathfinder_agent(request.query)
        
        if not report_content:
            raise HTTPException(status_code=500, detail="Agent failed to produce content.")
            
        return PathfinderResponse(report=report_content)

    except Exception as e:
        print(f"Unhandled exception in pathfinder agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))
