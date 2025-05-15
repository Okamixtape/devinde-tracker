/**
 * Test Migrations Script
 * 
 * This script helps test the migration of core services and hooks to use
 * standardized interfaces. It creates test data, runs tests, and validates
 * the results.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define test files
const TEST_FILES = [
  'tests/business-plan-migration-test.js',
  'tests/useActionPlan-migration-test.js'
];

console.log('=== TESTING MIGRATION TO STANDARDIZED INTERFACES ===\n');

// Check if test files exist
for (const file of TEST_FILES) {
  if (!fs.existsSync(path.join(process.cwd(), file))) {
    console.error(`Error: Test file ${file} not found!`);
    process.exit(1);
  }
}

console.log('All test files found. Running tests...\n');

// Run each test
TEST_FILES.forEach(file => {
  console.log(`[Running] ${file}...`);
  
  try {
    // Execute the test and capture the output
    const output = execSync(`node ${file}`, { encoding: 'utf-8' });
    console.log(output);
    console.log(`[Success] ${file} completed successfully!\n`);
  } catch (error) {
    console.error(`[Failed] ${file} failed with error: ${error.message}`);
    console.error(error.stdout);
    process.exit(1);
  }
});

console.log('=== MIGRATION TESTS COMPLETED SUCCESSFULLY ===\n');

// Create simple report
const reportPath = path.join(process.cwd(), 'reports/migration-test-report.md');
const reportContent = `# Migration Test Report

## Date: ${new Date().toISOString()}

## Tests Run:
${TEST_FILES.map(file => `- ${file}`).join('\n')}

## Results:
All tests completed successfully!

## Next Steps:
1. Continue migrating hooks: useBusinessModel, useMarketAnalysis, etc.
2. Update UI components to use standardized interfaces
3. Add end-to-end tests for migrated components

## Notes:
This migration ensures backward compatibility while providing enhanced type safety and standardized interfaces for UI components.
`;

// Ensure reports directory exists
if (!fs.existsSync(path.join(process.cwd(), 'reports'))) {
  fs.mkdirSync(path.join(process.cwd(), 'reports'));
}

// Write the report
fs.writeFileSync(reportPath, reportContent);
console.log(`Report saved to ${reportPath}`);