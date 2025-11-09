import os
import subprocess
import json
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

# Import our own git service
from app.services import git_service

# --- 1. Define AI Model ---
llm = ChatOllama(model="llama3:8b")

# --- 2. Define the Agent's State ---
class SecurityAgentState(TypedDict):
    repo_url: str
    local_path: str
    gitleaks_report: str
    bandit_report: str
    summary_report: str
    error: str

# --- 3. Define the Agent's Nodes (Steps) ---

def clone_repo(state: SecurityAgentState):
    """
    Node 1: Clones the repo.
    """
    print("---SECURITY: Cloning Repo---")
    repo_url = state["repo_url"]
    try:
        local_path = git_service.clone_repo(repo_url)
        return {"local_path": local_path}
    except Exception as e:
        return {"error": f"Failed to clone repo: {e}"}

def run_security_tools(state: SecurityAgentState):
    """
    Node 2: Runs Gitleaks and Bandit.
    """
    print("---SECURITY: Running Tools---")
    if "error" in state and state["error"]: return {}
    
    local_path = state["local_path"]
    
    # Run Gitleaks
    gitleaks_json = "[]" # Default to no leaks
    try:
        print("---SECURITY: Running Gitleaks---")
        result = subprocess.run(
            ["gitleaks", "detect", "-r", ".", "-f", "json"],
            cwd=local_path,
            capture_output=True,
            text=True,
            check=True
        )
        gitleaks_json = result.stdout
    except FileNotFoundError:
        print("GITLEAKS ERROR: 'gitleaks' command not found.")
        return {"error": "gitleaks command not found on server."}
    except subprocess.CalledProcessError as e:
        if "no leaks found" in e.stderr.lower():
             gitleaks_json = "[]" # No leaks found
        elif e.stdout:
             gitleaks_json = e.stdout # It found secrets
        else:
            print(f"Gitleaks failed: {e.stderr}")
            gitleaks_json = f'{{"error": "Gitleaks failed to run: {e.stderr}"}}'

    # Run Bandit (for Python repos)
    bandit_json = "[]" # Default to no issues
    try:
        print("---SECURITY: Running Bandit---")
        result = subprocess.run(
            ["bandit", "-r", ".", "-f", "json"],
            cwd=local_path,
            capture_output=True,
            text=True,
            check=False 
        )
        if result.stdout:
            bandit_json = result.stdout
        else:
            bandit_json = "[]" 
    except FileNotFoundError:
        print("BANDIT ERROR: 'bandit' command not found.")
        return {"error": "bandit command not found on server."}
    except Exception as e:
        print(f"Bandit failed: {e}")
        bandit_json = f'{{"error": "Bandit failed to run: {e}"}}'

    return {"gitleaks_report": gitleaks_json, "bandit_report": bandit_json}

def summarize_reports(state: SecurityAgentState):
    """
    Node 3: Uses LLM to summarize the JSON reports.
    
    *** THIS IS THE NEW, STRICTER PROMPT ***
    """
    print("---SECURITY: Summarizing Reports---")
    if "error" in state and state["error"]: return {}

    gitleaks_report = state["gitleaks_report"]
    bandit_report = state["bandit_report"]
    
    prompt = ChatPromptTemplate.from_template(
        """
You are a Principal Security Engineer. Your task is to write a concise 
report based on two JSON tool outputs.

You MUST follow this Markdown format exactly. Do not add any extra text.

Your Thinking Process:
1.  **Analyze Gitleaks:** Look at the Gitleaks JSON. If it's an empty list `[]`,
    the "Secrets Analysis" is "✅ No hardcoded secrets found."
    If it's *not* empty, list the `RuleID` and `File` for each secret found.
2.  **Analyze Bandit:** Look at the Bandit JSON. If the `results` list is 
    empty, the "Vulnerabilities" section is "✅ No Python vulnerabilities found."
    If it has results, find *only* the issues with `"issue_severity": "HIGH"` 
    and list the `test_name` and `filename` for each.
3.  **Assign Risk:** Based on your findings (any secrets or high-severity issues), 
    assign a Risk Score from 1 (Safe) to 10 (Critical).
4.  **Recommend:** Write a final "Proceed with caution" or "All clear."

---
GITLEAKS JSON:
{gitleaks_report}
---
BANDIT JSON:
{bandit_report}
---

Now, generate the report.

## 🛡️ Security Audit Report
**Overall Risk Score:** [Your score from 1-10]

### 🔑 Hardcoded Secrets (Gitleaks)
[Your findings. If none, write "✅ No hardcoded secrets found."]

### 🐍 Python Vulnerabilities (Bandit)
[Your findings. If none, write "✅ No high-severity Python vulnerabilities found."]

### 📋 Recommendation
[Your final verdict. e.g., "Proceed with caution." or "All clear."]
        """
    )
    
    chain = prompt | llm | StrOutputParser()
    
    try:
        summary = chain.invoke({
            "gitleaks_report": gitleaks_report,
            "bandit_report": bandit_report
        })
        return {"summary_report": summary}
    except Exception as e:
        return {"error": f"LLM failed to summarize: {e}"}

def cleanup_temp_repo(state: SecurityAgentState):
    """
    Node 4: Deletes the temporary cloned repo folder.
    """
    print("---SECURITY: Cleaning Up---")
    local_path = state.get("local_path")
    if local_path and os.path.exists(local_path):
        git_service.cleanup_repo(local_path)
    return {}

# --- 4. Build the LangGraph Workflow ---

workflow = StateGraph(SecurityAgentState)

workflow.add_node("clone", clone_repo)
workflow.add_node("run_tools", run_security_tools)
workflow.add_node("summarize", summarize_reports)
workflow.add_node("cleanup", cleanup_temp_repo)

workflow.set_entry_point("clone")
workflow.add_edge("clone", "run_tools")
workflow.add_edge("run_tools", "summarize")
workflow.add_edge("summarize", "cleanup")
workflow.add_edge("cleanup", END)

app_agent = workflow.compile()

# --- 5. Create a Simple Wrapper for our API ---

def run_security_agent(repo_url: str):
    """
    The main function our API will call.
    """
    inputs = {"repo_url": repo_url}
    
    final_state = app_agent.invoke(inputs)
    
    if final_state.get("error"):
        raise Exception(final_state["error"])
        
    return final_state.get("summary_report")