#!/usr/bin/env node

/**
 * auditSkills.js - Check skill folders, categories, and the README Skills table.
 *
 * Usage:
 *   node scripts/auditSkills.js
 *
 * Reports:
 *   - Uncategorized skills at the repo root (information, not a problem)
 *   - Categories listed in categories.json that have no folder yet (warning)
 *   - Invalid categories.json entries
 *   - Folders that hold skills but are not listed in categories.json
 *   - Folders at the repo root or inside a category with no SKILL.md
 *   - Skill names found in more than one folder
 *   - README rows with no skill folder, and skills with no README row
 *   - README table order, links, categories, anchors, or nav out of sync
 *   - "### Total: N" not matching the number of README rows
 *   - Relative links in skill markdown files that point to missing files
 *
 * Exits 1 when any problem is found, 0 otherwise.
 */

const fs = require('fs');
const path = require('path');
const {
  REPO_ROOT,
  loadCategories,
  listSubfolders,
  isSkillFolder,
  listSkills,
} = require('./skillPath');
const { sortSkillsTable, getSkillNameFromRow, TABLE_HEADER_PATTERN } = require('./sortTable');

const README_PATH = path.join(REPO_ROOT, 'README.md');

// Root folders that hold repo tooling rather than skills or categories
const RESERVED_FOLDERS = new Set(['scripts', 'node_modules']);

// Lowercase, hyphenated folder name, e.g. graphic-design
const FOLDER_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * List markdown files under a folder, skipping hidden folders.
 * @param {string} dir
 * @returns {string[]} - Absolute file paths
 */
function listMarkdownFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(fullPath));
    } else if (entry.name.toLowerCase().endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

/**
 * Extract relative link targets from markdown, ignoring fenced code blocks,
 * inline code, URLs with a scheme, and in-page anchors.
 * @param {string} markdown
 * @returns {{ line: number, target: string }[]}
 */
function extractRelativeLinks(markdown) {
  const links = [];
  let fence = null;

  markdown.split(/\r?\n/).forEach((rawLine, index) => {
    const fenceMatch = rawLine.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (fenceMatch) {
      if (!fence) fence = fenceMatch[1];
      else if (fenceMatch[1].startsWith(fence)) fence = null;
      return;
    }
    if (fence) return;

    const line = rawLine.replace(/(`+)[\s\S]*?\1/g, '');
    const targets = [];
    for (const match of line.matchAll(/!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g)) {
      targets.push(match[1]);
    }
    const reference = line.match(/^\s*\[[^\]]+\]:\s*<?(\S+?)>?(?:\s|$)/);
    if (reference) targets.push(reference[1]);

    for (const target of targets) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#') || target.startsWith('/')) continue;
      links.push({ line: index + 1, target });
    }
  });
  return links;
}

/**
 * Find relative links in a skill's markdown files whose targets do not exist.
 * @param {string} skillDir - Absolute path of the skill folder
 * @returns {{ file: string, line: number, target: string }[]} - file is relative to the repo root
 */
function findBrokenLinks(skillDir) {
  const broken = [];
  for (const file of listMarkdownFiles(skillDir)) {
    const markdown = fs.readFileSync(file, 'utf8');
    for (const { line, target } of extractRelativeLinks(markdown)) {
      let targetPath = target.split(/[?#]/)[0];
      if (!targetPath) continue;
      try {
        targetPath = decodeURIComponent(targetPath);
      } catch {
        // Keep the raw target when it is not valid percent-encoding
      }
      if (!fs.existsSync(path.resolve(path.dirname(file), targetPath))) {
        broken.push({ file: path.relative(REPO_ROOT, file).split(path.sep).join('/'), line, target });
      }
    }
  }
  return broken;
}

/**
 * Collect the data rows of the README Skills table.
 * @param {string} content
 * @returns {string[]}
 */
function readTableRows(content) {
  const headerMatch = content.match(TABLE_HEADER_PATTERN);
  if (!headerMatch) return [];
  const rows = [];
  for (const line of content.slice(headerMatch.index).split('\n').slice(2)) {
    if (!line.trim().startsWith('|')) break;
    rows.push(line);
  }
  return rows;
}

/**
 * Audit the repo layout and README.
 * @returns {{ skills: object[], categories: object, uncategorized: string[], warnings: string[], problems: string[] }}
 */
function auditSkills() {
  const warnings = [];
  const problems = [];

  let categories = {};
  try {
    categories = loadCategories();
  } catch (err) {
    problems.push(`categories.json is not valid JSON: ${err.message}`);
  }
  if (typeof categories !== 'object' || categories === null || Array.isArray(categories)) {
    problems.push('categories.json must be an object mapping category folder names to descriptions');
    categories = {};
  }

  for (const [category, description] of Object.entries(categories)) {
    const categoryDir = path.join(REPO_ROOT, category);
    if (!FOLDER_NAME_PATTERN.test(category)) {
      problems.push(`Category "${category}" in categories.json is not a lowercase, hyphenated folder name`);
    }
    if (typeof description !== 'string' || !description.trim()) {
      problems.push(`Category "${category}" in categories.json needs a one-line description`);
    }
    if (!fs.existsSync(categoryDir)) {
      warnings.push(`Category "${category}" is listed in categories.json but has no folder yet`);
    } else if (isSkillFolder(categoryDir)) {
      problems.push(`Category "${category}" is also a skill folder (it holds a SKILL.md)`);
    }
  }

  // Root folders: skills, listed categories, reserved tooling, or something unexpected
  for (const folder of listSubfolders(REPO_ROOT)) {
    if (Object.hasOwn(categories, folder) || RESERVED_FOLDERS.has(folder)) continue;
    const folderDir = path.join(REPO_ROOT, folder);
    if (isSkillFolder(folderDir)) continue;
    const holdsSkills = listSubfolders(folderDir).some((child) => isSkillFolder(path.join(folderDir, child)));
    problems.push(holdsSkills
      ? `Folder "${folder}" holds skills but is not listed in categories.json`
      : `Folder "${folder}" has no SKILL.md and is not a listed category`);
  }

  // Category folders may only hold skill folders
  for (const category of Object.keys(categories)) {
    for (const child of listSubfolders(path.join(REPO_ROOT, category))) {
      if (!isSkillFolder(path.join(REPO_ROOT, category, child))) {
        problems.push(`Folder "${category}/${child}" has no SKILL.md`);
      }
    }
  }

  const skills = listSkills(categories);
  const relPathsByName = new Map();
  for (const skill of skills) {
    relPathsByName.set(skill.name, [...(relPathsByName.get(skill.name) || []), skill.relPath]);
  }
  for (const [name, relPaths] of relPathsByName) {
    if (relPaths.length > 1) {
      problems.push(`Skill "${name}" exists in more than one folder: ${relPaths.join(', ')}`);
    }
  }

  // README Skills table
  let readme = '';
  try {
    readme = fs.readFileSync(README_PATH, 'utf8');
  } catch (err) {
    problems.push(`Failed to read README.md: ${err.message}`);
  }
  const rows = readTableRows(readme);
  if (readme && rows.length === 0) {
    problems.push('Skills table not found in README.md');
  }
  const rowNames = new Set(rows.map(getSkillNameFromRow));
  for (const name of rowNames) {
    if (!relPathsByName.has(name)) problems.push(`README row "${name}" has no skill folder`);
  }
  for (const skill of skills) {
    if (!rowNames.has(skill.name)) problems.push(`Skill "${skill.relPath}" has no README row`);
  }
  if (rows.length > 0 && sortSkillsTable(readme, skills) !== readme) {
    problems.push('README Skills table is out of sync (order, links, categories, anchors, or nav); run node scripts/sortTable.js');
  }
  const total = readme.match(/###\s*Total:\s*(\d+)/i);
  if (total && Number(total[1]) !== rows.length) {
    problems.push(`README "Total: ${total[1]}" does not match its ${rows.length} rows`);
  }

  for (const skill of skills) {
    for (const link of findBrokenLinks(path.join(REPO_ROOT, skill.relPath))) {
      problems.push(`Broken link in ${link.file}:${link.line} -> ${link.target}`);
    }
  }

  const uncategorized = skills.filter((skill) => !skill.category).map((skill) => skill.name);
  return { skills, categories, uncategorized, warnings, problems };
}

if (require.main === module) {
  try {
    const { skills, categories, uncategorized, warnings, problems } = auditSkills();
    const categorizedCount = skills.length - uncategorized.length;

    console.log(`Skills: ${skills.length} (${categorizedCount} categorized, ${uncategorized.length} uncategorized)`);
    console.log(`Categories: ${Object.keys(categories).length} in categories.json`);

    if (uncategorized.length > 0) {
      console.log('\nUncategorized skills at the repo root (move with node scripts/categorize.js <skillName> <category>):');
      uncategorized.forEach((name) => console.log(`  - ${name}`));
    }
    if (warnings.length > 0) {
      console.log('\nWarnings:');
      warnings.forEach((warning) => console.log(`  ! ${warning}`));
    }
    if (problems.length > 0) {
      console.log('\nProblems:');
      problems.forEach((problem) => console.log(`  ✗ ${problem}`));
      console.log(`\n✗ ${problems.length} problem(s) found`);
      process.exit(1);
    }
    console.log('\n✓ No problems found');
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = { auditSkills, findBrokenLinks, extractRelativeLinks, RESERVED_FOLDERS };
