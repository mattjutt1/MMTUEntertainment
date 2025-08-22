# VSCode IDE Mode - Available Tools & Features Report

## IDE-Specific Tools (MCP Integration)

### 1. **mcp__ide__getDiagnostics**
- **Purpose**: Retrieve language diagnostics from VSCode
- **Capabilities**:
  - Get diagnostics for specific files (by URI)
  - Get diagnostics for all open files
  - Shows errors, warnings, and info messages from language servers
  - Useful for identifying syntax errors, type issues, and linting problems

### 2. **mcp__ide__executeCode**
- **Purpose**: Execute Python code in Jupyter kernel
- **Capabilities**:
  - Run code in the current notebook's Jupyter kernel
  - Code execution persists across calls (stateful)
  - Interactive data analysis and visualization
  - Access to notebook variables and state

## Core Development Tools

### 3. **Read**
- Read any file from the filesystem
- Support for images (PNG, JPG, etc.)
- PDF reading with text and visual extraction
- Jupyter notebook (.ipynb) reading with outputs
- Line-by-line reading with line numbers
- Partial file reading with offset and limit

### 4. **Write**
- Create new files
- Overwrite existing files
- Requires prior Read for existing files

### 5. **Edit**
- Exact string replacement in files
- Single edit operations
- Preserves indentation and formatting
- Optional replace_all for multiple occurrences

### 6. **MultiEdit**
- Multiple edits to a single file in one operation
- Sequential edit application
- Atomic operations (all succeed or none)
- More efficient than multiple Edit calls

### 7. **NotebookEdit**
- Edit Jupyter notebook cells
- Insert/delete/replace cells
- Support for code and markdown cells
- Cell ID-based editing

## Search & Navigation Tools

### 8. **Grep**
- Ripgrep-based search
- Full regex support
- File filtering by glob or type
- Multiple output modes (content/files/count)
- Context lines support (-A/-B/-C)
- Multiline pattern matching

### 9. **Glob**
- Fast file pattern matching
- Supports glob patterns (*.js, **/*.ts)
- Returns paths sorted by modification time

### 10. **LS**
- List directory contents
- Requires absolute paths
- Optional ignore patterns

## Command Execution

### 11. **Bash**
- Execute shell commands
- Persistent shell sessions
- Background execution support
- Timeout configuration (up to 10 minutes)
- Git operations support

### 12. **BashOutput**
- Monitor background shell output
- Retrieve stdout/stderr
- Regex filtering support
- Incremental output reading

### 13. **KillBash**
- Terminate background shells
- Clean process management

## Web & Research Tools

### 14. **WebSearch**
- Search the web for current information
- Domain filtering (allow/block lists)
- US-only availability
- Up-to-date information retrieval

### 15. **WebFetch**
- Fetch and analyze web content
- HTML to markdown conversion
- AI-powered content processing
- 15-minute cache for efficiency
- Redirect handling

## Task Management

### 16. **TodoWrite**
- Create and manage task lists
- Track progress (pending/in_progress/completed)
- Organize complex multi-step tasks
- Real-time status updates

### 17. **ExitPlanMode**
- Exit planning mode when ready to code
- Present implementation plans for approval

## Automation & Agents

### 18. **Task**
- Launch specialized agents for complex tasks
- Available agent types:
  - **general-purpose**: Research, code search, multi-step tasks
  - **statusline-setup**: Configure status line settings
  - **output-style-setup**: Create output styles
- Concurrent agent execution support
- Stateless agent invocations

## VSCode-Specific Features

### Language Server Integration
- Real-time error detection via diagnostics
- Type checking support
- Linting integration
- IntelliSense data access

### Jupyter Integration
- Execute code in notebook kernels
- Access to notebook state and variables
- Interactive development support
- Persistent kernel sessions

### File System Integration
- Direct file access and modification
- Support for all VSCode-supported file types
- Workspace-aware operations

## Git Integration Features
- Full git command support via Bash
- Commit creation with co-authoring
- Pull request creation and management (via gh)
- Branch operations
- Repository status and diff viewing

## Security & Best Practices
- Defensive security focus only
- No malicious code creation
- Secret/key protection
- Secure file handling
- Permission-aware operations

## Limitations & Notes
- Web search US-only
- 30,000 character output limit for commands
- 2-minute default timeout (10-minute max)
- File paths must be absolute
- Read before Edit requirement for existing files

## Usage Optimization Tips
1. Batch multiple tool calls for parallel execution
2. Use Task agents for complex searches
3. Prefer Grep/Glob over find/grep commands
4. Use MultiEdit for multiple changes to same file
5. Track complex tasks with TodoWrite
6. Use IDE diagnostics for real-time error checking
7. Leverage Jupyter execution for data analysis tasks

---
*Generated: 2025-08-22*
*Environment: VSCode IDE Mode with MCP Integration*