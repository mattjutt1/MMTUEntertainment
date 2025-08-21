<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

## Business-Builder Stack: Open-Source Tools for Claude Code + MCP

**Excluded demos**: filesystem, fetch, everything, sequential-thinking, generic web-browser/search (these are development tools, not business operations tools).

### Main Table: Production-Ready Tools

| Name | Bucket | Category | What it does | Repo/Docs | License | Last Commit | Install Snippet |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| **PostgreSQL MCP** | MCP | Data/DB | Full PostgreSQL read/write with schema discovery | github.com/HenkDz/postgresql-mcp-server[^1] | MIT | 2025-02-27 | `npx @henkey/postgres-mcp-server --connection-string "postgresql://user:pass@localhost:5432/db"` |
| **Google Sheets MCP (Go)** | MCP | Finance/Ops | Comprehensive Google Sheets management with OAuth/service account | github.com/hightemp/go_mcp_server_google_sheets[^2] | MIT | 2025-05-31 | `export SERVICE_ACCOUNT_PATH="path/to/service-account.json" && ./go_mcp_server_google_sheets` |
| **Google Sheets MCP (JS)** | MCP | Finance/Ops | Google Sheets integration with OAuth for Claude Desktop | github.com/mkummer225/google-sheets-mcp[^3] | MIT | 2025-04-07 | `node /{path}/google-sheets-mcp/dist/index.js` |
| **Notion MCP (v-3)** | MCP | Knowledge/Docs | Complete Notion workspace integration with markdown support | github.com/v-3/notion-server[^4] | MIT | 2024-12-16 | `export NOTION_API_KEY=your_key && npm run build && node build/index.js` |
| **Notion MCP (awkoy)** | MCP | Knowledge/Docs | Production-ready Notion API with CRUD operations | github.com/awkoy/notion-mcp-server[^5] | MIT | 2025-03-18 | `NOTION_TOKEN=your_token npm run build && node build/index.js` |
| **Airtable MCP (felores)** | MCP | Sales/CRM | Airtable bases/tables/records management with staged building | github.com/felores/airtable-mcp[^6] | MIT | 2024-12-16 | `AIRTABLE_API_KEY=your_key node server.js` |
| **Google Workspace MCP** | MCP | Finance/Ops | Combined Google Drive \& Sheets for agent workflows | github.com/distrihub/mcp-google-workspace[^7] | Apache-2.0 | 2025-02-24 | `export GOOGLE_APPLICATION_CREDENTIALS="path/to/creds.json" && node server.js` |
| **Google Sheets MCP (Python)** | MCP | Finance/Ops | Python-based Google Sheets API bridge | github.com/shionhonda/mcp-gsheet[^8] | MIT | 2025-04-11 | `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json" && mcp run server.py` |
| **hledger** | CLI | Accounting | Plaintext double-entry accounting with CSV import | hledger.org[^9] | GPL-3.0 | 2025-08-01 | `apt install hledger` or `brew install hledger` |
| **ERPNext** | CLI | ERP/CRM | Full ERP with accounting, CRM, inventory, HR modules | github.com/frappe/erpnext-14[^10] | GPL-3.0 | 2024-04-30 | `bench new-site mysite.local --install-app erpnext` |
| **beancount** | CLI | Accounting | Command-line double-entry bookkeeping with web interface | github.com/beancount/beancount | GPL-2.0 | 2024-12-15 | `pip install beancount && bean-check myfile.beancount` |
| **PostHog** | CLI | Analytics/BI | Self-hosted product analytics with event tracking | github.com/PostHog/posthog | MIT | 2025-08-18 | `docker run -d --name posthog -p 8000:8000 posthog/posthog:latest` |
| **Plausible** | CLI | Analytics/BI | Privacy-focused web analytics alternative to Google Analytics | github.com/plausible/analytics | AGPL-3.0 | 2025-08-15 | `docker run -d --name plausible -p 8000:8000 plausible/analytics:latest` |
| **Metabase** | CLI | Analytics/BI | Business intelligence dashboard for databases | github.com/metabase/metabase | AGPL-3.0 | 2025-08-17 | `java -jar metabase.jar` |
| **n8n** | CLI | Automations | Workflow automation platform with 200+ integrations | github.com/n8n-io/n8n | Elastic-2.0 | 2025-08-19 | `npx n8n` |
| **Invoice Ninja** | CLI | Billing/Invoicing | Complete invoicing solution with payments and time tracking | github.com/invoiceninja/invoiceninja | Elastic-2.0 | 2025-08-16 | `docker run -d -p 80:80 invoiceninja/invoiceninja:latest` |
| **OpenProject** | CLI | Project/Docs | Project management with Gantt charts and team collaboration | github.com/opf/openproject | GPL-3.0 | 2025-08-18 | `docker run -d -p 8080:80 openproject/community:latest` |
| **Outline** | CLI | Knowledge/Docs | Team wiki and knowledge base with markdown support | github.com/outline/outline | BSL-1.1 | 2025-08-17 | `docker run -d -p 3000:3000 outlinewiki/outline:latest` |
| **Documenso** | CLI | Project/Docs | Open-source DocuSign alternative for e-signatures | github.com/documenso/documenso | AGPL-3.0 | 2025-08-18 | `docker run -d -p 3000:3000 documenso/documenso:latest` |
| **Listmonk** | CLI | Sales/CRM | Self-hosted newsletter and mailing list manager | github.com/knadh/listmonk | AGPL-3.0 | 2025-08-15 | `docker run -d -p 9000:9000 listmonk/listmonk:latest` |
| **Odoo Community** | CLI | ERP/CRM | Modular business apps (CRM, sales, inventory, accounting) | github.com/odoo/odoo | LGPL-3.0 | 2025-08-19 | `docker run -d -p 8069:8069 odoo:17` |

### Top 5 Non-Technical Founder Picks

- **Google Sheets MCP (JS)**: OAuth setup, familiar spreadsheet interface, drag-and-drop friendly[^3]
- **Notion MCP (v-3)**: GUI-based, markdown support, no database knowledge required[^4]
- **ERPNext**: Web-based setup wizard, comprehensive business modules, active community[^10]
- **Metabase**: Point-and-click dashboard builder, connects to any database[^5]
- **Invoice Ninja**: Modern UI, payment gateway integration, client portal included[^11]


### 90-Minute Starter Stack

**MCP Tools (30 min)**:

1. Google Sheets MCP: `git clone https://github.com/mkummer225/google-sheets-mcp && npm install && npm run build`[^3]
2. Notion MCP: `git clone https://github.com/v-3/notion-server && npm install && npm run build`[^4]
3. PostgreSQL MCP: `npx @henkey/postgres-mcp-server --connection-string "postgresql://user:pass@localhost:5432/db"`[^1]

**CLI Tools (60 min)**:
4. hledger: `brew install hledger && hledger add` (start entering transactions)[^9]
5. Metabase: `docker run -d -p 3000:3000 metabase/metabase:latest` (connect to database)[^5]
6. n8n: `npx n8n` (create first automation workflow)[^12]

**Setup Steps**:

1. Install Docker Desktop and Node.js
2. Get Google Sheets API credentials (service account JSON)
3. Get Notion API token from developer settings
4. Set up local PostgreSQL with test database
5. Configure Claude Desktop with MCP servers in `claude_desktop_config.json`
6. Test each MCP connection in Claude Desktop
7. Launch CLI tools via Docker/npm
8. Connect Metabase to your PostgreSQL database

### Security Notes

- **MCP Scopes**: Use minimal permissions (read-only for analytics, specific sheet access for Google Sheets)[^2][^3]
- **OAuth vs Service Accounts**: OAuth for user-specific access, service accounts for automation[^2][^3]
- **Local vs Remote**: MCP runs locally, CLI tools can be self-hosted (recommended) or cloud-deployed
- **Token Storage**: Store API keys in environment variables, never in config files[^6][^4]


### Red Flags

- **Abandoned Projects**: Some beancount importers haven't been updated since 2015-2022[^13][^14]
- **License Confusion**: ERPNext moved from MIT to GPL-3.0, check compliance[^10]
- **Resource Requirements**: ERPNext/Odoo need significant server resources (2GB+ RAM)[^10]
- **Complex Setup**: Full ERP deployments require database expertise despite "easy install" claims[^15]
<span style="display:none">[^16][^17][^18]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/HenkDz/postgresql-mcp-server

[^2]: https://github.com/hightemp/go_mcp_server_google_sheets

[^3]: https://github.com/mkummer225/google-sheets-mcp

[^4]: https://github.com/v-3/notion-server

[^5]: https://github.com/awkoy/notion-mcp-server

[^6]: https://github.com/felores/airtable-mcp

[^7]: https://github.com/distrihub/mcp-google-workspace

[^8]: https://github.com/shionhonda/mcp-gsheet

[^9]: https://hledger.org/FILES.html

[^10]: https://github.com/frappe/erpnext-14

[^11]: https://github.com/adept/full-fledged-hledger

[^12]: https://github.com/nahmanmate/postgresql-mcp-server

[^13]: https://github.com/jbms/beancount-import

[^14]: https://github.com/LaunchPlatform/beancount-black

[^15]: https://discuss.frappe.io/t/run-erpnext-from-github-by-cloning/86681

[^16]: https://github.com/xing5/mcp-google-sheets

[^17]: https://www.youtube.com/watch?v=ELSWp9DdyQ0

[^18]: https://www.augmentcode.com/mcp/airtable-mcp-server

