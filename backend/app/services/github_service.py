import httpx
import base64
import json
from app.core.config import GITHUB_TOKEN

GITHUB_API_URL = "https://api.github.com"
HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": f"token {GITHUB_TOKEN}"
}

async def search_github_repos(query: str):
    search_url = f"{GITHUB_API_URL}/search/repositories"
    params = {"q": query, "sort": "stars", "order": "desc", "per_page": 10}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(search_url, params=params, headers=HEADERS)
            response.raise_for_status() 
            return response.json().get("items", [])
        except httpx.HTTPStatusError as e:
            print(f"GitHub API error: {e}")
            return []

async def get_repo_tech_stack(repo_full_name: str):
    known_tech = {
        "react": "React", "vue": "Vue", "angular": "Angular", "svelte": "Svelte",
        "next": "Next.js", "nuxt": "Nuxt.js", "tailwindcss": "Tailwind CSS",
        "typescript": "TypeScript", "express": "Express.js",
        "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
        "pandas": "Pandas", "numpy": "NumPy", "tensorflow": "TensorFlow",
        "torch": "PyTorch", "gin-gonic/gin": "Gin", "spring-boot": "Spring Boot"
    }
    
    async with httpx.AsyncClient() as client:
        try:
            url = f"{GITHUB_API_URL}/repos/{repo_full_name}/contents/package.json"
            response = await client.get(url, headers=HEADERS)
            if response.status_code == 200:
                data = response.json()
                content = base64.b64decode(data['content']).decode('utf-8')
                pkg_json = json.loads(content)
                tech_stack = []
                deps = {**pkg_json.get("dependencies", {}), **pkg_json.get("devDependencies", {})}
                for key in deps:
                    if key in known_tech:
                        tech_stack.append(known_tech[key])
                if "typescript" in deps and "TypeScript" not in tech_stack:
                    tech_stack.append("TypeScript")
                elif not tech_stack:
                    tech_stack.append("JavaScript")
                return tech_stack if tech_stack else ["JavaScript"]
        except Exception: pass
            
        try:
            url = f"{GITHUB_API_URL}/repos/{repo_full_name}/contents/requirements.txt"
            response = await client.get(url, headers=HEADERS)
            if response.status_code == 200:
                data = response.json()
                content = base64.b64decode(data['content']).decode('utf-8')
                tech_stack = ["Python"]
                for key, name in known_tech.items():
                    if key in content.lower() and name not in tech_stack:
                        tech_stack.append(name)
                return tech_stack
        except Exception: pass
            
        return ["Unknown"]
