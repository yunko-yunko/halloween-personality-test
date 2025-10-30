/**
 * Example usage of PostgresConnection
 * 
 * This file demonstrates how to use the PostgresConnection class
 * for database operations in the Halloween Personality Test application.
 * 
 * To run this example:
 * 1. Ensure PostgreSQL is running
 * 2. Set up environment variables in .env
 * 3. Run: ts-node -r tsconfig-paths/register src/database/connection-example.ts
 */

import { PostgresConnection } from '../services/implementations/PostgresConnection';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function main() {
  console.log('PostgresConnection Example\n');

  // Create connection instance
  const connection = new PostgresConnection();

  try {
    // 1. Test connection
    console.log('1. Testing database connection...');
    const isHealthy = await connection.testConnection();
    console.log(`   Connection status: ${isHealthy ? '✓ Connected' : '✗ Failed'}\n`);

    if (!isHealthy) {
      console.error('Cannot connect to database. Please check your configuration.');
      return;
    }

    // 2. Get pool statistics
    console.log('2. Pool statistics:');
    const stats = connection.getPoolStats();
    console.log(`   Total connections: ${stats.totalCount}`);
    console.log(`   Idle connections: ${stats.idleCount}`);
    console.log(`   Waiting requests: ${stats.waitingCount}`);
    console.log(`   Is connected: ${stats.isConnected}\n`);

    // 3. Execute a simple query
    console.log('3. Executing simple query...');
    const result = await connection.query('SELECT NOW() as current_time, version() as pg_version');
    console.log(`   Current time: ${result[0].current_time}`);
    console.log(`   PostgreSQL version: ${result[0].pg_version.split(',')[0]}\n`);

    // 4. Check if schema_migrations table exists
    console.log('4. Checking for schema_migrations table...');
    const tableCheck = await connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'schema_migrations'
      ) as exists
    `);
    console.log(`   schema_migrations exists: ${tableCheck[0].exists ? '✓ Yes' : '✗ No'}\n`);

    // 5. If users table exists, count users
    console.log('5. Checking for users table...');
    const usersTableCheck = await connection.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
    `);
    
    if (usersTableCheck[0].exists) {
      const userCount = await connection.query('SELECT COUNT(*) as count FROM users');
      console.log(`   users table exists: ✓ Yes`);
      console.log(`   Total users: ${userCount[0].count}\n`);
    } else {
      console.log(`   users table exists: ✗ No (run migrations first)\n`);
    }

    // 6. Demonstrate transaction with client
    console.log('6. Demonstrating transaction (will rollback)...');
    const client = await connection.getClient();
    
    try {
      await client.query('BEGIN');
      console.log('   Transaction started');
      
      // This would insert data, but we'll rollback
      console.log('   (Simulating database operations...)');
      
      await client.query('ROLLBACK');
      console.log('   Transaction rolled back (no changes made)\n');
    } finally {
      client.release();
    }

    // 7. Final pool statistics
    console.log('7. Final pool statistics:');
    const finalStats = connection.getPoolStats();
    console.log(`   Total connections: ${finalStats.totalCount}`);
    console.log(`   Idle connections: ${finalStats.idleCount}`);
    console.log(`   Waiting requests: ${finalStats.waitingCount}\n`);

    console.log('✓ Example completed successfully!');

  } catch (error) {
    console.error('Error during example execution:', error);
  } finally {
    // Always close the connection
    console.log('\nClosing database connection...');
    await connection.end();
    console.log('Connection closed.');
  }
}

// Run the example
if (require.main === module) {
  main().catch(console.error);
}

export { main };
