import tempfile
import shutil
import os
import httpx
import io
import zipfile
from fastapi import HTTPException # We'll change this to a generic Exception
from app.core.config import GITHUB_TOKEN

# --- This is the new, robust "clone" function ---
def clone_repo(repo_url: str) -> str:
    """
    Downloads and extracts a GitHub repo as a ZIP file using the API.
    This bypasses all local git credential issues.
    """
    
    try:
        owner_repo = repo_url.split("github.com/")[1]
        if owner_repo.endswith('.git'):
            owner_repo = owner_repo[:-4]
        if owner_repo.endswith('/'):
            owner_repo = owner_repo[:-1]
    except Exception:
        raise ValueError("Invalid GitHub URL format. Use 'https://github.com/owner/repo'")

    print(f"---GIT_SERVICE: Downloading ZIP for {owner_repo}---")
    
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "Authorization": f"token {GITHUB_TOKEN}"
    }

    try:
        repo_api_url = f"https://api.github.com/repos/{owner_repo}"
        with httpx.Client() as client:
            repo_response = client.get(repo_api_url, headers=headers)
            repo_response.raise_for_status() 
            default_branch = repo_response.json().get("default_branch", "main")
            
            zip_url = f"https://api.github.com/repos/{owner_repo}/zipball/{default_branch}"
            print(f"---GIT_SERVICE: Downloading from {zip_url}---")
            
            zip_response = client.get(zip_url, headers=headers, follow_redirects=True, timeout=30.0)
            zip_response.raise_for_status() 
        
        temp_dir = tempfile.mkdtemp()
        zip_data = io.BytesIO(zip_response.content)
        
        with zipfile.ZipFile(zip_data, 'r') as zf:
            unzipped_root_folder = zf.namelist()[0].split('/')[0]
            zf.extractall(temp_dir)
        
        final_code_path = os.path.join(temp_dir, unzipped_root_folder)
        print(f"---GIT_SERVICE: Repo extracted to {final_code_path}---")
        
        return final_code_path

    except httpx.HTTPStatusError as e:
        print(f"HTTP error while fetching repo: {e}")
        raise Exception(f"Repository not found or API error: {e.response.text}")
    except Exception as e:
        print(f"Unexpected error in git_service: {e}")
        if 'temp_dir' in locals():
            shutil.rmtree(temp_dir) 
        raise Exception(f"An unexpected server error occurred: {e}")

def cleanup_repo(local_path: str):
    try:
        parent_dir = os.path.dirname(local_path)
        print(f"Cleaning up temporary directory: {parent_dir}")
        shutil.rmtree(parent_dir)
    except OSError as e:
        print(f"Error cleaning up directory {local_path}: {e}")
    except Exception as e:
         print(f"General error during cleanup: {e}")
