# ClawHub Skills TODO

## Restructure by Category

> Move each skill folder into a category folder. The folder a skill sits in is its category. New skills stay at the repo root until they are categorized, so any skill at the root is uncategorized.

- [x] Create category folders: `3d/`, `ai-tools/`, `automation/`, `coding/`, `documentation/`, `graphic-design/`, `vibe-coding/`
- [x] Add `categories.json` listing each valid category folder with a one-line description (skills are not listed, so folder location stays the single source of truth)
- [x] Move skills with `git mv` so file history follows each folder:
  - [x] `3d/`: rhino3d-scripts, freecad-scripts, rhino3d-plugins
  - [x] `ai-tools/`: finalize-agent-prompt, make-skill-template
  - [x] `automation/`: update-docs-on-code-change, fix-broken-links, automate-todo, make-blog-post
  - [x] `coding/`: web-coder, html-coder, game-engine, pdftk-server, typescript-coder, typescript-package-manager, create-web-form, content-management-systems, batch-files, markdown-to-html-converter, legacy-circuit-mockups
  - [x] `documentation/`: write-coding-standards-from-file, use-cliche-data-in-docs, add-educational-comment, convert-plaintext-to-md, create-tldr-page, tldr-prompt, shuffle-json-data, exclude-prompt-data, em-dash
  - [x] `graphic-design/`: html-designer, adobe-illustrator-scripting, graphic-designer, html-css-style-color-guide
  - [x] `vibe-coding/`: quasi-coder, multi-lang-coder, vibe-code
- [x] Add `scripts/categorize.js <skillName> <category>` to move a skill from the repo root (or another category) into a category with `git mv`, rewrite its README links to `<category>/<skillName>/SKILL.md`, and refresh the table with `sortTable.js`
- [x] Add `scripts/skillPath.js <skillName>` that prints a skill's folder (repo root or `<category>/<skillName>`), so local automation never hardcodes the layout
- [x] Update `scripts/newSkill.js`:
  - [x] Keep adding new skills at the repo root (no category option)
  - [x] Match README rows whose link has a category prefix in `skillRowExists` and `removeSkillRow`, so a new root skill cannot duplicate a categorized one
- [x] Update local automation that replaces an existing skill folder by its root path (publish and PR helper scripts) to look the folder up with `skillPath.js`; new skills still land at the root, so their copy steps stay the same
- [x] Decide the README layout: a Category column in the single table, or one table per category; keep the letter anchor nav working either way (chose a Category column)
- [x] Extend the planned `scripts/auditSkills.js` to list root skills as uncategorized (a report, not an error) and flag category folders missing from `categories.json`
- [x] Fix relative links in `SKILL.md` and `references/` files that break after the move
- [x] Add a README Quickstart: add a skill (it lands at the root), categorize it, audit the repo

## Local Skill Manager

> Make this repo the source of truth for local AI skills, installed into the skills folder of each AI tool that reads `SKILL.md` (Claude Code, GitHub Copilot, Codex, and others).

- [ ] Record each tool's user and project skill folders, verified against current docs, e.g.:
  - [ ] Claude Code: `~/.claude/skills/` and `.claude/skills/`
  - [ ] GitHub Copilot: `~/.copilot/skills/` and `.github/skills/`
  - [ ] Codex: `~/.codex/skills/`
- [ ] Add a tool registry (e.g. `tools.json`) with each tool's name and skill folders, so supporting a new tool is one new entry, not new code
- [ ] Add `scripts/syncSkills.js`:
  - [ ] `install`: link or copy skills into a tool's folder, filtered by `--tool <name|all>` and `--skill <name|category|all>`
  - [ ] Link with a directory junction on Windows (no admin rights needed) or a symlink elsewhere, with a `--copy` fallback
  - [ ] `status`: list which skills are installed for which tool, and flag copies that drifted from the repo
  - [ ] `import`: bring a local skill that is not in the repo into the repo root, where it stays uncategorized until `categorize.js` moves it
  - [ ] `remove`: uninstall a skill from a tool folder without touching the repo
  - [ ] `--dry-run` on every command that writes
- [ ] Add optional per-skill tool targeting (frontmatter field or registry entry) for skills that only suit some tools
- [ ] Fold the `scripts/syncGithubSkill.js` idea from Minor Ideas into the `github` target of `syncSkills.js`
- [ ] Add a Quickstart for the sync workflow to the README

## Infrastructure

- [x] Script for updating README table (`scripts/newSkill.js`)
- [ ] Add helper scripts:
  - [ ] Clear out todo lines that are marked complete
  - [ ] Validate SKILL.md frontmatter (require `name` and `description` fields)
  - [x] Audit README table — flag rows whose folder does not exist
  - [x] Audit skill folders — flag any folder missing a `SKILL.md`
  - [x] Auto-update the "Total: N" count in README.md

## Published to ClawHub

- [x] add-educational-comment
- [x] adobe-illustrator-scripting
- [x] batch-files
- [x] content-management-systems
- [x] convert-plaintext-to-md
- [x] create-tldr-page
- [x] create-web-form
- [x] finalize-agent-prompt
- [x] freecad-scripts
- [x] game-engine
- [x] html-coder
- [x] html-css-style-color-guide
- [x] html-designer
- [x] legacy-circuit-mockups
- [x] make-skill-template
- [x] markdown-to-html-converter
- [x] pdftk-server
- [x] quasi-coder
- [x] shuffle-json-data
- [x] tldr-prompt
- [x] typescript-coder
- [x] typescript-package-manager
- [x] update-docs-on-code-change
- [x] use-cliche-data-in-docs
- [x] web-coder
- [x] write-coding-standards-from-file

## New Skills

- [ ] python-data-scripts — data manipulation, file parsing, and automation with Python
- [ ] regex-builder — construct, test, and document regex patterns across languages
- [ ] git-workflow — branching strategies, rebase, cherry-pick, and common Git recipes
- [ ] docker-containers — Dockerfile authoring, Compose, and container lifecycle management
- [ ] sql-query-builder — SQL query writing, optimization, and schema migration patterns
- [ ] rest-api-design — RESTful API conventions, versioning, and OpenAPI spec writing
- [ ] svg-creator — programmatic SVG generation and path/shape manipulation
- [ ] bash-scripting — Linux/macOS shell scripting, traps, and portability tips
- [ ] json-schema-validator — JSON Schema authoring, validation, and tooling integration
- [ ] css-animations — CSS transitions, keyframe animations, and performance guidelines
- [ ] accessibility-auditor — WCAG checklist, ARIA patterns, and automated audit guidance
- [ ] unit-test-writer — unit test scaffolding across Jest, Vitest, pytest, and similar frameworks
- [ ] changelog-generator — CHANGELOG.md conventions, automation hooks, and release notes
- [ ] env-config-manager — `.env` file management, secret handling, and config validation
- [ ] code-reviewer — structured code review checklists and pull-request feedback patterns
- [ ] database-schema-designer — relational and NoSQL schema design patterns and normalization
- [ ] performance-optimizer — web and backend profiling, bottleneck identification, and fixes
- [ ] i18n-localization — internationalization setup, locale file structure, and pluralization
- [ ] cli-tool-builder — building CLI tools with argument parsing, help text, and exit codes
- [ ] mermaid-diagrams — flowcharts, sequence, and ER diagrams using Mermaid syntax
- [ ] github-actions-workflows — CI/CD pipeline authoring, reusable workflows, and secrets
- [ ] openapi-spec-writer — OpenAPI 3.x spec authoring, linting, and code generation

## Major Ideas

> Large new skill efforts — each warrants its own full `SKILL.md` + references.

- [ ] llm-prompt-engineering — structured prompt design, chain-of-thought, few-shot patterns, and evaluation
- [ ] react-component-library — React component architecture, hooks, composition patterns, and state management
- [ ] kubernetes-deployment — K8s manifests, Helm charts, namespaces, and cluster lifecycle management
- [ ] machine-learning-pipeline — ML data prep, model training, evaluation loops, and deployment patterns
- [ ] security-hardening — OWASP Top 10, input sanitization, auth/authz patterns, and secure code review
- [ ] monorepo-management — workspace setup, shared packages, and build orchestration with Nx or Turborepo
- [ ] graphql-api — schema design, resolvers, mutations, subscriptions, and client query patterns
- [ ] electron-desktop-app — cross-platform desktop app scaffolding with Electron and web technologies

## Minor Ideas

> Enhancements to existing skills, new repo tooling, and structural improvements.

- [ ] Add `references/` folder to `quasi-coder/` with shorthand syntax examples
- [ ] Add `CHANGELOG.md` to track repo-level changes across skill updates
- [ ] Add `CONTRIBUTING.md` with guide for adding skills and PR conventions
- [ ] Add `scripts/clearCompleted.js` — strip `- [x]` lines from `TODO.md` on demand
- [x] Add `scripts/auditSkills.js` — cross-check folders vs README table and report gaps
- [ ] Add `scripts/syncGithubSkill.js` — copy a skill folder into `.github/skills/`
- [ ] Add `scripts/validateFrontmatter.js` — verify `name` and `description` present in all `SKILL.md` files
- [ ] Add `templates/` folder with a starter `SKILL.md` scaffold for `make-skill-template`
- [ ] Add version or maturity field to SKILL.md frontmatter (`status: stable | draft | experimental`)
- [ ] Add search tags to SKILL.md frontmatter to improve ClawHub discoverability
- [ ] Expand `batch-files` with a `scripts/` folder of common utility `.bat` examples
- [ ] Add a skill overview index page (`docs/index.md`) grouping skills by domain

## Patch Ideas

> Small fixes, cleanups, and consistency corrections.

- [x] Fix `pdftk-server` README table link — add `/SKILL.md` to match every other row
- [ ] Write real description for `html-coder` (currently "Skill that covers html-coder.")
- [ ] Write real description for `html-designer` (currently "Skill that covers html-designer.")
- [ ] Write real description for `typescript-package-manager` (currently generic)
- [x] Verify `README.md` "Total: 26" count stays accurate as skills are added or removed
- [ ] Verify all 26 ClawHub profile links in README are live and resolve correctly
- [x] Verify all 26 repo `SKILL.md` links in README resolve to existing files
- [ ] Add `.editorconfig` for consistent indentation and line endings across editors
- [ ] Normalize frontmatter `name` field to exactly match the skill folder name in all skills
- [ ] Standardize em-dash vs plain dash usage across all `SKILL.md` descriptions
- [ ] Trim trailing whitespace in SKILL.md files where present
- [ ] Ensure all `SKILL.md` files end with a single trailing newline
- [ ] Spell-check all `SKILL.md` files and references for common typos
- [ ] Normalize heading levels in `batch-files/references/` docs (some skip H2→H4)
- [ ] Update `scripts/newSkill.js` JSDoc — document `ROW_TEMPLATE` format and update example
- [ ] Fix inconsistent backtick usage in README table description cells
- [ ] Add `node_modules` and `.tmp` to `.gitignore` if not already excluded
