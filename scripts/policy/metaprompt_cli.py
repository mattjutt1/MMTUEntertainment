#!/usr/bin/env python3
"""
Metaprompt CLI - JSON interface for contradiction detection and fixing.
Usage: python metaprompt_cli.py "instruction text"
"""

import json
import sys
import os

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from metaprompt_optimizer import optimize_metaprompt

def main():
    if len(sys.argv) < 2:
        instruction_text = "Never delay.\nVerify thoroughly."  # Default test case
    else:
        instruction_text = " ".join(sys.argv[1:])
    
    result = optimize_metaprompt(instruction_text)
    
    # Format for JSON output
    output = {
        "issues": result["issues"],
        "fixed_text": result["fixed_text"], 
        "diff": result["diff"],
        "status": result["status"],
        "issues_count": len(result["issues"]),
        "optimizer_note_present": "optimizer-note" in result["fixed_text"]
    }
    
    print(json.dumps(output, indent=2))

if __name__ == "__main__":
    main()