import os
import subprocess
import json
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from app.services import git_service

llm = ChatOllama(model="llama3:8b")

class SecurityAgentState(TypedDict):
    repo_url: str
    local_path: str
    gitleaks_report: str
    bandit_report: str
    summary_report: str
    error: str

def clone_repo(state: SecurityAgentState):
    print("---SECURITY: Cloning Repo---")
    try:
        local_path = git_service.clone_repo(state["repo_url"])
        return {"local_path": local_path}
    except Exception as e:
        return {"error": f"Failed to clone repo: {e}"}

def run_security_tools(state: SecurityAgentState):
    print("---SECURITY: Running Tools---")
    if "error" in state and state["error"]: return {}
    local_path = state["local_path"]
    gitleaks_json, bandit_json = "[]", "[]"
    try:
        print("---SECURITY: Running Gitleaks---")
        result = subprocess.run(
            ["gitleaks", "detect", "-r", ".", "-f", "json"],
            cwd=local_path, capture_output=True, text=True, check=True
        )
        gitleaks_json = result.stdout
    except FileNotFoundError: return {"error": "gitleaks command not found on server."}
    except subprocess.CalledProcessError as e:
        if "no leaks found" in e.stderr.lower(): gitleaks_json = "[]"
        elif e.stdout: gitleaks_json = e.stdout
        else: gitleaks_json = f'{{"error": "Gitleaks failed: {e.stderr}"}}'
    try:
        print("---SECURITY: Running Bandit---")
        result = subprocess.run(
            ["bandit", "-r", ".", "-f", "json"],
            cwd=local_path, capture_output=True, text=True, check=False
        )
        if result.stdout: bandit_json = result.stdout
        else: bandit_json = "[]"
    except FileNotFoundError: return {"error": "bandit command not found on server."}
    except Exception as e: bandit_json = f'{{"error": "Bandit failed: {e}"}}'
    return {"gitleaks_report": gitleaks_json, "bandit_report": bandit_json}

def summarize_reports(state: SecurityAgentState):
    print("---SECURITY: Summarizing Reports---")
    if "error" in state and state["error"]: return {}
    prompt = ChatPromptTemplate.from_template(
        """
You are a Principal Security Engineer. Your task is to write a concise 
report based on two JSON tool outputs. You MUST follow this Markdown format exactly.

Your Thinking Process:
1.  **Analyze Gitleaks:** If the JSON is `[]`, say "✅ No hardcoded secrets found."
    If not empty, list the `RuleID` and `File` for each secret.
2.  **Analyze Bandit:** If the `results` list is `[]`, say "✅ No Python vulnerabilities found."
    If it has results, find *only* `"issue_severity": "HIGH"` issues
    and list the `test_name` and `filename`.
3.  **Assign Risk:** Based on any secrets or HIGH issues, assign a Risk Score (1-10).
4.  **Recommend:** Write a final "Proceed with caution." or "All clear."
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
[Your final verdict.]
        """
    )
    chain = prompt | llm | StrOutputParser()
    try:
        summary = chain.invoke({
            "gitleaks_report": state["gitleaks_report"],
            "bandit_report": state["bandit_report"]
        })
        return {"summary_report": summary}
    except Exception as e: return {"error": f"LLM failed to summarize: {e}"}

def cleanup_temp_repo(state: SecurityAgentState):
    print("---SECURITY: Cleaning Up---")
    local_path = state.get("local_path")
    if local_path and os.path.exists(local_path):
        git_service.cleanup_repo(local_path)
    return {}

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

def run_security_agent(repo_url: str):
    inputs = {"repo_url": repo_url}
    final_state = app_agent.invoke(inputs)
    if final_state.get("error"):
        raise Exception(final_state["error"])
    return final_state.get("summary_report")
