#!/usr/bin/env python
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from reasoning import select_reasoning_effort
task = " ".join(sys.argv[1:]) or "standard_analysis"
effort = select_reasoning_effort(task)
budgets = {"minimal": (1, 250), "medium": (3, 900), "high": (5, 2200)}[effort["level"]]
print(json.dumps({"task": task, "effort": effort,
                  "tool_budget": budgets[0], "token_budget": budgets[1]}))