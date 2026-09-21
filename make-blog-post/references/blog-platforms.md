# Common Blog Platforms

When the workspace is a blog, identify the generator before writing anything.
Each one has its own posts folder, file naming rule, and front matter contract,
and a post that ignores the contract either fails the build or silently never
appears.

## Generator contracts

| Platform | Detect by | Posts live in | Contract to honor |
|----------|-----------|---------------|-------------------|
| Jekyll | `_config.yml`, `Gemfile` with `jekyll` | `_posts/` | File name must be `YYYY-MM-DD-slug.md`. YAML front matter with `layout`, `title`, `date`, `categories`, `tags`. |
| Hugo | `hugo.toml`, `hugo.yaml`, `config.toml` | `content/posts/` | TOML or YAML front matter matching the theme. `draft: true` keeps it out of the build. |
| Astro | `astro.config.mjs` | `src/content/blog/` | Front matter must satisfy the collection schema in `src/content/config.ts`. A missing or extra field fails the build. |
| Eleventy | `.eleventy.js`, `eleventy.config.js` | `posts/`, or the folder named in the config | Front matter plus the directory data file. A `tags` value is what puts the post in the feed. |
| Next.js | `next.config.*` with an MDX or content pipeline | `content/`, `posts/`, `app/blog/` | MDX rules apply: components must be imported or provided, and raw `<` in prose breaks the parse. |
| Gatsby | `gatsby-config.js` | `content/blog/` | Front matter fields must exist in the GraphQL schema the templates query. |
| Docusaurus | `docusaurus.config.js` | `blog/` | Date from the file name prefix or a `date` field. `<!--truncate-->` marks where the excerpt ends. |
| Hexo | `_config.yml` with `hexo` dependencies | `source/_posts/` | YAML front matter. `<!-- more -->` marks the excerpt break. |
| Zola | `config.toml` with `base_url` | `content/` | TOML front matter fenced by `+++`, not `---`. |
| VitePress | `.vitepress/` | the folder the theme configures | Front matter plus whatever index page lists the posts. |
| Hosted platforms | No repository present | Composed locally, entered by the user | The post is written to the post store and handed over. Some accept a front matter block on paste; most do not. |

## Rules that apply to every platform

- **Read a neighbor first.** Open an existing post in the same folder and copy
  its field set exactly. The live posts are more reliable than any general rule
  here.
- **Satisfy the schema, then stop.** Do not invent front matter fields the site
  does not read.
- **Write as a draft where the platform supports it.** Set `draft: true`,
  `published: false`, or the platform's equivalent at Gate 1, and flip it only
  after Gate 2 approval. On a platform with no draft flag, the file itself
  stays unwritten until Gate 1 passes.
- **Respect the file naming rule.** A date-prefixed name is required on some
  platforms and wrong on others.

## Example: a Jekyll post file

```yaml
---
layout: post
title: "Slugify Text in PowerShell"
date: 2026-01-15
categories: powershell
tags: [powershell, string-utils]
---
```

Saved as `_posts/2026-01-15-slugify-text.md`. The date in the file name and the
date in the front matter have to agree, or the post sorts wrong in the feed.

## Example: an Astro content collection post

```yaml
---
title: "Slugify Text in PowerShell"
description: "Turn an arbitrary string into a URL-safe slug with one function."
pubDate: 2026-01-15
tags: ["powershell", "string-utils"]
draft: true
---
```

Every field here has to appear in the Zod schema in `src/content/config.ts`. An
extra field is a build error, not a warning.
