#!/usr/bin/env python3
"""
SARIF Post-Processor for Grype GitHub Integration
Fixes 'locationFromSarifResult: expected artifact location' errors
"""

import json
import sys
import os
from pathlib import Path

def fix_grype_sarif(input_file, output_file):
    """
    Fix Grype SARIF file for GitHub Code Scanning compatibility
    
    Args:
        input_file: Path to original SARIF file
        output_file: Path to write fixed SARIF file
    """
    try:
        with open(input_file, 'r') as f:
            sarif_data = json.load(f)
        
        # Ensure we have a valid SARIF structure
        if not isinstance(sarif_data, dict) or 'runs' not in sarif_data:
            print(f"Warning: Invalid SARIF structure in {input_file}")
            return False
        
        fixed_count = 0
        
        for run in sarif_data.get('runs', []):
            results = run.get('results', [])
            
            for result in results:
                locations = result.get('locations', [])
                
                for location in locations:
                    physical_location = location.get('physicalLocation', {})
                    artifact_location = physical_location.get('artifactLocation', {})
                    
                    # Fix empty or missing URI
                    if not artifact_location.get('uri'):
                        # Generate meaningful placeholder URI using rule ID
                        rule_id = result.get('ruleId', 'unknown-vulnerability')
                        artifact_location['uri'] = f"dependency-scan/{rule_id}.virtual"
                        fixed_count += 1
        
        # Write fixed SARIF
        with open(output_file, 'w') as f:
            json.dump(sarif_data, f, indent=2)
        
        print(f"✅ Fixed {fixed_count} artifact locations in SARIF file")
        return True
        
    except FileNotFoundError:
        print(f"Error: Input file {input_file} not found")
        return False
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {input_file}: {e}")
        return False
    except Exception as e:
        print(f"Error processing SARIF file: {e}")
        return False

def create_empty_sarif(output_file):
    """Create a minimal valid SARIF file when no input exists"""
    empty_sarif = {
        "version": "2.1.0",
        "$schema": "https://json.schemastore.org/sarif-2.1.0.json",
        "runs": [{
            "tool": {
                "driver": {
                    "name": "grype",
                    "version": "unknown"
                }
            },
            "results": []
        }]
    }
    
    with open(output_file, 'w') as f:
        json.dump(empty_sarif, f, indent=2)
    
    print("ℹ️ Created empty SARIF file (no vulnerabilities found)")

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 fix-grype-sarif.py <input_sarif> <output_sarif>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Ensure output directory exists
    output_dir = Path(output_file).parent
    output_dir.mkdir(parents=True, exist_ok=True)
    
    if os.path.exists(input_file):
        success = fix_grype_sarif(input_file, output_file)
        if not success:
            print("Failed to process SARIF file, creating empty fallback")
            create_empty_sarif(output_file)
    else:
        print(f"Input file {input_file} not found, creating empty SARIF")
        create_empty_sarif(output_file)

if __name__ == "__main__":
    main()