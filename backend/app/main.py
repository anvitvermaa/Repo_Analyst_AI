from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import our routers
from app.api.v1.endpoints import readme, pathfinder, analyst, security  # <--- ADDED 'security'

app = FastAPI(title="Repo-Analyst-AI API")

# --- CORS Middleware ---
origins = ["*"] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Routers ---
app.include_router(readme.router, prefix="/api/v1", tags=["Readme Agent"])
app.include_router(pathfinder.router, prefix="/api/v1", tags=["Pathfinder Agent"])
app.include_router(analyst.router, prefix="/api/v1", tags=["Analyst Agent"])
app.include_router(security.router, prefix="/api/v1", tags=["Security Agent"]) # <--- ADDED THIS LINE

# --- "Hello World" Root ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Repo-Analyst-AI API"}
