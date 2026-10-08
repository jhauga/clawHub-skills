#!/usr/bin/env node

/**
 * categorize.js - Move skill folders into a category folder and update README.md.
 *
 * Usage:
 *   node scripts/categorize.js <skillName> [skillName...] <category>
 *
 * Behavior:
 *   - Accepts any category listed in categories.json, creating its folder if needed
 *   - Moves each skill from the repo root, or from another category, with git mv so
 *     file history follows it (a plain rename when the folder is not tracked yet)
 *   - Reruns sortTable.js so each README row links to <category>/<skillName>/SKILL.md
 *     and shows the new category
 *   - Warns about relative links in a moved skill that no longer resolve
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { REPO_ROOT, loadCategories, findSkills } = require('./skillPath');
const { sortTable } = require('./sortTable');
const { findBrokenLinks } = require('./auditSkills');

/**
 * Custom error class for categorize errors
 */
class CategorizeError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'CategorizeError';
    this.code = code;
  }
}

/**
 * Run git in the repo root and return stdout.
 * @param {string[]} args
 * @returns {string}
 */
function git(args) {
  try {
    return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (err) {
    const detail = (err.stderr || err.message || '').toString().trim();
    throw new CategorizeError(`git ${args.join(' ')} failed: ${detail}`, 'GIT_FAILED');
  }
}

/**
 * Check whether git tracks any file under a repo-relative path.
 * @param {string} relPath
 * @returns {boolean}
 */
function isTracked(relPath) {
  try {
    return git(['ls-files', '--', relPath]).trim().length > 0;
  } catch {
    return false;
  }
}

/**
 * Move one skill folder into a category folder. Does not touch README.md.
 * @param {string} skillName
 * @param {string} category
 * @param {Object<string, string>} categories
 * @returns {{ from: string, to: string }|null} - Repo-relative paths, or null when already in place
 */
function moveSkill(skillName, category, categories) {
  const matches = findSkills(skillName, categories);
  if (matches.length === 0) {
    throw new CategorizeError(`Skill "${skillName}" not found at the repo root or in any category folder.`, 'SKILL_NOT_FOUND');
  }
  if (matches.length > 1) {
    throw new CategorizeError(
      `Skill "${skillName}" exists in more than one folder: ${matches.map((m) => m.relPath).join(', ')}`,
      'DUPLICATE_SKILL'
    );
  }

  const [skill] = matches;
  if (skill.category === category) return null;

  const from = skill.relPath;
  const to = `${category}/${skillName}`;
  if (fs.existsSync(path.join(REPO_ROOT, to))) {
    throw new CategorizeError(`Cannot move "${from}": "${to}" already exists.`, 'TARGET_EXISTS');
  }

  fs.mkdirSync(path.join(REPO_ROOT, category), { recursive: true });
  if (isTracked(from)) {
    git(['mv', '--', from, to]);
  } else {
    fs.renameSync(path.join(REPO_ROOT, from), path.join(REPO_ROOT, to));
  }
  return { from, to };
}

/**
 * Move skills into a category, then sync the README Skills table.
 * @param {string[]} skillNames
 * @param {string} category
 */
function categorize(skillNames, category) {
  if (skillNames.length === 0 || !category) {
    throw new CategorizeError('A skill name and a category are required.', 'MISSING_ARGUMENTS');
  }

  const categories = loadCategories();
  if (!Object.hasOwn(categories, category)) {
    throw new CategorizeError(
      `Category "${category}" is not listed in categories.json. Valid categories: ${Object.keys(categories).join(', ')}`,
      'UNKNOWN_CATEGORY'
    );
  }

  const moved = [];
  try {
    for (const skillName of skillNames) {
      const result = moveSkill(skillName, category, categories);
      if (result) {
        moved.push(result);
        console.log(`✓ Moved ${result.from}/ to ${result.to}/`);
      } else {
        console.log(`✓ "${skillName}" is already in ${category}/`);
      }
    }
  } finally {
    // Keep README.md in step with whatever moved, even when a later skill fails
    if (moved.length > 0) sortTable();
  }

  for (const { to } of moved) {
    for (const link of findBrokenLinks(path.join(REPO_ROOT, to))) {
      console.warn(`! Broken link in ${link.file}:${link.line} -> ${link.target}`);
    }
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2 || args.includes('--help') || args.includes('-h')) {
    const categories = (() => {
      try {
        return Object.keys(loadCategories()).join(', ');
      } catch {
        return '(categories.json could not be read)';
      }
    })();
    console.log(`
Usage: node scripts/categorize.js <skillName> [skillName...] <category>

Moves skill folders into a category folder with git mv, then updates the
README Skills table links and Category column.

Categories (from categories.json):
  ${categories}

Examples:
  node scripts/categorize.js demo-skill coding
  node scripts/categorize.js demo-skill sample-skill documentation
`);
    process.exit(args.length < 2 && !args.includes('--help') && !args.includes('-h') ? 1 : 0);
  }

  try {
    categorize(args.slice(0, -1), args[args.length - 1]);
    process.exit(0);
  } catch (err) {
    if (err instanceof CategorizeError) {
      console.error(`Error [${err.code}]: ${err.message}`);
    } else {
      console.error(`Unexpected error: ${err.message}`);
    }
    process.exit(1);
  }
}

module.exports = { categorize, moveSkill, CategorizeError };
