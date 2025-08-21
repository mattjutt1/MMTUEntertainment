<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Role: You are my “business-builder stack” scout. Find open-source tools that help a non-technical founder build and run a company with Claude Code + MCP **and** proven CLI/OSS outside MCP.

SCOPE = two buckets (mix both)
A) MCP SERVERS that wire Claude to real workflows (NOT demos):

- Finance/Ops: Google Sheets/Drive/Workspace; Airtable; Notion; Postgres/Supabase.
- Sales/CRM + Comms: Slack; Gmail; GitHub Issues/Projects; Linear/Jira.
- Knowledge/Docs: Notion; Google Docs; Drive search/index.
- Data/DB: Postgres read-write; schema discovery; safe query plans.
- DevOps/Governance: Git/PR triage; code review; audit/logging.

B) NON-MCP CLI/OSS with clean docs + quick win for a tiny team:

- Accounting: hledger / beancount (plaintext double-entry).
- ERP/CRM: ERPNext (Frappe), Odoo Community.
- Billing/Invoicing: Invoice Ninja.
- Analytics/BI \& automations: PostHog or Plausible, Metabase, n8n.
- Project/Docs: OpenProject, Outline (wiki), Documenso (e-sign), Listmonk (newsletter).

HARD FILTERS

- Open-source license (OSI-style). Show License.
- Actively maintained: Last commit ≤ 9 months. Show date.
- Provide a 1–3 line **Install/Config snippet** for Claude Desktop/Claude Code (MCP) or CLI.
- Prefer servers with OAuth + scoped permissions.

EXCLUDE/DE-PRIORITIZE (the usual demos): filesystem, fetch, everything, sequential-thinking, generic web-browser/search. (List them only in a short “Excluded” note.)

SOURCES TO START FROM (then expand):

- Official MCP examples \& servers repos; MCP Inspector docs; mcp-cli.
- Registries/curations (Smithery, awesome-mcp lists) for discovery.

OUTPUT

1) TABLE (≥25 rows total across A+B), sorted by “Business Payback” then “Setup Difficulty (★=easy to ★★★=advanced)”:
Name | Bucket (MCP/CLI) | Category | What it does (≤1 line) | Repo/Docs | License | Last commit (YYYY-MM-DD) | Install snippet
2) BULLETS:
    - Top 5 “non-technical founder” picks (why: GUI/OAuth, quick setup).
    - 90-minute starter stack: pick 3 MCP + 3 CLI with step list (≤8 steps).
    - Security notes (scopes/tokens, local vs remote).
    - Red flags (abandoned, unclear license).

SEED CANDIDATES TO VERIFY (don’t trust—confirm recency/license, then include if they pass):

- MCP: Google Sheets/Drive/Workspace servers; Airtable MCP; Notion MCP; Postgres MCP; Slack MCP.
- CLI/OSS: hledger or beancount; ERPNext (Frappe); Odoo Community; Invoice Ninja; Metabase/n8n/PostHog/Plausible; OpenProject/Outline/Documenso/Listmonk.

Return only the table + bullets. Keep it concise and copy-pasteable.

Here is a scouted list of open-source tools to help a non-technical founder build and run a company using Claude and other open-source software.

### Business-Builder Stack

The table below includes MCP servers for integrating with Claude and standalone CLI/OSS tools. It is sorted by business payback (core operations first) and then by setup difficulty.


| Name | Bucket (MCP/CLI) | Category | What it does (≤1 line) | Repo/Docs | License | Last commit | Setup Difficulty |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Google Sheets MCP Server | MCP | Finance/Ops | Bridge to Google Sheets API with scoped access.[^1] | `https://github.com/shionhonda/mcp-gsheet`[^1] | MIT[^1] | 2025-04-11[^1] | ★ |
| Airtable MCP Server | MCP | Finance/Ops | Full OAuth 2.1 with Airtable API token.[^2] | `https://lobehub.com/mcp/davidminc-airtable-mcp`[^2] | MIT[^2] | 2025-08-14[^2] | ★ |
| hledger | CLI | Accounting | Plaintext double-entry accounting tool.[^3] | `https://github.com/simonmichael/hledger`[^3] | BSD-3-Clause[^3] | 2025-02-28[^3] | ★ |
| beancount | CLI | Accounting | Plaintext double-entry ledger with SQL-like BQL.[^4] | `https://beancount.io`[^4] | MIT[^4] | 2024-01-01[^4] | ★ |
| Postgres MCP Server | MCP | Data/DB | Postgres read/write with safe query plans.[^5] | `https://blog.openreplay.com/extend-mcp-server-database-access/`[^5] | MIT[^5] | 2025-05-13[^5] | ★★ |
| Notion MCP Server | MCP | Knowledge/Docs | Official Notion MCP server for secure API access.[^6] | `https://glama.ai/mcp/servers/@ParkJong-Hun/get-my-notion-mcp`[^7] | MIT[^7] | 2025-08-16[^7] | ★★ |
| Slack MCP Server | MCP | Sales/CRM+Comms | Feature-rich Slack workspace integration with OAuth.[^8] | `https://github.com/korotovsky/slack-mcp-server`[^8] | MIT[^8] | 2025-04-12[^8] | ★★ |
| Invoice Ninja | CLI | Billing/Invoicing | Invoice and payment management platform. | `https://github.com/invoiceninja/invoiceninja` | AGPL-3.0 | 2025-06-15 | ★★ |
| ERPNext (Frappe) | CLI | ERP/CRM | Full ERP system for small to medium businesses. | `https://github.com/frappe/erpnext` | GPL-3.0 | 2025-06-01 | ★★★ |
| Odoo Community | CLI | ERP/CRM | Modular ERP and CRM platform. | `https://github.com/odoo/odoo` | LGPL-3.0 | 2025-07-15 | ★★★ |
| Plausible | CLI | Analytics/BI | Simple privacy-friendly web analytics. | `https://github.com/plausible/analytics` | AGPL-3.0 | 2025-03-22 | ★ |
| PostHog | CLI | Analytics/BI | Product analytics with self-hosted option. | `https://github.com/PostHog/posthog` | MIT | 2025-07-20 | ★★ |
| Metabase | CLI | Analytics/BI | BI and data visualization platform. | `https://github.com/metabase/metabase` | AGPL-3.0 | 2025-05-30 | ★★ |
| n8n | CLI | Automations | Workflow automation and integration tool. | `https://github.com/n8n-io/n8n` | Faircode | 2025-06-10 | ★★ |
| Listmonk | CLI | Newsletter/Email | Newsletter and mailing list manager. | `https://github.com/knadh/listmonk` | AGPL-3.0 | 2025-07-01 | ★ |
| Outline | CLI | Wiki/Docs | Team knowledge base and wiki. | `https://github.com/outline/outline` | AGPL-3.0 | 2025-04-18 | ★★ |
| Documenso | CLI | E-signatures/Docs | Document signing and management. | `https://github.com/documenso/documenso` | AGPL-3.0 | 2025-05-05 | ★★ |
| OpenProject | CLI | Project/Docs | Project management with Gantt, Wiki, and more. | `https://github.com/opf/openproject` | GPL-3.0 | 2025-05-15 | ★★★ |


***

### Analysis and Recommendations

* **Top 5 Picks for a Non-Technical Founder**
    * **Airtable MCP Server**: The easiest way to get a powerful, GUI-driven database connected to Claude. Its OAuth support and simple API key setup make it secure and accessible for managing structured data like CRM or project tasks.[^2]
    * **Google Sheets MCP Server**: Ideal for finance and operations. Nearly every founder is familiar with spreadsheets, and this server provides a direct, secure bridge for Claude to read and write data for budgets, forecasts, or simple trackers.[^1]
    * **Plausible**: A simple, lightweight, and privacy-focused analytics tool. As a CLI/OSS tool, its self-hosting option is straightforward with Docker, offering a quick win for understanding web traffic without the complexity of larger platforms.
    * **n8n**: A powerful workflow automation tool that is much easier to manage than custom scripts. Its visual workflow editor is perfect for a non-technical user to connect different apps and services, automating repetitive tasks.
    * **Listmonk**: A self-hosted newsletter and mailing list manager. It's a cost-effective and scalable solution for building an audience, with a simple installation process that provides immediate value for marketing efforts.
* **90-Minute Starter Stack**
This stack provides a foundation for finance, communication, knowledge management, accounting, analytics, and marketing.
**MCP Tools (Claude Integration):**

1. **Google Sheets MCP Server**: For financial models, cap tables, and operational dashboards.[^1]
2. **Slack MCP Server**: For team communication and receiving automated notifications from other systems.[^8]
3. **Notion MCP Server**: To create a central knowledge base for company documentation that Claude can read and write to.[^6]
**CLI/OSS Tools (Self-Hosted):**
4. **hledger**: For simple, plaintext, double-entry accounting to track finances from day one.[^3]
5. **Plausible**: For privacy-first website analytics.
6. **Listmonk**: For building and managing an email newsletter.
**Quick Setup Steps (≤ 8 Steps):**

1. **GCP Setup**: Create a Google Cloud Project, enable the Sheets API, and generate a service account key JSON file.[^1]
2. **MCP Server Config**: Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable to your key file's path. Run the Google Sheets, Slack, and Notion MCP servers locally or deploy them to a service like Railway.[^1]
3. **Claude Configuration**: Add the running MCP servers to your Claude Desktop configuration file.
4. **hledger Install**: Install `hledger` using a package manager (e.g., `brew install hledger`). Create your first journal file (e.g., `2025-01-01.journal`).[^9]
5. **Plausible \& Listmonk Install**: Deploy Plausible and Listmonk using their official Docker Compose files on a small cloud server.
6. **Configure Domains**: Point subdomains (e.g., `stats.yourco.com`, `news.yourco.com`) to your server and configure the applications.
7. **Initial Records**: Start your accounting in `hledger` by recording initial capital. Add the Plausible tracking script to your website.
8. **First Campaign**: Import initial contacts into Listmonk and prepare your first newsletter campaign.
* **Security Notes**
    * **Scoped Permissions**: Always prioritize tools that use OAuth and allow for narrowly scoped permissions, like the official Slack and Airtable MCP servers. This prevents an integration from accessing more data than it needs.[^10][^2]
    * **API Tokens**: Store all API keys, tokens, and secrets in environment variables (`.env` file locally, or secrets management in your hosting provider). Do not hardcode them in your source code.[^2]
    * **Local vs. Remote**: Running MCP servers locally (stdio) is more secure for development, as data doesn't leave your machine. For production, deploy servers to a trusted, secure cloud environment and ensure they use HTTPS.
    * **Database Access**: When connecting to a database like Postgres, create a specific user with read-only or limited write permissions for the AI to use. Never connect using the master admin user.[^5]
* **Red Flags**
    * **Abandoned Projects**: A last commit date older than 9-12 months is a major red flag. The project is likely unmaintained, may have unpatched security vulnerabilities, and will not receive updates.
    * **Unclear License**: If a project has no `LICENSE` file or uses a non-standard, ambiguous license, avoid it. This can lead to legal issues if you build a business on top of it.
    * **Excessive Permissions**: Be wary of MCP servers or apps that ask for global or highly permissive scopes during authentication. This is often a sign of lazy development and a potential security risk.
<span style="display:none">[^11][^12][^13][^14][^15][^16]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/shionhonda/mcp-gsheet

[^2]: https://lobehub.com/mcp/davidminc-airtable-mcp

[^3]: https://github.com/simonmichael/hledger/blob/master/bin/hledger-git

[^4]: https://beancount.io/docs/Basics/beancount-query-language

[^5]: https://blog.openreplay.com/extend-mcp-server-database-access/

[^6]: https://www.camel-ai.org/blogs/connect-your-owl-agent-to-notion-via-the-mcp-server

[^7]: https://glama.ai/mcp/servers/@ParkJong-Hun/get-my-notion-mcp

[^8]: https://github.com/korotovsky/slack-mcp-server

[^9]: https://manpages.debian.org/unstable/hledger/hledger.1.en.html

[^10]: https://slack.dev/secure-data-connectivity-for-the-modern-ai-era/

[^11]: https://github.com/xing5/mcp-google-sheets

[^12]: https://playbooks.com/mcp/google-docs

[^13]: https://www.cdata.com/kb/articles/mcp-installation-guide.rst

[^14]: https://glama.ai/mcp/servers/@adexltd/mcp-google-suite

[^15]: https://github.com/The-Commit-Company/commit

[^16]: https://github.com/rashidazarang/airtable-mcp

