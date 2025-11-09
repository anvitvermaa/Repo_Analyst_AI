import asyncio
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from app.services import github_service

# --- 1. Define the Agent's State ---
class PathfinderState(TypedDict):
    query: str
    search_results: List[dict]
    formatted_report: str
    error: str

# --- 2. Define the Agent's Nodes (Steps) ---

async def search_repos(state: PathfinderState):
    """
    Node 1: Search GitHub for the top 10 repos.
    """
    print("---PATHFINDER: Searching Repos---")
    query = state["query"]
    try:
        results = await github_service.search_github_repos(query)
        return {"search_results": results}
    except Exception as e:
        return {"error": str(e)}

async def analyze_results(state: PathfinderState):
    """
    Node 2: Get tech stack for all 10 repos *in parallel*.
    """
    print("---PATHFINDER: Analyzing Tech Stacks---")
    if "error" in state and state["error"]:
        return {} 

    search_results = state["search_results"]
    
    tasks = []
    for repo in search_results:
        tasks.append(github_service.get_repo_tech_stack(repo["full_name"]))
    
    tech_stacks = await asyncio.gather(*tasks)
    
    for i, repo in enumerate(search_results):
        repo["tech_stack_list"] = tech_stacks[i] # Store as a list
        
    return {"search_results": search_results}

def format_report(state: PathfinderState):
    """
    Node 3: Format the results as a Markdown list.
    
    *** THIS IS THE NEW, FIXED FUNCTION ***
    """
    print("---PATHFINDER: Formatting Report---")
    if "error" in state and state["error"]:
        return {} 

    results = state["search_results"]
    
    report_lines = []
    for i, repo in enumerate(results):
        description = repo.get("description", "No description") or "No description"
        description_safe = description.replace("|", " ").replace("\n", " ")[:150]
        
        # --- THIS IS THE NEW PART ---
        # Format the list of technologies into a clean string
        tech_string = ", ".join(repo['tech_stack_list'])
        
        # Build the new Markdown list format
        report_lines.append(f"### {i+1}. [{repo['full_name']}]({repo['html_url']})\n")
        report_lines.append(f"**⭐ Stars:** {repo['stargazers_count']}\n")
        report_lines.append(f"**🛠️ Tech Stack:** `{tech_string}`\n")
        report_lines.append(f"**💬 Description:** {description_safe}...\n")
        report_lines.append("\n---\n") # Add a horizontal line
    
    report = "\n".join(report_lines)
    return {"formatted_report": report}

# --- 3. Build the LangGraph Workflow ---

workflow = StateGraph(PathfinderState)

workflow.add_node("search", search_repos)
workflow.add_node("analyze", analyze_results)
workflow.add_node("format", format_report)

workflow.set_entry_point("search")
workflow.add_edge("search", "analyze")
workflow.add_edge("analyze", "format")
workflow.add_edge("format", END)

app_agent = workflow.compile()

# --- 4. Create a Simple Wrapper for our API ---

async def run_pathfinder_agent(query: str):
    """
    The main async function our API will call.
    """
    inputs = {"query": query}
    final_state = await app_agent.ainvoke(inputs)
    
    if final_state.get("error"):
        raise Exception(final_state["error"])
        
    return final_state.get("formatted_report")