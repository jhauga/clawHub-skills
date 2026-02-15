# [clawHub Skills](https://clawhub.ai/u/jhauga)

Repo of duplicate skill folders that are uploaded to [clawHub skills](https://clawhub.ai/skills?sort=downloads) but still available to view on GitHub.

Each subdirectory contains a self-contained skill with a `SKILL.md` file and optional supporting resources such as reference documents, scripts, assets, and templates. Each skill utilizes conventions from [Agent skills specification](https://agentskills.io/specification).

## Skills

| Skill | Description |
|-------|-------------|
| [pdftk-server](pdftk-server/) (*repo*) <br> [pdftk-server](https://clawhub.ai/jhauga/pdftk-server) (*on ClawHub*) | Skill for using the command-line tool `pdftk` for working with PDF files. |

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
4. Update this README with the new skill entry
