# REA Evaluation (canonical REA evidence record)

- **Phase:** P1 research (REQ-030).
- **Canonical record:** this file is the master prompt's `REA_EVIDENCE.md`. If a later owner directive uses the term "REA findings", it refers to this document. Do not create a duplicate research file.
- **Status:** `EVALUATED — NOT INSTALLED, NOT REQUIRED AS A PRODUCTION DEPENDENCY`.
- **Setup executed:** none. The owner has not authorized agent-configuration changes.

## Verified public facts (2026-10-20)

Source: <https://github.com/morluto/rea>, npm package <https://www.npmjs.com/package/rea-agents>.

- REA is an MCP-based reverse-engineering toolkit for binaries, applications and runtime behavior; analysis runs locally. `VERIFIED` (README).
- Official sources named by the project are the `morluto/rea` repository, <https://rea.tools/> and the `rea-agents` npm package. `VERIFIED`.
- License is MIT for REA-authored code, with third-party tool licenses retained separately. `VERIFIED`.
- Quick start is `npx rea-agents setup`; setup registers an MCP server with the chosen agent and installs workflow instructions, with backups of existing configuration. `VERIFIED`.
- Setup supports Claude Code, Codex, Cursor, Gemini CLI, Grok Build and "other agents" per the README; the exact OpenCode-specific path was **not** confirmed from the README text retrieved. `UNKNOWN`.
- Deep native analysis requires Hopper, Ghidra or IDA; static JavaScript, .NET, Go, Rust and several artifact formats do not. `VERIFIED`.
- Websites can be examined with a Chrome-family browser using page structure, scripts, network observations and requested screenshots. `VERIFIED`.
- REA does not upload the analyzed app itself; the agent's own model provider has its own data policy. `VERIFIED`.
- Commercial tools remain under vendor terms; REA grants no licenses or activation. `VERIFIED`.

## Environment compatibility

| Item                     | Local value                                     | REA requirement reported in README   | Assessment                                    |
| ------------------------ | ----------------------------------------------- | ------------------------------------ | --------------------------------------------- |
| Node.js                  | `v25.6.1`                                       | 22.x >= 22.19, 24.x >= 24.11, or 26+ | `UNVERIFIED/UNSUPPORTED` — 25.x is not listed |
| npm                      | `11.9.0`                                        | npm installed                        | Present                                       |
| OpenCode client behavior | Not inspected for MCP registration side effects | Setup can modify agent configuration | Requires owner approval before any run        |

Because the local Node release is not in the documented support list, the documented `npx rea-agents@latest setup --client opencode --dry-run` was **not executed**. Running it now would mix an unverified client flag with an unsupported Node major, and setup can modify agent configuration.

## Decision

- REA is **not** a BuildScope production dependency. The product does not need it to ship, and no REA output may be copied into production behavior or assets.
- If the owner wants a lawful REA pass on public competitor pages later, the prerequisites are:
  1. Owner approves the exact command, including any agent-configuration change.
  2. Confirm the OpenCode client flag against the version actually invoked.
  3. Resolve the Node version question (use a documented-supported Node major for that command or confirm support directly from the maintainers).
  4. Use only public pages and authorized local artifacts; no authentication bypass, paywall defeat, private data or copied proprietary assets.
- No native binary-analysis engine (Hopper, Ghidra, IDA) will be installed for a website study.

## What REA would add, and what it would not

- **Could add (`INFERENCE`):** structured observation notes for public page scripts, network requests and UI behavior, with evidence limitations recorded.
- **Would not add:** internal backend source, proprietary algorithms, private data or proof of competitor implementation. The master prompt already states REA "cannot prove or expose hidden private backend code".

## Traceability

- REQ-030: legitimate REA evaluation, provenance and no unauthorized setup.
- Master prompt section 3 and section 17 step 5.
