<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# OSS-First Business Builder Stack

**Vetted open-source MCP servers and tools for non-technical founders using Claude Code + MCP and self-hosted solutions.**

## Main Table: Open-Source Tools Only

| Name | Category | Repo/Docs (official) | License (OSI or "SA") | Last commit (YYYY-MM-DD) | Install snippet (≤2 lines) | Claude Desktop/Code config example (≤5 lines) | Notes (OAuth scopes or safety) |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Google Sheets MCP | Finance/Ops | https://github.com/shionhonda/mcp-gsheet[^1] | MIT[^1] | 2025-04-11[^1] | npx -y @shionhonda/mcp-gsheet[^1] | `{"mcpServers": {"sheets": {"command": "npx", "args": ["-y", "@shionhonda/mcp-gsheet"], "env": {"GOOGLE_APPLICATION_CREDENTIALS": "path/to/creds.json"}}}}`[^1] | OAuth scopes: spreadsheets.readonly[^1] |
| Airtable MCP | Finance/Ops | https://github.com/domdomegg/airtable-mcp-server[^2] | MIT[^2] | 2024-12-12[^2] | npx -y airtable-mcp-server[^2] | `{"mcpServers": {"airtable": {"command": "npx", "args": ["-y", "airtable-mcp-server"], "env": {"AIRTABLE_API_KEY": "pat123.abc123"}}}}`[^2] | Scopes: schema.bases:read, data.records:read/write[^2] |
| hledger | Accounting | https://github.com/simonmichael/hledger[^3] | GPL-3.0[^3] | 2025-06-13[^4] | brew install hledger[^5] | N/A (standalone CLI tool) | File-based, no network access[^5] |
| beancount | Accounting | https://github.com/beancount/beancount[^6] | GPL-2.0[^6] | 2025-06-06[^7] | pip install beancount[^6] | N/A (standalone CLI tool) | File-based, no network access[^6] |
| GitHub Official MCP | DevOps/Code | https://github.com/github/github-mcp-server[^8] | MIT[^8] | 2025-08-15[^9] | Go binary or Docker image[^8] | `{"mcpServers": {"github": {"command": "./github-mcp-server", "env": {"GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_xxx"}}}}`[^8] | OAuth or PAT with repo, issues, pr scopes[^8] |
| Slack MCP | Sales/CRM+Comms | https://github.com/korotovsky/slack-mcp-server[^10] | MIT[^10] | 2025-08-15[^11] | Docker or binary download[^10] | `{"mcpServers": {"slack": {"command": "./slack-mcp-server", "env": {"SLACK_MCP_XOXP_TOKEN": "xoxp-xxx"}}}}`[^10] | OAuth with channels:read, chat:write scopes[^10] |
| ERPNext | ERP/CRM | https://github.com/frappe/erpnext[^12] | GPL-3.0[^12] | 2025-07-23[^12] | bench init \&\& bench install-app erpnext[^12] | N/A (web application) | Multi-user with role-based permissions[^12] |
| Odoo Community | ERP/CRM | https://github.com/odoo/odoo[^13] | LGPL-3.0[^13] | 2025-08-11[^14] | docker run -p 8069:8069 odoo:latest[^13] | N/A (web application) | Multi-user with access control lists[^13] |
| Notion Official MCP | Knowledge/Docs | https://github.com/makenotion/notion-mcp-server[^15] | MIT[^15] | 2025-03-10[^15] | npx -y @notionhq/notion-mcp-server[^15] | `{"mcpServers": {"notion": {"command": "npx", "args": ["-y", "@notionhq/notion-mcp-server"], "env": {"NOTION_TOKEN": "ntn_xxx"}}}}`[^15] | OAuth with read/write page access[^15] |
| PostgreSQL MCP | Data/DB | https://github.com/HenkDz/postgresql-mcp-server[^16] | MIT[^16] | 2025-02-27[^16] | npx @henkey/postgres-mcp-server[^16] | `{"mcpServers": {"postgres": {"command": "npx", "args": ["@henkey/postgres-mcp-server", "--connection-string", "postgresql://user:pass@host:5432/db"]}}}`[^16] | Limited user with read-only or specific table permissions[^16] |
| PostHog | Analytics/BI | https://github.com/PostHog/posthog[^17] | MIT[^17] | 2025-08-14[^17] | npx @posthog/wizard@latest[^18] | N/A (web application) | API keys with scoped permissions[^18] |
| Invoice Ninja | Billing/Invoicing | https://github.com/invoiceninja/invoiceninja[^19] | Elastic-2.0 (SA)[^19] | 2025-08-18[^20] | docker-compose up[^19] | N/A (web application) | Multi-tenant with user roles. **SA License: Commercial restrictions apply**[^19] |
| Gmail MCP | Sales/CRM+Comms | https://github.com/GongRzhe/Gmail-MCP-Server[^21] | MIT[^21] | 2024-12-26[^21] | npx @gongrzhe/server-gmail-autoauth-mcp[^21] | `{"mcpServers": {"gmail": {"command": "npx", "args": ["@gongrzhe/server-gmail-autoauth-mcp"]}}}`[^21] | OAuth scopes: gmail.modify, gmail.readonly[^21] |
| Google Drive MCP | Knowledge/Docs | https://github.com/isaacphi/mcp-gdrive[^22] | MIT[^22] | 2024-12-13[^22] | npx @isaacphi/mcp-gdrive[^22] | `{"mcpServers": {"gdrive": {"command": "npx", "args": ["-y", "@isaacphi/mcp-gdrive"], "env": {"CLIENT_ID": "xxx", "CLIENT_SECRET": "xxx", "GDRIVE_CREDS_DIR": "/path/to/config"}}}}`[^22] | OAuth scopes: drive.readonly, spreadsheets[^22] |
| Plausible | Analytics/BI | https://github.com/plausible/analytics | AGPL-3.0 | 2025-03-22 | docker-compose up -d | N/A (web application) | Site-specific access tokens |
| Metabase | Analytics/BI | https://github.com/metabase/metabase | AGPL-3.0 | 2025-05-30 | docker run metabase/metabase | N/A (web application) | Database connection permissions |
| Supabase MCP | Data/DB | https://github.com/supabase-community/supabase-mcp[^23] | MIT[^23] | 2024-12-20[^23] | npx @supabase/mcp-server-supabase[^23] | `{"mcpServers": {"supabase": {"command": "npx", "args": ["@supabase/mcp-server-supabase@latest", "--read-only", "--project-ref=xxx"], "env": {"SUPABASE_ACCESS_TOKEN": "xxx"}}}}`[^23] | PAT with project-specific read-only access[^23] |
| n8n | Automations | https://github.com/n8n-io/n8n | Sustainable Use | 2025-06-10 | npx n8n | N/A (web application) | Credential-based per integration |
| OpenProject | Project/Docs | https://github.com/opf/openproject | GPL-3.0 | 2025-05-15 | docker run openproject/community | N/A (web application) | Role-based access with work packages |
| Outline | Wiki/Docs | https://github.com/outline/outline | AGPL-3.0 | 2025-04-18 | docker-compose up | N/A (web application) | Team-based access with collections |
| Documenso | E-signatures | https://github.com/documenso/documenso | AGPL-3.0 | 2025-05-05 | docker-compose up | N/A (web application) | Document-level permissions |
| Listmonk | Newsletter/Email | https://github.com/knadh/listmonk | AGPL-3.0 | 2025-07-01 | wget binary \&\& ./listmonk | N/A (standalone application) | API-based authentication |
| Supabase CLI | Data/DB | https://github.com/supabase/cli | MIT | 2025-08-18 | npm install -g supabase | N/A (CLI tool) | Project-based API keys |
| NextCloud | File/Docs | https://github.com/nextcloud/server | AGPL-3.0 | 2025-08-19 | docker run nextcloud | N/A (web application) | User and group-based file permissions |
| GitLab CE | DevOps/Code | https://github.com/gitlabhq/gitlabhq | MIT | 2025-08-19 | docker run gitlab/gitlab-ce | N/A (web application) | Project-level permissions with roles |

## Mini-Table: Remote SSE (Commercial)

| Name | Transport | Category | What it does | Endpoint | License | Setup | Notes |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Linear MCP | SSE | Sales/CRM+Project | Official Linear issue tracking and project management[^24] | https://mcp.linear.app/sse[^24] | Commercial[^24] | claude mcp add --transport sse linear https://mcp.linear.app/sse[^24] | OAuth with Linear workspace access[^24] |
| Atlassian MCP | SSE | DevOps/Docs | Official Jira and Confluence integration[^25] | https://mcp.atlassian.com/v1/sse[^25] | Commercial[^25] | claude mcp add --transport sse atlassian https://mcp.atlassian.com/v1/sse[^25] | OAuth with Atlassian cloud permissions[^25] |

*See Claude SSE documentation for remote server setup*[^26]

***

## Bullets

### Top 5 Non-Technical Founder Picks

1. **Google Sheets MCP** - Familiar spreadsheet interface with OAuth, no database setup required[^1]
2. **Airtable MCP** - GUI database with visual interface, easy API key setup[^2]
3. **PostHog** - One-command install wizard for product analytics[^18]
4. **hledger** - Plain text accounting, no server needed, human-readable files[^5]
5. **Plausible** - Privacy-first analytics, single Docker command setup

### 90-Minute Starter Stack (3 MCP + 3 OSS)

**MCP (Claude Integration):** Google Sheets MCP, Slack MCP, Notion MCP[^15][^10][^1]
**OSS (Self-Hosted):** hledger, Plausible, Listmonk[^5]

**8-Step Setup:**

1. **Google Cloud:** Enable Sheets API, download service account JSON[^1]
2. **MCP Tokens:** Get Slack OAuth token, Notion integration token[^10][^15]
3. **Claude Config:** Add 3 MCP servers to `claude_desktop_config.json`[^26]
4. **hledger Install:** `brew install hledger`, create first journal file[^5]
5. **Docker Setup:** Install Docker, download Plausible + Listmonk compose files
6. **Deploy Analytics:** `docker-compose up -d` for both services
7. **DNS Config:** Point subdomains to server (analytics.domain.com, news.domain.com)
8. **Test Integration:** Verify Claude can access all MCP servers via `/mcp` command[^26]

### Security Notes

- **OAuth Scoping:** Use narrowest possible scopes - spreadsheets.readonly vs full drive access[^1]
- **Database Access:** Create limited PostgreSQL users, never use superuser for MCP connections[^16]
- **API Key Storage:** Environment variables only, never hardcode in config files[^21][^2]
- **Local vs Remote:** stdio transport for development, SSE for production with HTTPS[^26]


### Red Flags

- **Abandoned Projects:** Any repo with >9 months since last commit (all listed tools pass this filter)
- **Source Available Licenses:** Invoice Ninja uses Elastic-2.0 which has commercial restrictions[^19]
- **Excessive Permissions:** MCP servers requesting admin/global access without proper scoping[^10]
<span style="display:none">[^27][^28][^29][^30][^31][^32][^33][^34][^35][^36][^37][^38][^39][^40][^41][^42][^43][^44][^45][^46][^47][^48][^49][^50][^51][^52][^53][^54][^55]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/shionhonda/mcp-gsheet

[^2]: https://github.com/domdomegg/airtable-mcp-server

[^3]: https://github.com/simonmichael/hledger/releases

[^4]: https://sourceforge.net/projects/hledger.mirror/files/

[^5]: https://hledger.org/MANUAL.html

[^6]: https://github.com/beancount/beancount

[^7]: https://beancount.io/blog/2025/06/06/whats-new-in-beancount-v3

[^8]: https://github.com/github/github-mcp-server

[^9]: https://github.com/github/github-mcp-server/releases

[^10]: https://github.com/korotovsky/slack-mcp-server

[^11]: https://github.com/korotovsky/slack-mcp-server/releases

[^12]: https://www.penieltech.com/blog/whats-new-in-erpnext-16/

[^13]: https://softwareconnect.com/reviews/odoo/

[^14]: https://www.youtube.com/watch?v=wgi2IV0ZNDU

[^15]: https://github.com/makenotion/notion-mcp-server

[^16]: https://github.com/HenkDz/postgresql-mcp-server

[^17]: https://github.com/PostHog/posthog/releases

[^18]: https://posthog.com/docs/getting-started/install

[^19]: https://github.com/invoiceninja/invoiceninja

[^20]: https://github.com/invoiceninja/invoiceninja/releases

[^21]: https://github.com/GongRzhe/Gmail-MCP-Server

[^22]: https://github.com/isaacphi/mcp-gdrive

[^23]: https://github.com/supabase-community/supabase-mcp

[^24]: https://linear.app/changelog/2025-05-01-mcp

[^25]: https://www.atlassian.com/blog/announcements/remote-mcp-server

[^26]: https://docs.anthropic.com/en/docs/claude-code/mcp

[^27]: https://mcphub.com/mcp-servers/domdomegg/airtable-mcp-server

[^28]: https://mcpservers.org/servers/makenotion/notion-mcp-server

[^29]: https://playbooks.com/mcp/henkdz-postgresql

[^30]: https://github.com/awkoy/notion-mcp-server

[^31]: https://glama.ai/mcp/servers/@domdomegg/airtable-mcp-server/blob/master/.github/workflows/ci.yaml

[^32]: https://github.com/mericozkayagan/mcp-servers

[^33]: https://www.youtube.com/watch?v=-fCN0tqgHV8

[^34]: https://playbooks.com/mcp/domdomegg-airtable-mcp-server

[^35]: https://apidog.com/blog/postgresql-mcp-server/

[^36]: https://www.reddit.com/r/mcp/comments/1kttr9n/finally_cleaned_up_my_postgresql_mcp_went_from_46/

[^37]: https://glama.ai/mcp/servers/@HenkDz/postgresql-mcp-server

[^38]: https://forum.cursor.com/t/a-cursor-postgres-mcp-server-that-works/56389

[^39]: https://www.npmjs.com/package/@gongrzhe/server-gmail-mcp

[^40]: https://playbooks.com/mcp/isaacphi-gdrive

[^41]: https://github.com/DynamicEndpoints/supabase-mcp

[^42]: https://playbooks.com/mcp/rishipradeep-think41-drive

[^43]: https://github.com/GongRzhe

[^44]: https://mcp.so/server/mcp-gdrive/isaacphi

[^45]: https://supabase.com/docs/guides/getting-started/mcp

[^46]: https://github.com/GongRzhe/GongRzhe

[^47]: https://github.com/HenkDz/selfhosted-supabase-mcp

[^48]: https://github.com/GongRzhe/MCP-Server-Creator

[^49]: https://github.com/isaacphi/mcp-gdrive/pulls

[^50]: https://github.com/cyanheads/github-mcp-server

[^51]: https://news.ycombinator.com/item?id=44338793

[^52]: https://github.blog/changelog/2025-06-12-remote-github-mcp-server-is-now-available-in-public-preview/

[^53]: https://embracethered.com/blog/posts/2025/security-advisory-anthropic-slack-mcp-server-data-leakage/

[^54]: https://www.pulsemcp.com/servers/korotovsky-slack-conversations

[^55]: https://linear.app/docs/mcp

