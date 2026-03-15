# AGENTS.md

## Review guidelines

- Treat documentation typos as P1 so Codex checks the README carefully.
- Focus on Node/CLI logic, especially `src/index.js` because it defines the main plan generator.
- If you spot any missing edge-case handling for flavors or textures, flag it as P0.

## Repository context

- The CLI is purely Node.js and question modifications can stay in `src/index.js` and README.
- No backend services are involved, so ignore any references to APIs or servers.
