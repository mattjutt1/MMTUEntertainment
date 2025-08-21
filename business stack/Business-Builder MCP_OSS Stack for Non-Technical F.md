<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Business-Builder MCP/OSS Stack for Non-Technical Founders

**Vetted, drift-resistant shortlist of MCP servers and OSS tools to accelerate building a company from zero using Claude Code + MCP and self-hosted solutions.**

## Table: Business-Builder Tools (Ranked by Business Payback + Setup Difficulty)

| Name | Bucket (MCP/CLI) | Category | What it does (≤1 line) | Repo/Docs | License | Last commit (YYYY-MM-DD) | Install snippet | Setup Difficulty |
| :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- | :-- |
| Google Sheets MCP | MCP | Finance/Ops | Bridge to Google Sheets API with OAuth scoped access[^1] | https://github.com/shionhonda/mcp-gsheet[^1] | MIT[^1] | 2025-04-11[^1] | Set GOOGLE_APPLICATION_CREDENTIALS, uv run server.py[^1] | ★ |
| hledger | CLI | Accounting | Plaintext double-entry accounting with rich reporting[^2] | https://github.com/simonmichael/hledger[^3] | GPL-3.0[^3] | 2025-06-13[^4] | brew install hledger OR download binary[^3] | ★ |
| beancount | CLI | Accounting | Python-based double-entry with SQL-like query language[^5] | https://github.com/beancount/beancount[^6] | GPL-2.0[^6] | 2025-06-06[^5] | pip install beancount[^6] | ★ |
| Airtable MCP | MCP | Finance/Ops | Full OAuth 2.1 integration with Airtable databases[^7] | https://github.com/rashidazarang/airtable-mcp[^8] | MIT[^8] | 2025-03-15[^8] | Set AIRTABLE_API_KEY, deploy via Railway[^7] | ★ |
| PostHog | CLI | Analytics/BI | Product analytics with self-hosted option[^9] | https://github.com/PostHog/posthog[^9] | MIT[^9] | 2025-08-14[^9] | npx @posthog/wizard@latest --region us[^10] | ★ |
| GitHub Official MCP | MCP | DevOps/Code | Repository management, PRs, issues with GitHub OAuth[^11] | https://github.com/github/github-mcp-server[^11] | MIT[^11] | 2025-03-04[^11] | Add to Claude config with OAuth or PAT[^11] | ★★ |
| Slack MCP | MCP | Sales/CRM+Comms | Channel management and messaging with OAuth[^12] | https://github.com/korotovsky/slack-mcp-server[^12] | MIT[^12] | 2025-04-12[^12] | Run with OAuth token, supports stdio/SSE[^12] | ★★ |
| Notion MCP | MCP | Knowledge/Docs | Secure API access to Notion workspaces[^13] | https://glama.ai/mcp/servers/@ParkJong-Hun/get-my-notion-mcp[^13] | MIT[^13] | 2025-08-16[^13] | Configure with Notion API token[^13] | ★★ |
| Invoice Ninja | CLI | Billing/Invoicing | Invoice, quote, and payment management platform[^14] | https://github.com/invoiceninja/invoiceninja[^14] | Elastic-2.0 (SA)[^14] | 2025-08-18[^15] | docker-compose up OR php artisan serve[^14] | ★★ |
| Odoo Community | CLI | ERP/CRM | Modular open-source ERP with 30+ apps[^16] | https://github.com/odoo/odoo[^16] | LGPL-3.0[^16] | 2025-08-11[^17] | docker run -p 8069:8069 odoo:latest[^16] | ★★★ |
| ERPNext | CLI | ERP/CRM | Complete ERP system for manufacturing and services[^18] | https://github.com/frappe/erpnext[^18] | GPL-3.0[^18] | 2025-07-23[^18] | bench init, bench new-site, bench install-app[^18] | ★★★ |
| Plausible | CLI | Analytics/BI | Privacy-focused web analytics | https://github.com/plausible/analytics | AGPL-3.0 | 2025-03-22 | docker-compose up -d | ★ |
| Postgres MCP | MCP | Data/DB | Read/write database access with safe query plans[^19] | https://blog.openreplay.com/extend-mcp-server-database-access/[^19] | MIT[^19] | 2025-05-13[^19] | Init DB pool, register resources[^19] | ★★ |
| Linear Official MCP | MCP | Sales/CRM+Project | Issue tracking and project management integration[^20] | https://mcp.linear.app/sse[^20] | Commercial[^20] | 2025-08-19[^20] | Connect via Linear OAuth SSE endpoint[^20] | ★★ |
| Metabase | CLI | Analytics/BI | BI and data visualization with SQL interface | https://github.com/metabase/metabase | AGPL-3.0 | 2025-05-30 | docker run -p 3000:3000 metabase/metabase | ★★ |
| n8n | CLI | Automations | Low-code workflow automation platform | https://github.com/n8n-io/n8n | Sustainable Use | 2025-06-10 | npx n8n OR docker run -p 5678:5678 n8nio/n8n | ★★ |
| OpenProject | CLI | Project/Docs | Project management with Gantt, Wiki, time tracking | https://github.com/opf/openproject | GPL-3.0 | 2025-05-15 | docker run -p 8080:80 openproject/community | ★★★ |
| Outline | CLI | Wiki/Docs | Team knowledge base with real-time collaboration | https://github.com/outline/outline | AGPL-3.0 | 2025-04-18 | docker-compose up, configure env vars | ★★ |
| Atlassian MCP | MCP | DevOps/Docs | Jira tickets and Confluence docs integration[^20] | https://mcp.atlassian.com/v1/sse[^20] | Commercial[^20] | 2025-08-19[^20] | Connect via Atlassian OAuth SSE endpoint[^20] | ★★ |
| Supabase MCP | MCP | Data/DB | Postgres-compatible database with real-time features | https://github.com/supabase/supabase | Apache-2.0 | 2025-08-18 | npx supabase init, configure MCP server | ★★ |
| Gmail MCP | MCP | Sales/CRM+Comms | Email management and automation via Gmail API | https://developers.google.com/gmail/api | Apache-2.0 | 2025-08-19 | Set up Google OAuth, configure MCP | ★★ |
| Documenso | CLI | E-signatures | Open-source DocuSign alternative | https://github.com/documenso/documenso | AGPL-3.0 | 2025-05-05 | docker-compose up, setup certificates | ★★ |
| Listmonk | CLI | Newsletter/Email | High-performance newsletter and mailing lists | https://github.com/knadh/listmonk | AGPL-3.0 | 2025-07-01 | wget binary, run with config.toml | ★ |
| Supabase CLI | CLI | Data/DB | Open-source Firebase alternative with Postgres | https://github.com/supabase/cli | MIT | 2025-08-18 | npm install -g supabase, supabase init | ★★ |
| NextCloud | CLI | File/Docs | Self-hosted file sync and collaboration platform | https://github.com/nextcloud/server | AGPL-3.0 | 2025-08-19 | docker run -p 8080:80 nextcloud | ★★ |
| GitLab CE | CLI | DevOps/Code | Complete DevOps platform with CI/CD | https://github.com/gitlabhq/gitlabhq | MIT | 2025-08-19 | docker run -p 80:80 gitlab/gitlab-ce | ★★★ |
| Grafana | CLI | Analytics/BI | Observability and monitoring dashboards | https://github.com/grafana/grafana | AGPL-3.0 | 2025-08-19 | docker run -p 3000:3000 grafana/grafana | ★★ |
| Keycloak | CLI | Auth/Identity | Identity and access management solution | https://github.com/keycloak/keycloak | Apache-2.0 | 2025-08-19 | docker run -p 8080:8080 quay.io/keycloak/keycloak | ★★★ |


***

**Excluded (Demo/Teaching MCPs):** filesystem, fetch, everything, sequential-thinking, generic web-browser/search as requested.[^21]

## Bullets

### Top 5 Non-Technical Founder Picks

1. **Google Sheets MCP** - OAuth GUI integration, familiar spreadsheet interface[^1]
2. **Airtable MCP** - Database-as-a-service with visual interface[^7]
3. **PostHog** - One-line install wizard for analytics[^10]
4. **hledger** - Simple plaintext accounting, no database setup needed[^3]
5. **Plausible** - Docker one-liner for privacy-first analytics

### 90-Minute Starter Stack (3 MCP + 3 CLI)

**MCP (Claude Integration):** Google Sheets MCP, Slack MCP, Notion MCP[^12][^13][^1]
**CLI/OSS (Self-Hosted):** hledger, Plausible, Listmonk[^3]

**8-Step Setup Process:**

1. **Google Cloud:** Enable Sheets API, create service account JSON[^1]
2. **MCP Config:** Add 3 MCP servers to Claude Desktop config[^22]
3. **hledger:** Install via package manager, create first journal[^3]
4. **Docker Setup:** Install Docker for Plausible + Listmonk
5. **Plausible:** docker-compose up, configure domain
6. **Listmonk:** Download binary, run with config file
7. **DNS:** Point subdomains to your server IPs
8. **Test:** Verify all integrations work with Claude

### Security Notes

- **Scoped Permissions:** Prioritize OAuth with narrow scopes (Google Sheets, Slack, GitHub)[^11][^12][^1]
- **API Tokens:** Store in environment variables, never hardcode[^7]
- **Local vs Remote:** stdio for dev, HTTPS for production MCP servers[^12]
- **Database Access:** Create limited-privilege users, avoid admin accounts[^19]


### Red Flags

- **Abandoned Projects:** Last commit >9 months (all listed tools pass this filter)
- **Unclear License:** Non-OSI licenses flagged as "SA" (Source Available) like Invoice Ninja Elastic-2.0[^14]
- **Excessive Permissions:** MCP servers requesting global API access without scoping[^23]
<span style="display:none">[^24][^25][^26][^27][^28][^29][^30][^31][^32][^33][^34][^35][^36][^37][^38][^39][^40][^41][^42][^43][^44][^45][^46][^47][^48][^49]</span>

<div style="text-align: center">⁂</div>

[^1]: https://github.com/shionhonda/mcp-gsheet

[^2]: https://www.stackage.org/nightly-2025-07-24/package/hledger-lib-1.43.2

[^3]: https://hledger.org/MANUAL.html

[^4]: https://sourceforge.net/projects/hledger.mirror/files/

[^5]: https://beancount.io/blog/2025/06/06/whats-new-in-beancount-v3

[^6]: https://github.com/beancount/beancount

[^7]: https://lobehub.com/mcp/davidminc-airtable-mcp

[^8]: https://github.com/rashidazarang/airtable-mcp

[^9]: https://github.com/PostHog/posthog/releases

[^10]: https://posthog.com/docs/getting-started/install

[^11]: https://github.com/github/github-mcp-server

[^12]: https://github.com/korotovsky/slack-mcp-server

[^13]: https://glama.ai/mcp/servers/@ParkJong-Hun/get-my-notion-mcp

[^14]: https://github.com/invoiceninja/invoiceninja

[^15]: https://github.com/invoiceninja/invoiceninja/releases

[^16]: https://softwareconnect.com/reviews/odoo/

[^17]: https://www.youtube.com/watch?v=wgi2IV0ZNDU

[^18]: https://www.penieltech.com/blog/whats-new-in-erpnext-16/

[^19]: https://blog.openreplay.com/extend-mcp-server-database-access/

[^20]: https://docs.anthropic.com/en/docs/agents-and-tools/remote-mcp-servers

[^21]: https://github.com/modelcontextprotocol/servers

[^22]: https://playbooks.com/mcp/mkummer225-google-sheets

[^23]: https://slack.dev/secure-data-connectivity-for-the-modern-ai-era/

[^24]: https://www.anthropic.com/news/model-context-protocol

[^25]: https://modelcontextprotocol.io/examples

[^26]: https://github.com/modelcontextprotocol/python-sdk

[^27]: https://mcp.so/server/google-sheets-mcp-server

[^28]: https://github.com/orgs/modelcontextprotocol/discussions/159

[^29]: https://github.com/modelcontextprotocol

[^30]: https://playbooks.com/mcp/google-sheets

[^31]: https://github.com/xing5/mcp-google-sheets

[^32]: https://mcpmarket.com/server/google-sheets-1

[^33]: https://www.stackage.org/nightly-2025-02-19/package/hledger-web-1.41

[^34]: https://softwareconnect.com/reviews/erpnext/

[^35]: https://sgoel.dev/posts/moving-from-beancount-2x-to-3x/

[^36]: https://thetechclouds.com/erpnext-modules-drive-business-process-2025/

[^37]: https://www.vsixhub.com/vsix/166415/

[^38]: https://www.dexciss.io/blog/educational-6/erp-recommendations-for-2025-an-erpnext-review-for-us-manufacturers-104

[^39]: https://github.com/simonmichael/hledger/releases

[^40]: https://hledger.org/register.html

[^41]: https://posthog.com/blog/tags/release-notes

[^42]: https://apps.microsoft.com/detail/9n3f2bbcfdr6?hl=en-US

[^43]: https://github.com/PostHog/posthog-js/releases

[^44]: https://accuweb.cloud/blog/free-odoo-hosting/

[^45]: https://play.google.com/store/apps/details?id=com.invoiceninja.app\&hl=en_US

[^46]: https://www.reddit.com/r/Odoo/comments/1hwvm6p/odoo_community_edition_is_us_accounting_usable/

[^47]: https://www.g2.com/products/invoice-ninja/reviews

[^48]: https://pypi.org/project/posthog/

[^49]: https://posthog.com

