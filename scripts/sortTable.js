#!/usr/bin/env node

/**
 * sortTable.js - Sort the Skills table in README.md alphabetically by skill name
 * and keep its letter anchors and anchor nav in sync.
 *
 * Usage:
 *   node scripts/sortTable.js
 *
 * Behavior:
 *   - Locates the Skills table (header: | Skill | Description |) in README.md
 *   - Sorts data rows alphabetically (case-insensitive) by the skill name found
 *     in the first markdown link of the Skill column
 *   - Moves each letter anchor (<span id="x"></span>) to the first skill that
 *     starts with that letter, and drops anchors for letters with no skills
 *   - Rebuilds the anchor nav table above the Skills table so it links to every
 *     anchor, e.g. | [A](#a) | [B](#b) |
 *   - Preserves the header row, separator row, and surrounding content
 *   - Writes the result back to README.md
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');

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
 * Sort the Skills table in README.md content and refresh its letter anchors.
 * @param {string} content
 * @returns {string}
 */
function sortSkillsTable(content) {
  const tableHeaderPattern = /\|\s*Skill\s*\|\s*Description\s*\|/i;
  const headerMatch = content.match(tableHeaderPattern);
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

  const headerRow = lines[0];
  const separatorRow = lines[1];

  // Collect contiguous data rows starting at index 2, dropping old anchors
  const dataRows = [];
  let i = 2;
  for (; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) {
      dataRows.push(stripAnchor(lines[i]));
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

  const rebuiltTable = [headerRow, separatorRow, ...anchoredRows].join('\n');
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
  applyLetterAnchors,
  buildAnchorNav,
  updateAnchorNav,
  ANCHOR_PATTERN,
};
