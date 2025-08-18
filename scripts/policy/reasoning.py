#!/usr/bin/env python3
"""
Reasoning Effort Policy Implementation
Selects effort level and budgets based on task classification and escalation rules.
"""

def select_reasoning_effort(task, risk="low", revenue_impact="low", doctrine_pre_threshold=False, time_budget_s=None, token_budget=None):
    """
    Select reasoning effort level and budgets based on policy rules.
    
    Args:
        task: str or list - task type(s) to classify
        risk: str - "low", "medium", "high"
        revenue_impact: str - "low", "medium", "high" 
        doctrine_pre_threshold: bool - PRE-THRESHOLD doctrine active
        time_budget_s: int - time budget in seconds (triggers deescalation if ≤3)
        token_budget: int - token budget (triggers deescalation if ≤800 and level=HIGH)
    
    Returns:
        dict: {"level": str, "tool_budget": int, "token_guideline": int, "notes": str}
    """
    
    # Base classification
    minimal_tasks = ["data_extraction", "status_check", "simple_query", "health_check", "ping", "grep", "list", "summarize_short"]
    medium_tasks = ["code_generation", "planning", "standard_analysis", "refactor", "test_authoring", "integration", "wiring", "research_light"] 
    high_tasks = ["strategy", "complex_debug", "revenue_optimization", "security_decision", "incident_response", "architecture", "negotiation"]
    
    # Synonyms mapping
    synonyms = {
        "extract": "data_extraction",
        "check_status": "status_check", 
        "quick_question": "simple_query",
        "gen_code": "code_generation",
        "plan": "planning",
        "analyze": "standard_analysis",
        "debug": "complex_debug",
        "rev_opt": "revenue_optimization", 
        "sec_gate": "security_decision"
    }
    
    # Normalize task input
    if isinstance(task, str):
        tasks = [task]
    else:
        tasks = task
    
    # Apply synonyms
    normalized_tasks = []
    for t in tasks:
        normalized_tasks.append(synonyms.get(t, t))
    
    # Determine base level
    if any(t in high_tasks for t in normalized_tasks):
        base_level = "high"
    elif any(t in medium_tasks for t in normalized_tasks):
        base_level = "medium"
    else:
        base_level = "minimal"
    
    level = base_level
    notes = []
    
    # Escalation rules
    if risk == "high":
        if level == "minimal":
            level = "medium"
        elif level == "medium":
            level = "high"
        notes.append("escalated for high risk")
    
    if risk == "medium" and base_level == "minimal":
        level = "medium" 
        notes.append("escalated for medium risk")
    
    if revenue_impact == "high":
        if level == "minimal":
            level = "medium"
        elif level == "medium":
            level = "high"
        notes.append("escalated for revenue impact")
    
    if doctrine_pre_threshold and any(t in ["revenue_optimization", "security_decision"] for t in normalized_tasks):
        level = "high"
        notes.append("PRE-THRESHOLD doctrine")
    
    # Deescalation rules
    if time_budget_s is not None and time_budget_s <= 3:
        if level == "medium":
            level = "minimal"
        elif level == "high":
            level = "medium"
        notes.append("deescalated for time constraint")
    
    if token_budget is not None and token_budget <= 800 and level == "high":
        level = "medium"
        notes.append("deescalated for token constraint")
    
    # Set budgets based on final level
    budgets = {
        "minimal": {"tool_budget": 1, "token_guideline": 250},
        "medium": {"tool_budget": 3, "token_guideline": 900}, 
        "high": {"tool_budget": 5, "token_guideline": 2200}
    }
    
    result = budgets[level].copy()
    result["level"] = level
    result["notes"] = "; ".join(notes) if notes else f"base {base_level}"
    
    return result

if __name__ == "__main__":
    # Quick smoke test
    print("Testing reasoning effort policy...")
    print(f"status_check: {select_reasoning_effort('status_check')}")
    print(f"planning+integration (medium risk): {select_reasoning_effort(['planning','integration'], risk='medium')}")
    print(f"revenue_optimization (high risk, PRE-THRESHOLD): {select_reasoning_effort('revenue_optimization', risk='high', doctrine_pre_threshold=True)}")