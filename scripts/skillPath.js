#!/usr/bin/env node

/**
 * skillPath.js - Find where a skill folder lives in the repo.
 *
 * Usage:
 *   node scripts/skillPath.js <skillName>
 *
 * Behavior:
 *   - Prints the skill folder relative to the repo root: <skillName> for an
 *     uncategorized skill at the root, or <category>/<skillName> once categorized
 *   - Prints with the platform path separator so CMD and shell scripts can use
 *     the output directly
 *   - Exits 1 when the skill is not found, and 2 on a usage error or when the
 *     skill name exists in more than one folder
 *
 * Layout:
 *   - categories.json lists the valid category folders
 *   - A skill is a folder holding a SKILL.md, either at the repo root
 *     (uncategorized) or directly inside a category folder
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.join(__dirname, '..');
const CATEGORIES_PATH = path.join(REPO_ROOT, 'categories.json');

/**
 * Read categories.json.
 * @returns {Object<string, string>} - Category folder names mapped to descriptions
 */
function loadCategories() {
  if (!fs.existsSync(CATEGORIES_PATH)) return {};
  return JSON.parse(fs.readFileSync(CATEGORIES_PATH, 'utf8'));
}

/**
 * List the visible subfolders of a folder.
 * @param {string} dir
 * @returns {string[]}
 */
function listSubfolders(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
      .map((entry) => entry.name);
  } catch {
    return [];
  }
}

/**
 * Check whether a folder is a skill (holds a SKILL.md).
 * @param {string} dir
 * @returns {boolean}
 */
function isSkillFolder(dir) {
  return fs.existsSync(path.join(dir, 'SKILL.md'));
}

/**
 * List every skill at the repo root and inside category folders.
 * @param {Object<string, string>} [categories] - Defaults to categories.json
 * @returns {{ name: string, category: string|null, relPath: string }[]} - relPath uses forward slashes
 */
function listSkills(categories = loadCategories()) {
  const skills = [];
  for (const folder of listSubfolders(REPO_ROOT)) {
    if (Object.hasOwn(categories, folder)) {
      for (const child of listSubfolders(path.join(REPO_ROOT, folder))) {
        if (isSkillFolder(path.join(REPO_ROOT, folder, child))) {
          skills.push({ name: child, category: folder, relPath: `${folder}/${child}` });
        }
      }
    } else if (isSkillFolder(path.join(REPO_ROOT, folder))) {
      skills.push({ name: folder, category: null, relPath: folder });
    }
  }
  return skills;
}

/**
 * Find every folder holding the named skill. More than one match means the
 * skill is duplicated across the root and category folders.
 * @param {string} skillName
 * @param {Object<string, string>} [categories]
 * @returns {{ name: string, category: string|null, relPath: string }[]}
 */
function findSkills(skillName, categories) {
  return listSkills(categories).filter((skill) => skill.name === skillName);
}

/**
 * Convert a forward-slash relPath to the platform path separator.
 * @param {string} relPath
 * @returns {string}
 */
function toNativePath(relPath) {
  return relPath.split('/').join(path.sep);
}

if (require.main === module) {
  const skillName = (process.argv[2] || '').trim();

  if (!skillName || skillName === '--help' || skillName === '-h') {
    console.log(`
Usage: node scripts/skillPath.js <skillName>

Prints the skill folder relative to the repo root:
  <skillName>             uncategorized skill at the repo root
  <category>/<skillName>  categorized skill

Exit codes:
  0  Found
  1  Not found
  2  Usage error, or the skill exists in more than one folder
`);
    process.exit(skillName ? 0 : 2);
  }

  try {
    const matches = findSkills(skillName);
    if (matches.length === 0) {
      console.error(`Skill "${skillName}" not found at the repo root or in any category folder.`);
      process.exit(1);
    }
    if (matches.length > 1) {
      console.error(`Skill "${skillName}" exists in more than one folder: ${matches.map((m) => m.relPath).join(', ')}`);
      process.exit(2);
    }
    console.log(toNativePath(matches[0].relPath));
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(2);
  }
}

module.exports = {
  REPO_ROOT,
  CATEGORIES_PATH,
  loadCategories,
  listSubfolders,
  isSkillFolder,
  listSkills,
  findSkills,
  toNativePath,
};
