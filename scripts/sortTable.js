#!/usr/bin/env node

/**
 * sortTable.js - Sort the Skills table in README.md alphabetically by skill name
 * and keep its links, categories, letter anchors, and anchor nav in sync.
 *
 * Usage:
 *   node scripts/sortTable.js
 *
 * Behavior:
 *   - Locates the Skills table (header: | Skill | Category | Description |) in
 *     README.md, adding the Category column if the table does not have it yet
 *   - Points each row's repo link at the skill's current folder and fills the
 *     Category cell from it (see skillPath.js), so moving a folder only needs a rerun
 *   - Sorts data rows alphabetically (case-insensitive) by the skill name found
 *     in the first markdown link of the Skill column
 *   - Moves each letter anchor (<span id="x"></span>) to the first skill that
 *     starts with that letter, and drops anchors for letters with no skills
 *   - Rebuilds the anchor nav table above the Skills table so it links to every
 *     anchor, e.g. | [A](#a) | [B](#b) |
 *   - Preserves the surrounding content
 *   - Writes the result back to README.md
 */

const fs = require('fs');
const path = require('path');
const { listSkills } = require('./skillPath');

const README_PATH = path.join(__dirname, '..', 'README.md');

// Skills table header, with or without the Category column
const TABLE_HEADER_PATTERN = /\|\s*Skill\s*\|(?:\s*Category\s*\|)?\s*Description\s*\|/i;

const TABLE_HEADER_ROW = '| Skill | Category | Description |';
const TABLE_SEPARATOR_ROW = '|-------|----------|-------------|';

// Category cell for a skill that still sits at the repo root
const UNCATEGORIZED_CELL = '*uncategorized*';

// Letter anchor that may lead the Skill cell, e.g. <span id="a"></span>
const ANCHOR_PATTERN = '<span\\b[^>]*>\\s*</span>\\s*';

// Anchor nav row made only of single-character links, e.g. | [A](#a) | [B](#b) |
const NAV_ROW_PATTERN = /^\|(?:\s*\[[^\]\s]\]\(#[^)\s]*\)\s*\|)+[ \t]*$/;

// Delimiter row that turns the nav row into a table, e.g. |:-:|:-:|
const NAV_DELIMITER_PATTERN = /^\|(?:\s*:?-+:?\s*\|)+[ \t]*$/;

/**
 * Extract the skill name from a table row's first markdown link.
 * Matches the leading "| [name](..." pattern, skipping a letter anchor if present.
 * @param {string} row
 * @returns {string}
 */
function getSkillNameFromRow(row) {
  const match = row.match(new RegExp(`^\\|\\s*(?:${ANCHOR_PATTERN})?\\[([^\\]]+)\\]`));
  return match ? match[1].toLowerCase() : '';
}

/**
 * Remove the letter anchor from the start of a table row, if present.
 * @param {string} row
 * @returns {string}
 */
function stripAnchor(row) {
  return row.replace(new RegExp(`^\\|\\s*${ANCHOR_PATTERN}`), '| ');
}

/**
 * Split a table row into trimmed cells. Escaped pipes (\|) stay inside a cell.
 * @param {string} row
 * @returns {string[]}
 */
function splitCells(row) {
  return row.trim().replace(/^\|/, '').replace(/\|$/, '').split(/(?<!\\)\|/).map((cell) => cell.trim());
}

/**
 * Join cells back into a table row.
 * @param {string[]} cells
 * @returns {string}
 */
function joinCells(cells) {
  return `| ${cells.join(' | ')} |`;
}

/**
 * Build the Category cell for a skill.
 * @param {string|null} category
 * @returns {string}
 */
function categoryCell(category) {
  return category ? `[${category}](${category}/)` : UNCATEGORIZED_CELL;
}

/**
 * Give a data row a Category cell, then point its repo link and Category cell
 * at the skill's current folder. Rows whose folder is missing keep their link.
 * @param {string} row - Row without a letter anchor
 * @param {Map<string, { category: string|null, relPath: string }>} skillsByName
 * @returns {string}
 */
function syncRowWithFolder(row, skillsByName) {
  const cells = splitCells(row);
  if (cells.length === 2) cells.splice(1, 0, '');

  const skill = skillsByName.get(getSkillNameFromRow(row));
  if (skill) {
    cells[0] = cells[0].replace(/\]\([^)]*\)/, `](${skill.relPath}/SKILL.md)`);
    cells[1] = categoryCell(skill.category);
  } else if (!cells[1]) {
    cells[1] = UNCATEGORIZED_CELL;
  }
  return joinCells(cells);
}

/**
 * Add a letter anchor to the first row of each starting letter.
 * Expects rows that are already sorted and stripped of anchors.
 * @param {string[]} rows
 * @returns {{ rows: string[], ids: string[] }} - Anchored rows and anchor ids in table order
 */
function applyLetterAnchors(rows) {
  const ids = [];
  const anchoredRows = rows.map((row) => {
    const id = getSkillNameFromRow(row).charAt(0);
    if (!id || ids.includes(id)) return row;
    ids.push(id);
    return row.replace(/^\|\s*/, `| <span id="${id}"></span> `);
  });
  return { rows: anchoredRows, ids };
}

/**
 * Build the anchor nav table lines for the given anchor ids.
 * @param {string[]} ids
 * @returns {string[]} - Nav row and delimiter row, or an empty array when there are no ids
 */
function buildAnchorNav(ids) {
  if (ids.length === 0) return [];
  const links = ids.map((id) => `[${id.toUpperCase()}](#${id})`);
  const delimiters = ids.map(() => ':-:');
  return [`| ${links.join(' | ')} |`, `|${delimiters.join('|')}|`];
}

/**
 * Replace the anchor nav table in the README content that precedes the Skills
 * table. When no nav exists, insert one above the "### Total" line, or directly
 * above the Skills table if that line is missing.
 * @param {string} before - README content up to the Skills table header row
 * @param {string[]} ids
 * @returns {string}
 */
function updateAnchorNav(before, ids) {
  const navLines = buildAnchorNav(ids);
  const lines = before.split('\n');
  const navIndex = lines.findLastIndex((line) => NAV_ROW_PATTERN.test(line));

  if (navIndex !== -1) {
    const hasDelimiter = NAV_DELIMITER_PATTERN.test(lines[navIndex + 1] || '');
    lines.splice(navIndex, hasDelimiter ? 2 : 1, ...navLines);
    return lines.join('\n');
  }

  if (navLines.length === 0) return before;

  // The last element is the empty start of the Skills table header line
  const totalIndex = lines.findIndex((line) => /^###\s*Total:/i.test(line));
  const insertIndex = totalIndex !== -1 ? totalIndex : lines.length - 1;
  lines.splice(insertIndex, 0, ...navLines, '');
  return lines.join('\n');
}

/**
 * Sort the Skills table in README.md content, sync rows with skill folders,
 * and refresh its letter anchors.
 * @param {string} content
 * @param {{ name: string, category: string|null, relPath: string }[]} [skills] - Defaults to the repo's skill folders
 * @returns {string}
 */
function sortSkillsTable(content, skills = listSkills()) {
  const headerMatch = content.match(TABLE_HEADER_PATTERN);
  if (!headerMatch) {
    throw new Error('Skills table not found in README.md');
  }

  const headerIndex = headerMatch.index;
  const before = content.slice(0, headerIndex);
  const afterHeader = content.slice(headerIndex);
  const lines = afterHeader.split('\n');

  // Line 0: header row, Line 1: separator row
  if (lines.length < 2) {
    throw new Error('Skills table is malformed (missing separator row)');
  }

  const skillsByName = new Map(skills.map((skill) => [skill.name.toLowerCase(), skill]));

  // Collect contiguous data rows starting at index 2, dropping old anchors
  const dataRows = [];
  let i = 2;
  for (; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) {
      dataRows.push(syncRowWithFolder(stripAnchor(lines[i]), skillsByName));
    } else {
      break;
    }
  }
  const rest = lines.slice(i).join('\n');

  // Sort data rows alphabetically by skill name
  dataRows.sort((a, b) => {
    const nameA = getSkillNameFromRow(a);
    const nameB = getSkillNameFromRow(b);
    return nameA.localeCompare(nameB);
  });

  const { rows: anchoredRows, ids } = applyLetterAnchors(dataRows);

  const rebuiltTable = [TABLE_HEADER_ROW, TABLE_SEPARATOR_ROW, ...anchoredRows].join('\n');
  const suffix = rest.length > 0 ? '\n' + rest : '';
  return updateAnchorNav(before, ids) + rebuiltTable + suffix;
}

/**
 * Sort the README.md Skills table in place.
 */
function sortTable() {
  const content = fs.readFileSync(README_PATH, 'utf8');
  const updated = sortSkillsTable(content);
  if (updated !== content) {
    fs.writeFileSync(README_PATH, updated, 'utf8');
    console.log('✓ Sorted Skills table and refreshed anchor nav in README.md');
  } else {
    console.log('✓ Skills table already sorted and anchored; no changes made');
  }
}

if (require.main === module) {
  try {
    sortTable();
    process.exit(0);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

module.exports = {
  sortTable,
  sortSkillsTable,
  getSkillNameFromRow,
  stripAnchor,
  splitCells,
  categoryCell,
  applyLetterAnchors,
  buildAnchorNav,
  updateAnchorNav,
  ANCHOR_PATTERN,
  TABLE_HEADER_PATTERN,
  UNCATEGORIZED_CELL,
};
