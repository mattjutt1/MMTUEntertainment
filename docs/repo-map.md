# Repository Map – MMTU Entertainment

**Generated**: 2025-08-19  
**Purpose**: Structural overview for triage decisions

---

## Current Structure Analysis

### Key Directories
```
/apps/          - Application code
/packages/      - Shared packages  
/docs/          - Documentation
/.github/       - CI/CD workflows
/scripts/       - Automation scripts
```

### Inventory Files
- `.triage_files.txt` - All source files by type
- `.triage_dirs.txt` - Directory structure
- `.triage_deps.txt` - Package dependencies
- `.triage_sizes.txt` - Size analysis by directory
- `.triage_status.txt` - Git status snapshot
- `.triage_recent.txt` - Recent commit history

### Assessment Categories

#### 🟢 Keep (Revenue Core)
- Business logic and customer-facing features
- Revenue optimization systems
- Core infrastructure and CI/CD

#### 🟡 Review (Potential Value)  
- Experimental features with business potential
- Development tooling and automation
- Documentation and guides

#### 🔴 Archive Candidates (Low Impact)
- Unused dependencies and old experiments
- Duplicate functionality
- Non-essential development artifacts

---

## Next Phase: Detailed Triage
1. Review inventory files for patterns
2. Classify each component by business value
3. Create migration plan for archive candidates
4. Execute controlled cleanup with rollback capability

*This map enables data-driven triage decisions.*