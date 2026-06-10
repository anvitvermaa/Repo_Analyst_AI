# 🤖 GitHub Repo Analyst AI

> *Fully automated complex security audits directly within an interactive Windows XP OS simulation.*

## 🌟 Overview
**GitHub Repo Analyst AI** is an autonomous analysis tool that brings conversational AI to your codebase. Architected with a **LangGraph** orchestration layer, **LLaMA 3** agents, and a **ChromaDB** RAG pipeline, it performs deep conversational codebase analysis and automated security audits. 

The best part? It's all wrapped in a flawless, interactive **Windows XP-themed desktop simulation** built with React!

## ✨ Features
- **Conversational Codebase Analysis:** Ask questions about your code, architecture, and dependencies.
- **Automated Security Audits:** Performs complex three-stage security audits (SAST & dependencies) directly within the simulation.
- **RAG Pipeline:** Utilizes ChromaDB to retrieve relevant codebase context for precise answers.
- **Nostalgic UI:** An interactive, fully functional Windows XP desktop environment built with React.

## 💻 Tech Stack
- **AI & Orchestration:** LangGraph, LangChain, LLaMA 3 (via Ollama)
- **Backend:** Python, FastAPI, Celery, Redis, SQLAlchemy
- **Vector Database:** ChromaDB
- **Frontend:** React, Vite, Axios

## 📂 Project Structure
- `backend/`: Python backend handling agent orchestration, LangGraph workflows, and vector search.
- `frontend/`: React + Vite frontend serving the Windows XP desktop experience.

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (for Celery workers)
- Ollama (running LLaMA 3 locally)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start Redis and the Celery worker, then run the backend server:
   ```bash
   python run.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/anvitvermaa/Repo_Analyst_AI/issues).
