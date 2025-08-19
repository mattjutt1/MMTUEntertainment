# System Kits — Author & Usage Guide

## What is a "System Kit"
A one-page, cited implementation guide for a proven business system (e.g., Double-Entry, TPS/Jidoka, PDSA, TOC, ISO 9001). Kits live here: `docs/system-kits/` and link to the canonical CSV: `data/autonomous-primitives.csv`. Use **GitHub Flavored Markdown** so it renders correctly on GitHub. ¹ ²

> [!NOTE]
> Each claim needs a source link. Prefer official/primary or academically credible pages.

**Current kits**: `double-entry.md`, `tps.md`, `pdsa.md`, `toc.md`, `iso-9001.md`.

## File naming & scope
- Location: `docs/system-kits/<slug>.md` (lowercase kebab-case).
- Keep it to ~1 page focused on **Purpose / Inputs / Outputs / Primitives / Risks / First 3 Steps / Sources**.
- Put detailed history or long examples in the main research report.

## Authoring template (copy/paste)
```md
# <System Name> – System Kit

**Purpose**  
<What this system achieves in one sentence.>

**Inputs**  
- <data/artifacts the system consumes>

**Outputs**  
- <artifacts/decisions produced>

**Automation Primitives**  
- `<primitive name>` — <1–2 line description + "how we'd code it" in one sentence>  
- …(aim for 5–10; also add rows in `data/autonomous-primitives.csv`)

**Risks / Gotchas**  
- <common failure modes when mechanized>

**First 3 Implementation Steps**  
1) <step>  
2) <step>  
3) <step>

**Sources**  
- <authoritative link>  
- <second authoritative link>
```

## Quality checklist (must pass)

* ☐ 5–10 primitives; CSV row(s) added with headers: `system,primitive,description,why_it_matters,example_logic,source_url`.
* ☐ Every claim has a citation (URLs work).
* ☐ Markdown renders on GitHub; optional callouts use `> [!NOTE]`/`[!WARNING]`. ¹
* ☐ Run `markdownlint` locally/CI (no rule violations). ³
* ☐ Links checked (CI or local) — no new dead links.

## Contributing quick rules

* Branch naming: `docs/<kit>-YYYYMMDD`.
* Commit style: Conventional Commits (e.g., `docs(system-kits): add toc kit`). ⁴
* Review: CODEOWNERS will auto-request reviews when configured. ⁵

---

¹ GitHub writing/formatting uses **GitHub Flavored Markdown** (GFM). ([GitHub Docs](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github))
² README/Docs best-practice patterns on GitHub. ([GitHub Docs](https://docs.github.com/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes))
³ `markdownlint` rules/style checker. ([GitHub](https://github.com/DavidAnson/markdownlint))
⁴ Conventional Commits spec. ([Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/))
⁵ GitHub **CODEOWNERS** overview. ([GitHub Docs](https://docs.github.com/articles/about-code-owners))