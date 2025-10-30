/**
 * Database Migration Runner
 * 
 * This script runs SQL migrations in order.
 * Usage:
 *   npm run migrate up    - Run all pending migrations
 *   npm run migrate down  - Rollback the last migration
 */

import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Migration tracking table
const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Create migrations tracking table if it doesn't exist
 */
async function createMigrationsTable(): Promise<void> {
  const query = `
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await pool.query(query);
}

/**
 * Get list of executed migrations
 */
async function getExecutedMigrations(): Promise<string[]> {
  const result = await pool.query(
    `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY id`
  );
  return result.rows.map(row => row.name);
}

/**
 * Get list of available migration files
 */
function getAvailableMigrations(): string[] {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir);
  
  // Filter for .sql files (not .down.sql) and sort
  return files
    .filter(file => file.endsWith('.sql') && !file.endsWith('.down.sql'))
    .sort();
}

/**
 * Execute a migration file
 */
async function executeMigration(filename: string): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const filePath = path.join(migrationsDir, filename);
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`Executing migration: ${filename}`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES ($1)`,
      [filename]
    );
    await client.query('COMMIT');
    console.log(`✓ Migration ${filename} completed successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Migration ${filename} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Rollback a migration
 */
async function rollbackMigration(filename: string): Promise<void> {
  const migrationsDir = path.join(__dirname, 'migrations');
  const downFilename = filename.replace('.sql', '.down.sql');
  const filePath = path.join(migrationsDir, downFilename);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Rollback file not found: ${downFilename}`);
  }
  
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`Rolling back migration: ${filename}`);
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query(
      `DELETE FROM ${MIGRATIONS_TABLE} WHERE name = $1`,
      [filename]
    );
    await client.query('COMMIT');
    console.log(`✓ Rollback ${filename} completed successfully`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`✗ Rollback ${filename} failed:`, error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Run all pending migrations
 */
async function migrateUp(): Promise<void> {
  await createMigrationsTable();
  
  const executed = await getExecutedMigrations();
  const available = getAvailableMigrations();
  
  const pending = available.filter(file => !executed.includes(file));
  
  if (pending.length === 0) {
    console.log('No pending migrations');
    return;
  }
  
  console.log(`Found ${pending.length} pending migration(s)`);
  
  for (const migration of pending) {
    await executeMigration(migration);
  }
  
  console.log('\n✓ All migrations completed successfully');
}

/**
 * Rollback the last migration
 */
async function migrateDown(): Promise<void> {
  await createMigrationsTable();
  
  const executed = await getExecutedMigrations();
  
  if (executed.length === 0) {
    console.log('No migrations to rollback');
    return;
  }
  
  const lastMigration = executed[executed.length - 1];
  await rollbackMigration(lastMigration);
  
  console.log('\n✓ Rollback completed successfully');
}

/**
 * Show migration status
 */
async function showStatus(): Promise<void> {
  await createMigrationsTable();
  
  const executed = await getExecutedMigrations();
  const available = getAvailableMigrations();
  
  console.log('\nMigration Status:');
  console.log('=================\n');
  
  for (const migration of available) {
    const status = executed.includes(migration) ? '✓' : '✗';
    console.log(`${status} ${migration}`);
  }
  
  console.log(`\nTotal: ${available.length} migrations`);
  console.log(`Executed: ${executed.length}`);
  console.log(`Pending: ${available.length - executed.length}`);
}

/**
 * Main function
 */
async function main() {
  const command = process.argv[2];
  
  try {
    switch (command) {
      case 'up':
        await migrateUp();
        break;
      case 'down':
        await migrateDown();
        break;
      case 'status':
        await showStatus();
        break;
      default:
        console.log('Usage:');
        console.log('  npm run migrate up      - Run all pending migrations');
        console.log('  npm run migrate down    - Rollback the last migration');
        console.log('  npm run migrate status  - Show migration status');
        process.exit(1);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { migrateUp, migrateDown, showStatus };
