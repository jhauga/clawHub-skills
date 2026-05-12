# [clawHub Skills](https://clawhub.ai/u/jhauga)

Repo of duplicate skill folders that are uploaded to [clawHub skills](https://clawhub.ai/skills?sort=downloads) but still available to view on GitHub.

Each subdirectory contains a self-contained skill with a `SKILL.md` file and optional supporting resources such as reference documents, scripts, assets, and templates. Each skill utilizes conventions from [Agent skills specification](https://agentskills.io/specification).

## Skills

### Total: 15

| Skill | Description |
|-------|-------------|
| [pdftk-server](pdftk-server/) (*repo*) <br> [pdftk-server](https://clawhub.ai/jhauga/pdftk-server) (*on ClawHub*) | Skill for using the command-line tool `pdftk` for working with PDF files. |
| [quasi-coder](quasi-coder/SKILL.md) (*repo*) <br> [quasi-coder](https://clawhub.ai/jhauga/quasi-coder) (*on ClawHub*) | Vibe-coding skill for interpreting and implementing code from shorthand, quasi-code, and natural language descriptions. |
| [game-engine](game-engine/SKILL.md) (*repo*) <br> [game-engine](https://clawhub.ai/jhauga/game-engine) (*on ClawHub*) | Skill for creating and/or working on a game engine. |
| [web-coder](web-coder/SKILL.md) (*repo*) <br> [web-coder](https://clawhub.ai/jhauga/web-coder) (*on ClawHub*) | Skill that covers core web concepts for general web programming. |
| [typescript-coder](typescript-coder/SKILL.md) (*repo*) <br> [typescript-coder](https://clawhub.ai/jhauga/typescript-coder) (*on ClawHub*) | Skill that covers core TypeScript concepts for TypeScript programming. |
| [html-coder](html-coder/SKILL.md) (*repo*) <br> [html-coder](https://clawhub.ai/jhauga/html-coder) (*on ClawHub*) | Skill that covers html-coder. |
| [html-designer](html-designer/SKILL.md) (*repo*) <br> [html-designer](https://clawhub.ai/jhauga/html-designer) (*on ClawHub*) | Skill that covers html-designer. |
| [typescript-package-manager](typescript-package-manager/SKILL.md) (*repo*) <br> [typescript-package-manager](https://clawhub.ai/jhauga/typescript-package-manager) (*on ClawHub*) | Skill that covers typescript-package-manager. |
| [use-cliche-data-in-docs](use-cliche-data-in-docs/SKILL.md) (*repo*) <br> [use-cliche-data-in-docs](https://clawhub.ai/jhauga/use-cliche-data-in-docs) (*on ClawHub*) | Skill that instructs agent to use cliche data for documentation. |
| [update-docs-on-code-change](update-docs-on-code-change/SKILL.md) (*repo*) <br> [update-docs-on-code-change](https://clawhub.ai/jhauga/update-docs-on-code-change) (*on ClawHub*) | Skill that keeps documentation up-to-date when features change. |
| [add-educational-comment](add-educational-comment/SKILL.md) (*repo*) <br> [add-educational-comments](https://clawhub.ai/jhauga/add-educational-comment) (*on ClawHub*) | Skill to comment existing code relative to context specified, defaulting to educational comments. |
| [freecad-scripts](freecad-scripts/SKILL.md) (*repo*) <br> [freecad-scripts](https://clawhub.ai/jhauga/freecad-scripts) (*on ClawHub*) | Skill that covers freecad-scripts. |
| [batch-files](batch-files/SKILL.md) (*repo*) <br> [batch-files](https://clawhub.ai/jhauga/batch-files) (*on ClawHub*) | Skill for creating, editing, and/or working with Windows batch files. |
| [adobe-illustrator-scripting](adobe-illustrator-scripting/SKILL.md) (*repo*) <br> [adobe-illustrator-scripting](https://clawhub.ai/jhauga/adobe-illustrator-scripting) (*on ClawHub*) | New skill for working with Adobe Illustrator scripts. |
| [content-management-systems](content-management-systems/SKILL.md) (*repo*) <br> [content-management-systems](https://clawhub.ai/jhauga/content-management-systems) (*on ClawHub*) | A new skill for working with content management systems. |

## Skill Structure

Every skill follows the standard Agent Skills layout:

```
<skill-name>/
├── SKILL.md            # Required - skill definition and instructions
├── references/         # Optional - documentation the agent reads
├── scripts/            # Optional - executable automation code
├── assets/             # Optional - static files used as-is
└── templates/          # Optional - starter code scaffolds
```

## Adding a New Skill

1. Create a new folder with a lowercase, hyphenated name
2. Add a `SKILL.md` file with the required YAML frontmatter (`name` and `description`)
3. Add optional directories (`references/`, `scripts/`, `assets/`, `templates/`) as needed
4. Update this README with the new skill entry, linking to repo folder and skill on [ClawHub](https://clawhub.ai/)
