#!/usr/bin/env node

/**
 * newSkill.js - Add a new skill entry to the README.md Skills table
 *
 * Usage:
 *   node scripts/newSkill.js <skillName> [description]
 *
 * Parameters:
 *   skillName   - Required. The name of the skill folder (lowercase, hyphenated)
 *   description - Optional. A short description. Defaults to "Skill that covers <skillName>."
 *
 * Requirements:
 *   - A folder with the skill name must exist in the workspace root
 *   - A row with the skill name must NOT already exist in the README.md table
 */

const fs = require('fs');
const path = require('path');
const { sortTable } = require('./sortTable');

// Configuration
const README_PATH = path.join(__dirname, '..', 'README.md');
const WORKSPACE_ROOT = path.join(__dirname, '..');

// Row template with placeholders
const ROW_TEMPLATE = '| [CHANGE_SKILLNAME](CHANGE_SKILLNAME/SKILL.md) (*repo*) <br> [CHANGE_SKILLNAME](https://clawhub.ai/jhauga/CHANGE_SKILLNAME) (*on ClawHub*) | CHANGE_SKILL_DESCRIPTION |';

/**
 * Custom error class for skill-related errors
 */
class SkillError extends Error {
  constructor(message, code) {
    super(message);
    this.name = 'SkillError';
    this.code = code;
  }
}

/**
 * Check if a folder exists
 * @param {string} folderName - Name of the folder to check
 * @returns {boolean}
 */
function folderExists(folderName) {
  const folderPath = path.join(WORKSPACE_ROOT, folderName);
  try {
    return fs.statSync(folderPath).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a skill row already exists in README.md
 * @param {string} skillName - Name of the skill to check
 * @param {string} readmeContent - Content of README.md
 * @returns {boolean}
 */
function skillRowExists(skillName, readmeContent) {
  // Match skill name in table row format: [skillName](skillName/
  const pattern = new RegExp(`\\|\\s*\\[${escapeRegExp(skillName)}\\]\\(${escapeRegExp(skillName)}/`, 'i');
  return pattern.test(readmeContent);
}

/**
 * Escape special regex characters
 * @param {string} string - String to escape
 * @returns {string}
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find the insertion point for a new skill row in the README
 * Inserts after the last row in the Skills table
 * @param {string} content - README content
 * @returns {number} - Index where new row should be inserted
 */
function findInsertionPoint(content) {
  // Find the Skills table by looking for the header row
  const tableHeaderPattern = /\|\s*Skill\s*\|\s*Description\s*\|/i;
  const headerMatch = content.match(tableHeaderPattern);

  if (!headerMatch) {
    throw new SkillError('Skills table not found in README.md', 'TABLE_NOT_FOUND');
  }

  const headerIndex = headerMatch.index;

  // Find all table rows after the header
  // Table rows start with | and end with |
  const afterHeader = content.slice(headerIndex);
  const lines = afterHeader.split('\n');

  let insertIndex = headerIndex;
  let lineCount = 0;

  for (const line of lines) {
    lineCount++;
    // Skip header row and separator row
    if (lineCount <= 2) {
      insertIndex += line.length + 1; // +1 for newline
      continue;
    }
    // Check if this is a table row (starts with |)
    if (line.trim().startsWith('|')) {
      insertIndex += line.length + 1;
    } else {
      // End of table
      break;
    }
  }

  return insertIndex;
}

/**
 * Generate a new skill row from the template
 * @param {string} skillName - Name of the skill
 * @param {string} description - Description of the skill
 * @returns {string}
 */
function generateRow(skillName, description) {
  return ROW_TEMPLATE
    .replace(/CHANGE_SKILLNAME/g, skillName)
    .replace('CHANGE_SKILL_DESCRIPTION', description);
}

/**
 * Count the number of skill rows in the Skills table
 * @param {string} content - README content
 * @returns {number} - Number of skill rows
 */
function countSkillRows(content) {
  const tableHeaderPattern = /\|\s*Skill\s*\|\s*Description\s*\|/i;
  const headerMatch = content.match(tableHeaderPattern);
  if (!headerMatch) return 0;

  const afterHeader = content.slice(headerMatch.index);
  const lines = afterHeader.split('\n');
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    // Skip header row (i=0) and separator row (i=1)
    if (i <= 1) continue;
    const line = lines[i].trim();
    if (line.startsWith('|')) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Update the ### Total: N line in README.md
 * @param {string} content - README content
 * @param {number} count - New total count
 * @returns {string} - Updated content
 */
function updateTotalCount(content, count) {
  return content.replace(/###\s*Total:\s*\d+/i, `### Total: ${count}`);
}

/**
 * Main function to add a new skill to README.md
 * @param {string} skillName - Required. Name of the skill folder
 * @param {string} [description] - Optional. Description of the skill
 */
function addSkill(skillName, description) {
  // Validate skill name
  if (!skillName || typeof skillName !== 'string') {
    throw new SkillError('Skill name is required', 'MISSING_SKILL_NAME');
  }

  // Trim and validate
  skillName = skillName.trim();
  if (!skillName) {
    throw new SkillError('Skill name cannot be empty', 'EMPTY_SKILL_NAME');
  }

  // Generate default description if not provided
  if (!description || typeof description !== 'string' || !description.trim()) {
    description = `Skill that covers ${skillName}.`;
  } else {
    description = description.trim();
  }

  // Check if folder exists
  if (!folderExists(skillName)) {
    throw new SkillError(
      `Folder "${skillName}" does not exist. Create the skill folder first.`,
      'FOLDER_NOT_FOUND'
    );
  }

  // Read README.md
  let readmeContent;
  try {
    readmeContent = fs.readFileSync(README_PATH, 'utf8');
  } catch (err) {
    throw new SkillError(`Failed to read README.md: ${err.message}`, 'README_READ_ERROR');
  }

  // Check if skill row already exists
  if (skillRowExists(skillName, readmeContent)) {
    throw new SkillError(
      `Skill "${skillName}" already exists in the README.md table.`,
      'SKILL_EXISTS'
    );
  }

  // Find insertion point
  const insertIndex = findInsertionPoint(readmeContent);

  // Generate new row
  const newRow = generateRow(skillName, description);

  // Insert new row
  const updatedContent =
    readmeContent.slice(0, insertIndex) +
    newRow + '\n' +
    readmeContent.slice(insertIndex);

  // Count skill rows and update total
  const skillCount = countSkillRows(updatedContent);
  const finalContent = updateTotalCount(updatedContent, skillCount);

  // Write updated README.md
  try {
    fs.writeFileSync(README_PATH, finalContent, 'utf8');
  } catch (err) {
    throw new SkillError(`Failed to write README.md: ${err.message}`, 'README_WRITE_ERROR');
  }

  // Sort the Skills table so the newly inserted row lands in its proper place
  try {
    sortTable();
  } catch (err) {
    throw new SkillError(`Failed to sort Skills table: ${err.message}`, 'SORT_FAILED');
  }

  console.log(`✓ Successfully added skill "${skillName}" to README.md`);
  console.log(`  Description: ${description}`);
  console.log(`  Total skills: ${skillCount}`);
}

/**
 * Remove a skill row from README.md (used for testing cleanup)
 * @param {string} skillName - Name of the skill to remove
 */
function removeSkillRow(skillName) {
  let readmeContent;
  try {
    readmeContent = fs.readFileSync(README_PATH, 'utf8');
  } catch (err) {
    throw new SkillError(`Failed to read README.md: ${err.message}`, 'README_READ_ERROR');
  }

  // Build the exact row pattern to remove
  const rowPattern = new RegExp(
    `\\| \\[${escapeRegExp(skillName)}\\]\\(${escapeRegExp(skillName)}/SKILL\\.md\\) \\(\\*repo\\*\\) <br> \\[${escapeRegExp(skillName)}\\]\\(https://clawhub\\.ai/jhauga/${escapeRegExp(skillName)}\\) \\(\\*on ClawHub\\*\\) \\| [^|]+ \\|\\n?`,
    'g'
  );

  const updatedContent = readmeContent.replace(rowPattern, '');

  // Clean up any duplicate empty lines that might result
  const cleanedContent = updatedContent.replace(/\n{3,}/g, '\n\n');

  try {
    fs.writeFileSync(README_PATH, cleanedContent, 'utf8');
  } catch (err) {
    throw new SkillError(`Failed to write README.md: ${err.message}`, 'README_WRITE_ERROR');
  }
}

/**
 * Recursively create a directory (cross-platform mkdir -p)
 * @param {string} dirPath - Path to create
 */
function mkdirRecursive(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

/**
 * Recursively remove a directory (cross-platform rm -rf)
 * @param {string} dirPath - Path to remove
 */
function rmdirRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

/**
 * Run self-test to verify the script works correctly
 * Creates a temporary skill folder, adds it to README, verifies, then cleans up
 */
function runTest() {
  const TEST_SKILL_NAME = 'it-worked';
  const TEST_DESCRIPTION = 'it worked';
  const testFolderPath = path.join(WORKSPACE_ROOT, TEST_SKILL_NAME);

  console.log('Starting newSkill.js self-test...\n');

  try {
    // Step 1: Create temporary test folder
    console.log(`[1/6] Creating temporary test folder "${TEST_SKILL_NAME}"...`);
    mkdirRecursive(testFolderPath);
    
    // Create a minimal SKILL.md file in the test folder
    const skillMdContent = `---\nname: ${TEST_SKILL_NAME}\ndescription: ${TEST_DESCRIPTION}\n---\n\n# ${TEST_SKILL_NAME}\n\nTest skill for validation.\n`;
    fs.writeFileSync(path.join(testFolderPath, 'SKILL.md'), skillMdContent, 'utf8');
    console.log('   ✓ Test folder created');

    // Step 2: Run addSkill to add the test skill to README
    console.log(`[2/6] Adding "${TEST_SKILL_NAME}" to README.md...`);
    addSkill(TEST_SKILL_NAME, TEST_DESCRIPTION);
    console.log('   ✓ Skill added to README.md');

    // Step 3: Verify the row was added to README.md
    console.log('[3/6] Verifying skill row exists in README.md...');
    const readmeContent = fs.readFileSync(README_PATH, 'utf8');
    const expectedRowFragment = `| [${TEST_SKILL_NAME}](${TEST_SKILL_NAME}/SKILL.md) (*repo*) <br> [${TEST_SKILL_NAME}](https://clawhub.ai/jhauga/${TEST_SKILL_NAME}) (*on ClawHub*) | ${TEST_DESCRIPTION} |`;
    
    if (!readmeContent.includes(expectedRowFragment)) {
      throw new SkillError('Verification failed: skill row not found in README.md', 'VERIFICATION_FAILED');
    }
    console.log('   ✓ Skill row verified in README.md');

    // Step 4: Log pass message
    console.log('[4/6] Test passed: addSkill functionality working correctly');
    console.log('   ✓ PASS - Skill was successfully added to the table');

    // Step 5: Remove the test row from README.md
    console.log('[5/6] Cleaning up: removing test row from README.md...');
    removeSkillRow(TEST_SKILL_NAME);
    
    // Verify removal
    const cleanedContent = fs.readFileSync(README_PATH, 'utf8');
    if (cleanedContent.includes(expectedRowFragment)) {
      throw new SkillError('Cleanup failed: test row still exists in README.md', 'CLEANUP_FAILED');
    }
    console.log('   ✓ Test row removed from README.md');

    // Step 6: Remove the test folder
    console.log('[6/6] Cleaning up: removing temporary test folder...');
    rmdirRecursive(testFolderPath);
    console.log('   ✓ Temporary test folder removed');

    console.log('\n========================================');
    console.log('✓ All tests passed! Temporary test items have been cleaned up.');
    console.log('========================================\n');

  } catch (err) {
    // Cleanup on error
    console.error(`\n✗ Test failed: ${err.message}\n`);
    console.log('Attempting cleanup...');
    
    try {
      // Try to remove test row if it exists
      const readmeContent = fs.readFileSync(README_PATH, 'utf8');
      if (skillRowExists(TEST_SKILL_NAME, readmeContent)) {
        removeSkillRow(TEST_SKILL_NAME);
        console.log('   Cleaned up test row from README.md');
      }
    } catch (cleanupErr) {
      console.error(`   Failed to clean up README.md: ${cleanupErr.message}`);
    }
    
    try {
      // Try to remove test folder if it exists
      rmdirRecursive(testFolderPath);
      console.log('   Cleaned up test folder');
    } catch (cleanupErr) {
      console.error(`   Failed to clean up test folder: ${cleanupErr.message}`);
    }

    throw err;
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
Usage: node scripts/newSkill.js <skillName> [description]
       node scripts/newSkill.js --test

Parameters:
  skillName    Required. The name of the skill folder (lowercase, hyphenated)
  description  Optional. A short description of the skill
               Defaults to "Skill that covers <skillName>."

Options:
  --test       Run self-test to verify the script works correctly
  --help, -h   Show this help message

Requirements:
  - A folder with the skill name must exist in the workspace root
  - A row with the skill name must NOT already exist in the README.md table

Examples:
  node scripts/newSkill.js my-new-skill
  node scripts/newSkill.js my-new-skill "A skill for doing amazing things."
  node scripts/newSkill.js --test
`);
    process.exit(0);
  }

  // Handle --test flag
  if (args[0] === '--test') {
    try {
      runTest();
      process.exit(0);
    } catch (err) {
      if (err instanceof SkillError) {
        console.error(`Error [${err.code}]: ${err.message}`);
      } else {
        console.error(`Unexpected error: ${err.message}`);
      }
      process.exit(1);
    }
  }

  const skillName = args[0];
  const description = args.slice(1).join(' ') || undefined;

  try {
    addSkill(skillName, description);
    process.exit(0);
  } catch (err) {
    if (err instanceof SkillError) {
      console.error(`Error [${err.code}]: ${err.message}`);
    } else {
      console.error(`Unexpected error: ${err.message}`);
    }
    process.exit(1);
  }
}

module.exports = { addSkill, removeSkillRow, runTest, SkillError, countSkillRows, updateTotalCount };
