/command install-toolchain
SYSTEM: Opus 4.1 plan, Sonnet 4 exec. User-local installs; SHA256 on downloads; idempotent; steps <10m.
PLAN:
1) Detect OS; print versions: node, npm, pnpm, wrangler, jq, rg, git.
2) If node<20: install via nvm; corepack enable; pnpm prepare.
3) If wrangler missing: npm i -g wrangler.
4) jq/rg: request sudo apt-get OR install user-local verified binaries to ~/.local/bin.
5) Ensure ~/.local/bin on PATH; log versions to .orchestrator logs.
