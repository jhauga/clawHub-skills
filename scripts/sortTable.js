#!/usr/bin/env node

/**
 * sortTable.js - Sort the Skills table in README.md alphabetically by skill name.
 *
 * Usage:
 *   node scripts/sortTable.js
 *
 * Behavior:
 *   - Locates the Skills table (header: | Skill | Description |) in README.md
 *   - Sorts data rows alphabetically (case-insensitive) by the skill name found
 *     in the first markdown link of the Skill column
 *   - Preserves the header row, separator row, and surrounding content
 *   - Writes the result back to README.md
 */

const fs = require('fs');
const path = require('path');

const README_PATH = path.join(__dirname, '..', 'README.md');

/**
 * Extract the skill name from a table row's first markdown link.
 * Matches the leading "| [name](..." pattern.
 * @param {string} row
 * @returns {string}
 */
function getSkillNameFromRow(row) {
  const match = row.match(/^\|\s*\[([^\]]+)\]/);
  return match ? match[1].toLowerCase() : '';
}

/**
 * Sort the Skills table in README.md content.
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

  // Collect contiguous data rows starting at index 2
  const dataRows = [];
  let i = 2;
  for (; i < lines.length; i++) {
    if (lines[i].trim().startsWith('|')) {
      dataRows.push(lines[i]);
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

  const rebuiltTable = [headerRow, separatorRow, ...dataRows].join('\n');
  const suffix = rest.length > 0 ? '\n' + rest : '';
  return before + rebuiltTable + suffix;
}

/**
 * Sort the README.md Skills table in place.
 */
function sortTable() {
  const content = fs.readFileSync(README_PATH, 'utf8');
  const updated = sortSkillsTable(content);
  if (updated !== content) {
    fs.writeFileSync(README_PATH, updated, 'utf8');
    console.log('✓ Sorted Skills table in README.md');
  } else {
    console.log('✓ Skills table already sorted; no changes made');
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

module.exports = { sortTable, sortSkillsTable, getSkillNameFromRow };
