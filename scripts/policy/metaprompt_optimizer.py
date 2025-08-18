#!/usr/bin/env python3
"""
Metaprompt Optimizer - Contradiction Detector & Minimal Fixer
Detects logical contradictions in instruction text and provides minimal fixes.
"""

import re
import difflib
from datetime import datetime

def detect_contradictions(text):
    """
    Detect logical contradictions in instruction text.
    Returns list of issues found.
    """
    issues = []
    
    # Common contradiction patterns
    patterns = [
        # Speed vs Quality contradictions
        (r'(?i)(never\s+delay|immediately|urgent|fast)', r'(?i)(verify\s+thoroughly|double.?check|careful|meticulous)', 
         "Speed vs Quality: Instructions demand both urgency and thorough verification"),
        
        # Scope contradictions  
        (r'(?i)(minimal|simple|quick)', r'(?i)(comprehensive|exhaustive|complete)', 
         "Scope contradiction: Both minimal and comprehensive requirements"),
         
        # Precision contradictions
        (r'(?i)(approximate|rough|estimate)', r'(?i)(exact|precise|accurate)', 
         "Precision contradiction: Both approximate and exact requirements"),
    ]
    
    for pattern1, pattern2, description in patterns:
        if re.search(pattern1, text) and re.search(pattern2, text):
            issues.append({
                "type": "contradiction",
                "description": description,
                "pattern1": pattern1,
                "pattern2": pattern2
            })
    
    return issues

def fix_contradictions(text, issues):
    """
    Apply minimal fixes to detected contradictions.
    Returns fixed text with optimizer note.
    """
    if not issues:
        return text
        
    fixed_text = text
    
    # Apply simple heuristic fixes
    for issue in issues:
        if "Speed vs Quality" in issue["description"]:
            # Prioritize quality over speed
            fixed_text = re.sub(r'(?i)never\s+delay', 'prioritize quality', fixed_text)
            fixed_text = re.sub(r'(?i)immediately', 'promptly', fixed_text)
            
    # Add optimizer note
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M")
    optimizer_note = f"\n\n[optimizer-note {timestamp}]: Fixed {len(issues)} contradiction(s) - prioritized quality over speed"
    fixed_text += optimizer_note
    
    return fixed_text

def generate_diff(original, fixed):
    """Generate unified diff between original and fixed text."""
    original_lines = original.splitlines(keepends=True)
    fixed_lines = fixed.splitlines(keepends=True)
    
    diff = list(difflib.unified_diff(
        original_lines, 
        fixed_lines,
        fromfile='original', 
        tofile='fixed',
        lineterm=''
    ))
    
    return ''.join(diff)

def optimize_metaprompt(text):
    """
    Main optimization function.
    Returns dict with issues, fixed_text, and diff.
    """
    issues = detect_contradictions(text)
    fixed_text = fix_contradictions(text, issues)
    diff = generate_diff(text, fixed_text) if issues else ""
    
    return {
        "issues": issues,
        "fixed_text": fixed_text,
        "diff": diff,
        "status": "optimized" if issues else "clean"
    }

if __name__ == "__main__":
    # Test case
    test_text = "Never delay.\nVerify thoroughly."
    result = optimize_metaprompt(test_text)
    print(f"Issues found: {len(result['issues'])}")
    print(f"Fixed text contains optimizer-note: {'optimizer-note' in result['fixed_text']}")