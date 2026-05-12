# ClawHub Skills TODO

## Infrastructure

- [x] Script for updating README table (`scripts/newSkill.js`)
- [ ] Add helper scripts:
  - [ ] Clear out todo lines that are marked complete
  - [ ] Validate SKILL.md frontmatter (require `name` and `description` fields)
  - [ ] Audit README table — flag rows whose folder does not exist
  - [ ] Audit skill folders — flag any folder missing a `SKILL.md`
  - [ ] Auto-update the "Total: N" count in README.md

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
- [ ] Add `scripts/auditSkills.js` — cross-check folders vs README table and report gaps
- [ ] Add `scripts/syncGithubSkill.js` — copy a skill folder into `.github/skills/`
- [ ] Add `scripts/validateFrontmatter.js` — verify `name` and `description` present in all `SKILL.md` files
- [ ] Add `templates/` folder with a starter `SKILL.md` scaffold for `make-skill-template`
- [ ] Add version or maturity field to SKILL.md frontmatter (`status: stable | draft | experimental`)
- [ ] Add search tags to SKILL.md frontmatter to improve ClawHub discoverability
- [ ] Expand `batch-files` with a `scripts/` folder of common utility `.bat` examples
- [ ] Add a skill overview index page (`docs/index.md`) grouping skills by domain

## Patch Ideas

> Small fixes, cleanups, and consistency corrections.

- [ ] Fix `pdftk-server` README table link — add `/SKILL.md` to match every other row
- [ ] Write real description for `html-coder` (currently "Skill that covers html-coder.")
- [ ] Write real description for `html-designer` (currently "Skill that covers html-designer.")
- [ ] Write real description for `typescript-package-manager` (currently generic)
- [ ] Verify `README.md` "Total: 26" count stays accurate as skills are added or removed
- [ ] Verify all 26 ClawHub profile links in README are live and resolve correctly
- [ ] Verify all 26 repo `SKILL.md` links in README resolve to existing files
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
