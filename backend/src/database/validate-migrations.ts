/**
 * Migration Validation Script
 * 
 * Validates that all migration files are properly formatted and paired with rollback files.
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate migration files
 */
function validateMigrations(): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: [],
  };

  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    result.valid = false;
    result.errors.push('Migrations directory does not exist');
    return result;
  }

  const files = fs.readdirSync(migrationsDir);
  const upMigrations = files.filter(f => f.endsWith('.sql') && !f.endsWith('.down.sql'));
  const downMigrations = files.filter(f => f.endsWith('.down.sql'));

  // Check that each up migration has a corresponding down migration
  for (const upFile of upMigrations) {
    const downFile = upFile.replace('.sql', '.down.sql');
    
    if (!downMigrations.includes(downFile)) {
      result.valid = false;
      result.errors.push(`Missing rollback file for ${upFile}: ${downFile}`);
    }

    // Check file is not empty
    const upPath = path.join(migrationsDir, upFile);
    const content = fs.readFileSync(upPath, 'utf-8').trim();
    
    if (content.length === 0) {
      result.valid = false;
      result.errors.push(`Migration file is empty: ${upFile}`);
    }

    // Check for basic SQL syntax
    if (!content.toUpperCase().includes('CREATE') && 
        !content.toUpperCase().includes('ALTER') &&
        !content.toUpperCase().includes('DROP')) {
      result.warnings.push(`Migration ${upFile} may not contain valid SQL statements`);
    }
  }

  // Check for orphaned down migrations
  for (const downFile of downMigrations) {
    const upFile = downFile.replace('.down.sql', '.sql');
    
    if (!upMigrations.includes(upFile)) {
      result.warnings.push(`Orphaned rollback file: ${downFile}`);
    }
  }

  // Check migration numbering
  const numbers = upMigrations.map(f => {
    const match = f.match(/^(\d+)_/);
    return match ? parseInt(match[1]) : null;
  }).filter(n => n !== null) as number[];

  if (numbers.length !== upMigrations.length) {
    result.warnings.push('Some migration files do not follow naming convention (XXX_name.sql)');
  }

  // Check for gaps in numbering
  const sortedNumbers = [...numbers].sort((a, b) => a - b);
  for (let i = 0; i < sortedNumbers.length - 1; i++) {
    if (sortedNumbers[i + 1] - sortedNumbers[i] > 1) {
      result.warnings.push(`Gap in migration numbering between ${sortedNumbers[i]} and ${sortedNumbers[i + 1]}`);
    }
  }

  return result;
}

/**
 * Main function
 */
function main() {
  console.log('Validating migration files...\n');
  
  const result = validateMigrations();
  
  if (result.errors.length > 0) {
    console.log('❌ ERRORS:');
    result.errors.forEach(err => console.log(`  - ${err}`));
    console.log();
  }
  
  if (result.warnings.length > 0) {
    console.log('⚠️  WARNINGS:');
    result.warnings.forEach(warn => console.log(`  - ${warn}`));
    console.log();
  }
  
  if (result.valid && result.warnings.length === 0) {
    console.log('✅ All migration files are valid!\n');
  } else if (result.valid) {
    console.log('✅ Migration files are valid (with warnings)\n');
  } else {
    console.log('❌ Migration validation failed\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { validateMigrations };
