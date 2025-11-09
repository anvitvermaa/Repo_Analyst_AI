from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.security_service import run_security_agent

router = APIRouter()

# --- 1. Define Request/Response Models ---
class ScanRequest(BaseModel):
    repo_url: str

class ScanResponse(BaseModel):
    report: str

# --- 2. Create the Scan Endpoint ---
@router.post("/security/scan", response_model=ScanResponse)
async def scan_repo_endpoint(request: ScanRequest):
    """
    The main API endpoint to scan a repo for security issues.
    """
    try:
        print(f"Received security scan request for: {request.repo_url}")
        
        # Call our new agent
        # This is a synchronous (blocking) call, FastAPI runs it in a threadpool
        report_content = run_security_agent(request.repo_url)
        
        if not report_content:
            raise HTTPException(status_code=500, detail="Agent failed to produce content.")
            
        return ScanResponse(report=report_content)

    except Exception as e:
        print(f"Unhandled exception in security agent: {e}")
        raise HTTPException(status_code=500, detail=str(e))
