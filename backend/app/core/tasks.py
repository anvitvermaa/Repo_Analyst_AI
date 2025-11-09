from app.core.celery_app import celery_app
from app.agents.readme_generator import run_readme_agent
from app.agents.security_service import run_security_agent
# We will add analyst and refactor tasks here later

@celery_app.task(name="create_readme_task")
def create_readme_task(repo_url: str):
    """
    This is the background job that runs our slow agent.
    """
    print(f"---CELERY WORKER: Starting README job for {repo_url}---")
    try:
        result = run_readme_agent(repo_url)
        print(f"---CELERY WORKER: README job for {repo_url} COMPLETE---")
        return result
    except Exception as e:
        print(f"---CELERY WORKER: README job for {repo_url} FAILED: {e}---")
        return str(e)

@celery_app.task(name="run_security_scan_task")
def run_security_scan_task(repo_url: str):
    """
    This is the background job for the security agent.
    """
    print(f"---CELERY WORKER: Starting SECURITY job for {repo_url}---")
    try:
        result = run_security_agent(repo_url)
        print(f"---CELERY WORKER: SECURITY job for {repo_url} COMPLETE---")
        return result
    except Exception as e:
        print(f"---CELERY WORKER: SECURITY job for {repo_url} FAILED: {e}---")
        return str(e)
