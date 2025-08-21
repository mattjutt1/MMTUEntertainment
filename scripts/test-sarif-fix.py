#!/usr/bin/env python3
"""
Test script for the Grype SARIF fix functionality.
Creates a sample SARIF with the problematic empty artifact locations
and verifies the fix works correctly.
"""

import json
import os
import tempfile
import subprocess
import sys

def create_test_sarif():
    """Create a test SARIF file with empty artifact locations (the problem case)."""
    sarif_data = {
        "version": "2.1.0",
        "$schema": "https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json",
        "runs": [
            {
                "tool": {
                    "driver": {
                        "name": "grype",
                        "version": "0.97.1"
                    }
                },
                "results": [
                    {
                        "ruleId": "CVE-2024-1234",
                        "ruleIndex": 0,
                        "message": {
                            "text": "Test vulnerability with empty artifact location"
                        },
                        "level": "error",
                        "locations": [
                            {
                                "physicalLocation": {
                                    "artifactLocation": {
                                        "uri": "",  # This is the problematic empty URI
                                        "uriBaseId": "ROOTPATH"
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "ruleId": "CVE-2024-5678",
                        "ruleIndex": 1,
                        "message": {
                            "text": "Another test vulnerability"
                        },
                        "level": "warning",
                        "locations": [
                            {
                                "physicalLocation": {
                                    "artifactLocation": {
                                        "uri": "   ",  # This is also problematic (whitespace only)
                                        "uriBaseId": "ROOTPATH"
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    }
    return sarif_data

def test_sarif_fix():
    """Test the SARIF fix script."""
    print("🧪 Testing Grype SARIF fix script...")
    
    # Create temporary files
    with tempfile.NamedTemporaryFile(mode='w', suffix='.sarif', delete=False) as input_file:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.sarif', delete=False) as output_file:
            input_path = input_file.name
            output_path = output_file.name
    
    try:
        # Create test SARIF with problematic empty URIs
        test_sarif = create_test_sarif()
        with open(input_path, 'w') as f:
            json.dump(test_sarif, f, indent=2)
        
        print(f"📝 Created test SARIF: {input_path}")
        
        # Run the fix script
        script_path = os.path.join(os.path.dirname(__file__), 'fix-grype-sarif.py')
        result = subprocess.run([
            sys.executable, script_path, input_path, output_path
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ Script failed with return code {result.returncode}")
            print(f"STDERR: {result.stderr}")
            return False
        
        print("✅ Script executed successfully")
        print(f"STDOUT: {result.stdout}")
        
        # Load and verify the fixed SARIF
        with open(output_path, 'r') as f:
            fixed_sarif = json.load(f)
        
        # Verify the structure is intact
        assert 'runs' in fixed_sarif, "Missing runs array"
        assert len(fixed_sarif['runs']) == 1, "Wrong number of runs"
        
        run = fixed_sarif['runs'][0]
        assert 'results' in run, "Missing results array"
        assert len(run['results']) == 2, "Wrong number of results"
        
        # Verify the empty URIs were fixed
        for i, result in enumerate(run['results']):
            locations = result.get('locations', [])
            assert len(locations) > 0, f"Result {i} has no locations"
            
            for location in locations:
                artifact_location = location['physicalLocation']['artifactLocation']
                uri = artifact_location['uri']
                
                # Verify URI is no longer empty
                assert uri and uri.strip(), f"Result {i} still has empty URI: '{uri}'"
                assert uri.startswith('dependency-scan/'), f"Result {i} URI doesn't have expected prefix: '{uri}'"
                
                print(f"✅ Result {i} URI fixed: {uri}")
        
        print("🎉 All tests passed! SARIF fix script works correctly.")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
        
    finally:
        # Clean up temporary files
        for path in [input_path, output_path]:
            if os.path.exists(path):
                os.unlink(path)

if __name__ == '__main__':
    success = test_sarif_fix()
    sys.exit(0 if success else 1)