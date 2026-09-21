---
name: make-blog-post
description: 'Write up independently reusable code as an informational blog post walkthrough covering one specific purpose. Use when writing or touching a function, method, class, script, or tool that works outside the current project, or when asked to "make a blog post", "write a blog post about this", "draft a post", "turn this helper into an article", or "publish this walkthrough". Covers qualification checks, destination inference for blogs, docs sets, and pseudo-blog venues such as gists, delivery modes (direct, staged, paste), credential and cliche sample-data rules, post file layout, SEO optimization, and two confirmation gates before writing or publishing.'
metadata:
  tags: 'blogging, documentation, seo, content, static-site-generators'
---

# Make Blog Post

Turn independently reusable code into an informational blog post that walks a
reader through one specific purpose. The post is built here; publishing it
anywhere public always waits on the user.

## When to Use This Skill

- While working in a workspace or repository, a function, method, class,
  script, or tool is being written or touched that could work outside this
  project with little or no modification.
- The user asks to "make a blog post", "write this up as a post", "draft an
  article about this helper", or "give me something I can paste into my blog".
- A helper was just extracted or generalized and is worth a standalone
  walkthrough.

If the code does not qualify (see **Step 1**), do nothing and do not mention
this skill.

## Skill Configuration

These settings control how the rest of the skill is applied. Treat the listed
value as the default and change it only when the user says otherwise.

| Setting | Default | Meaning |
|---------|---------|---------|
| `automation-mode` | `false` | `true` when running inside an unattended or agent-driven flow. `false` when a person is present for the exchange. |
| `post-store-root` | host OS entry under **Step 3** | The archive root for posts. Resolve the home portion from the environment (`%USERPROFILE%` on Windows, `$HOME` on macOS and Linux) rather than hardcoding it. |
| `allow-in-workspace-storage` | `true` | When `true`, the post may live inside the current workspace instead of the post store, if the workspace is a fitting home. |
| `delivery-mode` | `auto` | `auto` picks the mode per **Step 4**. `direct`, `staged`, or `paste` pins one mode. |
| `seo-optimization` | `auto` | `auto` picks the level per `references/seo-optimization.md`. `full`, `light`, `venue`, or `internal` pins one level. `off` skips SEO entirely. |

Confirmation (**Step 8** and **Step 9**) is not configurable. It applies in
both modes.

## Step 1: Qualify the Code

The code qualifies only when **all** of these are true:

- It solves one clear, general-purpose problem.
- It can be demonstrated in a single self-contained example.
- It does not depend on project-specific state, services, or configuration that
  cannot be replaced with a stand-in.
- It is not trivial. A one-line wrapper or a bare standard-library call does
  not qualify.

If any condition is false, **stay silent**. Do not mention this skill or the
post workflow at all.

## Step 2: Check for an Existing Post

Before drafting, check the post store (see **Step 3**) for an existing post
covering the same code. If one exists, skip.

```batch
dir /s /b "%USERPROFILE%\Documents\blogPosts\*.md"
```

When a pseudo-blog venue is the destination, also check whether an existing
post on the same code already went out to that venue. If one did, skip.

## Step 3: Decide Where the Post Belongs

### An instruction from the user wins

If the user names a destination, use it. Everything below is inference, and
inference loses to an instruction.

- **A named path, folder, repository, or venue is the destination.** Do not
  re-derive it, and do not relocate the post because a different location fits
  the conventions better.
- **Echo the resolved destination at Gate 1** as a full path, or as the venue
  plus file name. A short instruction such as "put it in the blog" is still an
  instruction: resolve it against the workspace, then show what it resolved to
  so a wrong reading is caught before anything is written.
- **Create missing category folders** under a root that already exists. If the
  named root itself does not exist, stop and ask rather than building a tree
  that may be a typo.
- **Say so once if the instruction conflicts** with the site's conventions or
  with a rule in this skill, then follow the instruction anyway. The exception
  is **Step 5**, which is not overridable: strip the offending data and say
  what was stripped.

### Inferring a destination

When no destination was named, read the working context:

| Question | What it means |
|----------|---------------|
| Is this a repository or a loose folder? | A folder with no version control is scratch work. Its posts go to the post store. |
| Is the workspace a blog or site? | A posts folder (`_posts/`, `content/posts/`, `src/content/blog/`), a generator config (`_config.yml`, `hugo.toml`, `astro.config.mjs`), or a body of dated articles. The workspace is the natural home. See `references/blog-platforms.md`. |
| Is a pseudo-blog venue in play? | The user may publish standalone posts somewhere that is not a blog, such as a gist. See `references/pseudo-blog-venues.md`. |
| Is the workspace a documentation set? | A `docs/` tree or a documentation-only repository. A walkthrough may belong there as a new doc file. |
| Is the workspace an application or library? | The code lives here but the writing does not. Store the post in the post store and consider only a link back (see **Step 10**). |
| Does the repository sit in an organization folder? | A repository directly under `GitHub` uses the `blogPosts` / `<category>` form. A repository under `GitHub` / `<organization>` uses the `blogPosts` / `<organization>` / `<category>` form. |

From that reading, settle two questions and state both answers at Gate 1:

1. **Does this create a new doc file in the workspace?** Only when the
   workspace is a blog or documentation set, `allow-in-workspace-storage` is
   `true`, and the post fits the existing structure. Never create a new
   documentation area just to hold a post.
2. **Where is the post stored?** The workspace path, the post store path, both
   (a workspace copy for publication and a post store copy for the archive), or
   the post store plus a venue-shaped copy.

When the workspace is a blog or site, match its existing posts: same folder,
same file extension, same front matter fields, same naming convention. The
layout in **Step 6** is the fallback for the post store, not an override of a
site's own format.

### Post store paths

Determine the host OS first, then use only that OS's forms. Never mix forms
from two OS blocks in one path.

**Windows**:

```
C:\Users\<user>\<blogSite>\<category>\
C:\Users\<user>\Documents\blogPosts\<category>\
C:\Users\<user>\Documents\blogPosts\<organization>\<category>\
```

**macOS**:

```
/Users/<user>/<blogSite>/<category>/
/Users/<user>/Documents/blogPosts/<category>/
/Users/<user>/Documents/blogPosts/<organization>/<category>/
```

**Linux**:

```
/home/<user>/<blogSite>/<category>/
/home/<user>/Documents/blogPosts/<category>/
/home/<user>/Documents/blogPosts/<organization>/<category>/
```

`<blogSite>` is a local checkout of a blog or site the user publishes to. Use
that form only when the post is going into an existing site, and place the file
where the site keeps its posts rather than at the site root.

`<category>` is a short, lowercase, hyphenated name for the code's domain, such
as `string-utils`, `file-io`, `powershell`, or `date-time`. Reuse an existing
category folder when one fits. Name the post file after what the code does
(e.g. `slugify-text.md`), not after the project.

### OS handling

- **Detect, do not assume.** Read the host OS from the environment before
  building any path. Drive letters and backslashes are Windows only; a leading
  `/` is macOS and Linux only.
- **Separators follow the host.** Use `\` on Windows and `/` on macOS and
  Linux, in every path this skill writes or reports.
- **Home directories differ.** Prefer the environment variable
  (`%USERPROFILE%` or `$HOME`) over a literal home path.
- **Case sensitivity differs.** Keep category folders and file names lowercase
  and hyphenated so the same name resolves on every OS.
- **Line endings.** Write post files with the host's convention, or with `LF`
  when the target is a site repository that normalizes line endings.
- **Paths inside the post follow the post, not the host.** A batch or
  PowerShell sample shows Windows paths; a shell sample shows POSIX paths; a
  cross-platform sample shows both or an abstract token such as
  `<config-dir>`.

## Step 4: Choose the Delivery Mode

Where the post belongs and how it reaches the user are separate questions.
Settle this before Gate 1, because it decides whether a file is written at all.

| Mode | What is produced | When to use it |
|------|------------------|----------------|
| `direct` | The post file, written to the resolved destination. | The destination is a path this session can write to, and the user wants it written. |
| `staged` | The post file, written to a staging path, plus a hand-off summary for the user to post manually. | The final destination is one only the user can reach: a hosted platform, an account-bound venue, or any site the user posts to by hand. |
| `paste` | The post rendered in the reply, ready to copy. No file is written. | The user asked to see it, to be given something to paste, or for a draft to read before deciding. |

With `delivery-mode` set to `auto`, read the request:

- A named path, or a plain instruction to write or save the post, means
  `direct`.
- "I will post it myself", "let me review it first", or a destination needing an
  account or a browser means `staged`.
- "Show me", "give me something I can paste", "just draft it", or any request
  that never mentions a file means `paste`.
- When the request is genuinely ambiguous, ask at Gate 1 rather than guessing.
  Writing an unwanted file is the more annoying error of the two.

### Copy-paste mode

The reply is the deliverable, so it has to survive a single copy with no
cleanup.

- **Render the post in one fenced block.** The post contains its own fenced
  code sample, so fence the outer block with four backticks so the inner
  three-backtick fence survives intact.
- **One block, nothing interleaved.** Notes go after the block, not between
  pieces of the post.
- **Include front matter only if the target parses it.** For a hosted editor or
  a venue with no front matter, deliver the venue shape from
  `references/pseudo-blog-venues.md` instead.
- **List field values separately when the target has separate fields.** Give
  the title, description, tags, and slug as labeled one-liners under the block.
- **Write no file.** Offer the archive copy in one line and let the user
  decide.

### Staged mode

The post is written, but the user does the posting.

- **Write to the resolved destination** when the user named one, or to the post
  store under the chosen category when they did not.
- **Shape the file for its final home**, not for the staging folder.
- **Follow the file with a hand-off summary**: the destination, the path
  written, the title, description, slug, and tags, and which of those go in
  which field at the destination.
- **Name any manual step that remains**, such as clearing a draft flag,
  choosing a canonical URL, or selecting tags from a fixed list.
- **Do not post, upload, commit, or push.** Staged mode ends at the hand-off.

Mode does not weaken the gates. Confirmation still comes first, and nothing
reaches a public venue without approval.

## Step 5: Apply the Security and Content Rules

These rules are absolute and apply to everything that goes into a post.

| # | Rule | Detail |
|---|------|--------|
| 1 | **Never include credentials or secure data** | No API keys, tokens, passwords, secrets, connection strings, private URLs, internal hostnames or IPs, account IDs, environment variable values, file paths revealing user or machine names, or personal information. Substitute an obvious placeholder such as `YOUR_API_KEY` or `https://api.example.com`. |
| 2 | **Use cliche sample data only** | `"Hello, World!"`, `John Doe`, `Jane Smith`, `user@example.com`, `foo` / `bar` / `baz`, `123 Main St`, `Lorem ipsum`, `42`, `widgets`, `Acme Corp`. |
| 3 | **Never use prompt data** | Do not copy, paraphrase, or recycle anything from the conversation, the user's request, or the repository's real data. No real names, project names, business terms, file names, or values from the working context. |
| 4 | **Rewrite, do not copy** | Generalize the code into a clean demonstration: rename project-specific identifiers to generic ones, strip unrelated logic, remove internal dependencies. |

## Step 6: Build the Post

The post explains **one specific purpose** of the code, framed as an
informational walkthrough of how to use it. Include:

- A title naming the problem the code solves.
- A short opening stating what the code does and the single use case covered.
- The generalized function, method, or tool in one code block.
- A minimal usage example with cliche data and the expected output.
- A closing note on limits or edge cases, when there is something worth saying.

Keep it to one post file with one code sample. A walkthrough that needs several
files is not a fit for this skill.

### Post file layout

```
title: <Post title>
description: <One sentence stating what the post demonstrates>
slug: <lowercase-hyphenated-slug>
category: <category>
tags: <tag>, <tag>, <tag>
date: <YYYY-MM-DD>
---
<post body in Markdown>
```

The description is one sentence, written with no project or prompt details. It
doubles as the meta description, so keep it between 140 and 160 characters and
lead with what the reader gets.

When the workspace is a blog or site, its own front matter fields win over this
layout. Map these values onto the fields that site already uses and drop any it
does not read.

## Step 7: Optimize for Search

Read `references/seo-optimization.md` and apply the level matching the
destination settled in **Step 3**: `full` for a published site, `light` for the
post store, `venue` for a pseudo-blog venue, `internal` for a documentation
set. Keywords come from the technology, never from a project, client,
organization, repository, or internal product name.

## Step 8: Gate 1 - Before Writing

Do not create or modify any file until the user confirms. Present, in a few
lines:

- The code being written up and the single purpose the post covers.
- Whether this creates a new doc file in the workspace, and the exact path the
  post will be written to.
- The category and file name.
- The working title, the slug, and the SEO level in effect.
- The delivery mode, and the destination as it resolved.

Wait for confirmation. On a decline, stop and write nothing.

In `paste` mode there is no file to guard, so this gate does not need its own
round trip. State the subject, the destination shape, and the mode in the same
reply that carries the post.

## Step 9: Gate 2 - Before Posting

After the post file is written, show the post and get approval before it is
published, committed, or pushed anywhere.

- **`automation-mode` is `true`**: show the full post content, then ask a
  direct yes or no. Take no publishing action on silence or on anything short
  of an explicit yes.
- **`automation-mode` is `false`**: show the full post content and ask for
  approval, inviting edits. Apply any requested changes, show the revised post,
  and ask again. Publish only on approval.

In `paste` mode the rendered block is this gate: present it, invite edits, and
revise on request. In `staged` mode this gate closes at the hand-off summary.
Do not treat approval as permission to post on the user's behalf.

### Publishing

Publishing is a file operation. Do not call an external upload or CLI
publishing tool from this skill. After Gate 2 approval:

1. Write the post file to the path agreed at Gate 1.
2. When the workspace is a blog or site, place the file where that site expects
   posts and in its front matter format. Clear the draft flag at this point if
   the platform has one.
3. When the destination is a pseudo-blog venue, write the venue-shaped copy as
   described in `references/pseudo-blog-venues.md`, and report the venue
   description and file name to use.
4. When the post is archived to the post store as well, write the same content
   there under the chosen category.
5. Report the path or paths written.

Committing or pushing the post is a separate action and needs its own request
from the user, as is uploading it to a pseudo-blog venue.

## Step 10: Link in Documentation (Conditional)

After the post is written, decide whether to add a link to it from the
repository's documentation.

**Add the link when both are true:**

- The repository already documents the code (README, a `docs/` folder, or a doc
  comment on the function), **and**
- The post gives readers a useful standalone walkthrough.

**Do not add the link when:**

- No documentation exists for that code. Do not create a new docs file just to
  hold the link.
- The code is internal or private-only and is not meant for outside use.

When adding it, place it next to the existing documentation for that code, on
one line:

```
Walkthrough: <post URL or path>
```

## Step 11: Report Completion

Only if the post was approved and delivered successfully, end the response with
exactly:

```
BLOG POST MADE
```

Delivered means the file was written in `direct` mode, the file and hand-off
summary were given in `staged` mode, or the post was rendered in `paste` mode.

If the user declines at either gate, say so in one sentence and do not print
that line. If writing fails, report the failure in one sentence and do not
print that line.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Code fails the qualification test | Stay silent. Do not mention this skill or the post workflow at all. |
| Duplicate post found | Skip entirely. Do not create a second post for the same code. |
| Unsure which category folder to use | List existing folders under the post store root and reuse a matching one before creating a new one. |
| Post store root does not exist | Create category folders under an existing root only. If the root itself is missing, stop and ask. |
| Site build rejects the post | Open a neighboring post in the same folder and copy its front matter field set exactly. See `references/blog-platforms.md`. |
| Front matter renders as body text | The destination does not parse front matter. Reshape the post per `references/pseudo-blog-venues.md`. |
| Unsure whether to write a file | Ask at Gate 1. Writing an unwanted file is the more annoying error. |

## References

- `references/blog-platforms.md` - detection, posts folder, and front matter
  contract for common static site generators and hosted platforms.
- `references/pseudo-blog-venues.md` - shaping a post for a venue with no front
  matter, with a worked gist example.
- `references/seo-optimization.md` - optimization levels, keyword sourcing,
  title, slug, headings, tags, linking, and structured data.
