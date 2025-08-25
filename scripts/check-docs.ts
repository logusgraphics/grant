#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';

/**
 * Simple script to verify all documentation links in the centralized docs/README.md
 */

const DOCS_DIR = path.join(process.cwd(), 'docs');
const SCRIPTS_DIR = path.join(process.cwd(), 'scripts');
const ROOT_README = path.join(process.cwd(), 'README.md');

const documentationFiles = [
  // Core documentation files
  'docs/README.md',
  'docs/MULTI_TENANCY_SPECIFICATION.md',
  'docs/RELATIONSHIP_MODEL.md',
  'docs/FIELD_SELECTION_OPTIMIZATION.md',
  'docs/DRIZZLE_IMPLEMENTATION.md',
  'docs/DEVELOPMENT_GUIDE.md',
  'docs/TESTING.md',
  'docs/COMPONENTS.md',

  // Root documentation
  'README.md',
];

async function checkDocumentationFiles() {
  console.log('📚 Checking documentation files...\n');

  let allFilesExist = true;

  for (const filePath of documentationFiles) {
    const fullPath = path.join(process.cwd(), filePath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      const stats = fs.statSync(fullPath);
      const sizeKB = Math.round((stats.size / 1024) * 100) / 100;
      console.log(`✅ ${filePath} (${sizeKB} KB)`);
    } else {
      console.log(`❌ ${filePath} - FILE NOT FOUND`);
      allFilesExist = false;
    }
  }

  console.log('\n📊 Documentation Summary:');
  console.log(`   - Total files checked: ${documentationFiles.length}`);
  console.log(
    `   - Files found: ${documentationFiles.filter((f) => fs.existsSync(path.join(process.cwd(), f))).length}`
  );
  console.log(
    `   - Files missing: ${documentationFiles.filter((f) => !fs.existsSync(path.join(process.cwd(), f))).length}`
  );

  if (allFilesExist) {
    console.log('\n✅ All documentation files are present!');
    console.log('📖 Start with docs/README.md for the complete documentation index.');
  } else {
    console.log('\n❌ Some documentation files are missing!');
    console.log('Please ensure all referenced files exist.');
    process.exit(1);
  }
}

checkDocumentationFiles();
