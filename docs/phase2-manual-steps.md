# Phase 2 Manual Steps - Pabrai Governance

## Overview
Phase 2 requires GitHub project board creation and workflow testing that need interactive authentication.

## Manual Step 1: Create Business Action Tracks Project Board

### Prerequisites
- GitHub CLI with project permissions: `gh auth refresh -s project,read:project --hostname github.com`

### Creation Command
```bash
gh project create --title "Business Action Tracks – 2025H2" --owner "@me"
```

### Project Board Configuration
Once created, configure the project with these fields:

**Status Field Options:**
- `Backlog` - Parked initiatives (outside ≤3 bet limit)
- `Active` - Current development track (≤3 maximum)
- `Done` - Completed initiatives
- `Killed` - Stopped initiatives (failed kill criteria)

**Custom Fields to Add:**
- **Upside Potential** (Select): 2x, 5x, 10x, 50x
- **Downside Risk** (Number): Max loss amount in USD
- **Kill Date** (Date): 4-week review deadline
- **Circle of Competence** (Select): Core, Adjacent, Outside
- **Business Metric** (Select): ARR, Conversion, W4 Retention, Cost

### Governance Rules
- **≤3 Active bets** maximum at any time
- **4-week kill/scale cycles** for all Active items
- **Kill criteria** defined in item description
- **Weekly reviews** via automated digest workflow

## Manual Step 2: Test Weekly Digest Workflow

### Prerequisites
- Business Action Tracks project created and configured
- Workflow file already committed: `.github/workflows/weekly-market-digest.yml`

### Testing Steps

1. **Trigger Manual Workflow Run:**
   ```bash
   gh workflow run weekly-market-digest.yml
   ```

2. **Monitor Execution:**
   ```bash
   gh run list --workflow=weekly-market-digest.yml
   gh run view [run-id] --log
   ```

3. **Verify Outputs:**
   - Weekly digest artifact generated
   - Active bet count calculated correctly
   - Governance compliance check (≤3 bets)
   - Review action items populated

### Expected Outputs
The workflow generates a `digest.md` file with:
- Active bet status from project board
- Completed items from past week
- Governance metrics (bet count, compliance)
- Weekly review checklist

## Integration Notes

### Workflow Dependencies
- Project board: "Business Action Tracks – 2025H2"
- GitHub token with project read permissions
- Proper status field configuration

### Governance Enforcement
- Automated weekly generation (Monday 9 AM UTC)
- Manual trigger capability for immediate reviews
- Concentration discipline monitoring (≤3 active bets)
- Kill/scale decision support with 4-week cycles

## Next Steps
After manual completion:
1. Verify workflow execution success
2. Add sample project items for testing
3. Validate governance metrics accuracy
4. Proceed to Phase 3 operationalization

## Reference
- **Refactor Plan**: `docs/refactor-plan-pabrai.md`
- **Workflow File**: `.github/workflows/weekly-market-digest.yml`
- **Pivot Rules**: `docs/pivot-rules.md`