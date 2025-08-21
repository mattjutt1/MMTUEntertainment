# Business-Ops MCP Server Examples

Example MCP server configurations for the Business-Ops Starter Stack, enabling Claude Code integration with Gmail, Google Drive, and Supabase.

## Quick Setup

1. **Install Claude Desktop**: Download from [Anthropic](https://claude.ai/download)
2. **Copy Configuration**: 
   ```bash
   cp docs/mcp/examples/claude-desktop.json ~/.claude/claude-desktop.json
   ```
3. **Configure API Keys**: Follow setup guides below
4. **Restart Claude Desktop**

## MCP Servers

### Gmail (@gongrzhe/server-gmail-autoauth-mcp)
- **Repository**: https://github.com/gongrzhe/server-gmail-autoauth-mcp
- **NPM**: https://www.npmjs.com/package/@gongrzhe/server-gmail-autoauth-mcp
- **Capabilities**: Send emails, read inbox, manage labels
- **OAuth Setup**: Gmail API + OAuth 2.0 credentials

### Google Drive (@isaacphi/mcp-gdrive)  
- **Repository**: https://github.com/isaacphi/mcp-gdrive
- **Registry**: https://mcp-get.com/servers/gdrive
- **Capabilities**: Search Drive, read/write Sheets, file management
- **OAuth Setup**: Drive API + Sheets API credentials

### Supabase (supabase-community)
- **Repository**: https://github.com/supabase-community/supabase-mcp
- **Docs**: https://supabase.com/docs/guides/ai/mcp
- **Capabilities**: Query tables, read schema, database operations
- **Setup**: Project URL + API keys

## Testing & Validation

**MCP Inspector**: Visual testing tool
```bash
npx @modelcontextprotocol/inspector
# Open http://localhost:6274
```

## Official Documentation

- **Claude Code MCP**: https://docs.anthropic.com/en/docs/claude-code/mcp
- **MCP Settings**: https://docs.anthropic.com/en/docs/claude-code/settings  
- **MCP Protocol**: https://modelcontextprotocol.io/

## Business Workflow Integration

These MCP servers integrate with the Business-Ops stack services:
- **EspoCRM**: CRM data export to Sheets, automated email campaigns
- **Zammad**: Support ticket notifications via Gmail, document attachments from Drive
- **Documenso**: Signed document storage in Drive, completion notifications
- **Listmonk**: Subscriber data analysis in Sheets, campaign performance tracking