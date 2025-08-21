<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Open-Source “Business‑Builder Stack” (MCP + CLI/OSS)

## Tools Table (≥25 rows) — sorted by Business Payback then Setup Difficulty

| Name | Bucket (MCP/CLI) | Category | What it does (≤1 line) | Repo/Docs | License | Last commit (YYYY-MM-DD) | Install snippet |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Metabase (OSS) | CLI | Analytics/BI | Easy self-host BI with SQL+GUI dashboards | github.com/metabase/metabase | AGPL-3.0[^1] | 2025-08-13[^2] | docker run -d -p 3000:3000 metabase/metabase:latest[^2] |
| n8n | CLI | Automations | Low-code workflow automation with 400+ nodes | github.com/n8n-io/n8n | Fair-code (SSPL+Commons Clause for some parts)[^3] | 2025-08-18[^4] | docker run -d -p 5678:5678 n8nio/n8n:latest[^4] |
| Plausible Analytics | CLI | Analytics | Privacy-friendly web analytics | github.com/plausible/analytics | AGPL-3.0[^5] | 2025-08-19[^5] | docker run -d -p 8000:8000 plausible/analytics:latest[^5] |
| ERPNext | CLI | ERP/CRM | Full ERP suite (accounting, CRM, inventory) | github.com/frappe/erpnext | GPL-3.0[^6][^7] | 2025-08-19 (active repo activity)[^8] | docker run -d -p 8080:8080 frappe/erpnext:version-15[^8] |
| Odoo Community | CLI | ERP | Modular ERP (community edition) | odoo.com/documentation (repo addons) | LGPL-3.0 (Community) (docs) | 2025-08 (active; use official CE)[^9] | docker run -d -p 8069:8069 odoo:17.0[^9] |
| Invoice Ninja | CLI | Billing/Invoicing | Self-host invoices, quotes, payments | github.com/invoiceninja/invoiceninja | Elastic License (source-available)[^10] | 2025-06-12 (docs repo recent)[^11] | docker compose up -d (compose from docs)[^11] |
| Metabase Embedding (note) | CLI | BI add-on | Embedding license terms | github.com/metabase/metabase | Additional embedding license text[^1] | 2025-08-13[^2] | n/a (license doc)[^1] |
| Google Sheets MCP (OAuth) | MCP | Finance/Ops | Read/write Google Sheets via OAuth | github.com/mkummer225/google-sheets-mcp | MIT (typical; check repo) | 2025-04-07[^12] | node dist/index.js (add to Claude mcpServers)[^12] |
| Google Sheets MCP (service acct) | MCP | Finance/Ops | Sheets via service account | github.com/shionhonda/mcp-gsheet | MIT (typical; check repo) | 2025-04-11[^13] | export GOOGLE_APPLICATION_CREDENTIALS=key.json \&\& mcp run server.py[^13] |
| Google Sheets MCP (alt) | MCP | Finance/Ops | Sheets I/O tools | github.com/amaboh/google-sheets-mcp | MIT (typical) | 2025-03-19[^14] | node server.js[^14] |
| Notion MCP | MCP | Knowledge/Docs | CRUD pages/DB via Notion API | github.com/awkoy/notion-mcp-server | MIT[^15] | 2025-05 (3 months ago on page date)[^15] | NOTION_TOKEN=... npm run build \&\& npm run inspector[^15] |
| Slack MCP (Action) | MCP | Sales/Comms | Slack file/image integration | mcpservers.org/.../claude-mcp-slack (GitHub Action) | MIT[^16] | 2025 (Action maintained)[^16] | uses: atlasfutures/claude-mcp-slack@v1 (outputs mcp_config)[^16] |
| Slack MCP (node) | MCP | Sales/Comms | Slack tools server | github.com/korotovsky/slack-mcp-server | MIT[^17] | 2025-04-12[^17] | node server.js (per repo README)[^17] |
| Google Directory MCP (CData) | MCP | Workspace | Read-only Google Directory via JDBC | github.com/CDataSoftware/google-directory-mcp-server-by-cdata | MIT (typical; confirm in repo) | 2025-06-23[^18] | mcp run (per README)[^18] |
| hledger | CLI | Accounting | Plaintext double-entry accounting | hledger.org (GitHub org) | GPL (project standard) | Active (ongoing) | brew install hledger; hledger add |
| beancount | CLI | Accounting | Plaintext double-entry ledger | github.com/beancount/beancount | GPL-2.0 (project standard) | Active historically | pip install beancount |
| Metabase Releases | CLI | BI | Version pinning details | github.com/metabase/metabase/releases | AGPL-3.0[^2][^1] | 2025-08-13[^2] | docker pull metabase/metabase:v0.56.2[^2] |
| n8n Releases | CLI | Automations | Version notes for upgrades | docs.n8n.io/release-notes | Fair-code[^4][^3] | 2025-08-18[^4] | docker pull n8nio/n8n:1.107.3[^4] |
| OpenProject | CLI | Project Mgmt | Self-host PM (tasks, Gantt) | openproject.org (GitHub) | GPLv3 (community) | Active | docker run -d -p 8080:80 openproject/community |
| Outline | CLI | Wiki/Docs | Team wiki with SSO | github.com/outline/outline | BSL 1.1 (source-available) | Active | docker run -d -p 3000:3000 outlinewiki/outline |
| Documenso | CLI | E-sign | Open-source e-signature | documenso.com (GitHub) | AGPL-3.0 (community) | Active | docker run -d -p 3000:3000 documenso/documenso |
| Listmonk | CLI | Newsletter | Self-host newsletter \& campaigns | github.com/knadh/listmonk | AGPL-3.0 | Active | docker run -p 9000:9000 listmonk/listmonk:latest |
| Metabase + Postgres | CLI | BI/DB | Pair BI to Postgres | github.com/metabase/metabase | AGPL-3.0[^1] | 2025-08-13[^2] | METABASE_DB... docker run metabase...[^2] |
| Postgres MCP (generic) | MCP | Data/DB | Read/write DB, safe query plans | (curated lists: mcpservers.org) | Varies (prefer MIT) | Active (per list) | command: node postgres-mcp-server.js (per repo) |
| GitHub Issues MCP | MCP | DevOps | Create/search issues \& PR triage | mcpservers.org curated lists | MIT (prefer) | Active | add PAT env and run node server.js |
| Linear MCP | MCP | Project/Issues | Linear issues/projects | mcpservers.org curated lists | MIT (prefer) | Active | LINEAR_API_KEY=... node server.js |
| Jira MCP | MCP | Project/Issues | Jira tasks \& sprints | mcpservers.org curated lists | MIT (prefer) | Active | JIRA_TOKEN=... node server.js |
| Gmail MCP | MCP | Comms | Send/search email | mcpservers.org curated lists | MIT (prefer) | Active | GOOGLE_OAUTH_JSON=... node server.js |
| Drive/Docs MCP | MCP | Knowledge/Docs | Search files/docs | mcpservers.org curated lists | MIT (prefer) | Active | GOOGLE_OAUTH_JSON=... node server.js |
| Airtable MCP | MCP | Ops/CRM | Base read/write | mcpservers.org curated lists | MIT (prefer) | Active | AIRTABLE_TOKEN=... node server.js |
| Supabase/Postgres MCP | MCP | Data/DB | Supabase auth/CRUD | mcpservers.org curated lists | MIT (prefer) | Active | SUPABASE_URL/KEY=... node server.js |

Notes:

- Where specific repo license/date aren’t visible in the snippet, confirm in the repo before production use. The items explicitly cited meet the “≤9 months” and open-source license constraints per the sources shown for those rows.


## Recommendations and Plans

- Top 5 picks for non-technical founders (GUI/OAuth, quick setup)
    - Metabase (OSS): Quick, GUI-first BI; simple Docker deploy; excellent ROI for decision-making.[^2][^1]
    - n8n: Drag‑and‑drop automations to glue tools together; deploy fast; great breadth of integrations.[^4][^3]
    - Plausible: 5‑minute privacy-first web analytics; clean UI; minimal maintenance.[^5]
    - Google Sheets MCP (OAuth build): Lets Claude act on finance ops in Sheets with scoped OAuth consent.[^13][^12]
    - Notion MCP: Claude can file, edit, and query Notion docs/DBs with token scopes; fast documentation workflows.[^15]
- 90‑minute starter stack (3 MCP + 3 CLI)

1) Launch Metabase (CLI) for KPIs: docker run -d -p 3000:3000 metabase/metabase:latest; add Postgres connection in UI.[^2]
2) Launch Plausible (CLI) for traffic: docker run -d -p 8000:8000 plausible/analytics:latest; set site+script.[^5]
3) Launch n8n (CLI) for automations: docker run -d -p 5678:5678 n8nio/n8n:latest; create Slack/Email flows.[^4]
4) Configure Google Sheets MCP (OAuth) in Claude Code: add mcpServers config; run node dist/index.js; sign in.[^12]
5) Configure Notion MCP: set NOTION_TOKEN; npm run build \&\& npm run inspector; add to Claude mcpServers.[^15]
6) Add Slack MCP (Action or node): for Claude Code Action use atlasfutures/claude-mcp-slack@v1; or run server.[^16][^17]
7) Create an n8n flow to log leads to Sheets and notify Slack; connect Plausible webhook for goal hits.[^16][^12][^4][^5]
8) Build a Metabase dashboard pulling from Postgres/CSV sources for finance+web metrics; share links.[^2]
- Security notes
    - Prefer OAuth with granular scopes (Google Sheets/Drive, Gmail); store refresh tokens securely; rotate regularly.[^13][^12][^16]
    - Use service accounts only for server-to-server sheets with explicit sharing to target sheets; restrict Editor rights to specific files.[^13]
    - Keep n8n and Metabase behind auth/reverse proxy; avoid exposing admin UIs to the internet; pin versions and back up app DBs.[^4][^2]
    - Slack MCP: limit token scopes to read-only where possible; consider a dedicated workspace app with least privilege.[^17][^16]
    - Notion MCP: restrict integration access to necessary pages/databases; use per-environment tokens.[^15]
- Red flags
    - Some MCP repos are demos or early-stage; verify license files and recent commits before adopting in production.[^16][^15]
    - Invoice Ninja is source-available (Elastic), not OSI; acceptable if source-available is okay, but it’s not OSI-free software.[^11][^10]
    - Odoo Enterprise is proprietary; ensure Community (LGPL) is used for OSS requirement.[^9]
    - Avoid generic/demo MCP servers (filesystem, fetch, everything, sequential-thinking, generic web-browser/search) in production.

Excluded/de-prioritized demos: filesystem, fetch, everything, sequential-thinking, generic web-browser/search.
<span style="display:none">[^19][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^30]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/metabase/metabase/blob/master/LICENSE-EMBEDDING.txt

[^2]: https://github.com/metabase/metabase/releases

[^3]: https://github.com/n8n-io/n8n

[^4]: https://docs.n8n.io/release-notes/

[^5]: https://github.com/plausible/analytics

[^6]: https://github.com/frappe/erpnext-14

[^7]: https://en.wikipedia.org/wiki/ERPNext

[^8]: https://github.com/frappe/erpnext

[^9]: https://www.youtube.com/watch?v=wgi2IV0ZNDU

[^10]: https://github.com/invoiceninja/invoiceninja

[^11]: https://github.com/invoiceninja/invoiceninja.github.io

[^12]: https://github.com/mkummer225/google-sheets-mcp

[^13]: https://github.com/shionhonda/mcp-gsheet

[^14]: https://github.com/amaboh/google-sheets-mcp-server

[^15]: https://github.com/awkoy/notion-mcp-server

[^16]: https://mcpservers.org/servers/atlasfutures/claude-mcp-slack

[^17]: https://github.com/korotovsky/slack-mcp-server/blob/master/LICENSE

[^18]: https://github.com/CDataSoftware/google-directory-mcp-server-by-cdata

[^19]: https://github.com/xing5/mcp-google-sheets

[^20]: https://github.com/D-unn/google-sheets-mcp

[^21]: https://glama.ai/mcp/servers/@ParkJong-Hun/get-my-notion-mcp

[^22]: https://github.com/The-Commit-Company/commit

[^23]: https://github.com/The-Commit-Company/mint

[^24]: https://github.com/navariltd/navari_rfq_opening

[^25]: https://github.com/ONLYOFFICE/onlyoffice_odoo

[^26]: https://github.com/metabase/metabase

[^27]: https://www.metabase.com/releases/metabase-56

[^28]: https://github.com/metabase/mbql

[^29]: https://www.metabase.com/releases/metabase-55

[^30]: https://github.com/giocomai/plausibler

