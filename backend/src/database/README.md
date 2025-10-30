# Database Migrations

This directory contains database schema migrations for the Halloween Personality Test application.

## Overview

The migration system uses PostgreSQL and tracks executed migrations in a `schema_migrations` table. Each migration consists of two files:
- `XXX_migration_name.sql` - The migration to apply
- `XXX_migration_name.down.sql` - The rollback script

## Migration Files

### 001_create_users_table.sql
Creates the `users` table to store authenticated user information.

**Schema:**
- `id` (UUID, Primary Key)
- `email` (VARCHAR, Unique, Not Null)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Indexes:**
- `idx_users_email` on `email` column

**Features:**
- Auto-updating `updated_at` trigger

### 002_create_test_results_table.sql
Creates the `test_results` table to store personality test results.

**Schema:**
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key to users)
- `character_type` (VARCHAR)
- `mbti_type` (VARCHAR)
- `completed_at` (TIMESTAMP)

**Indexes:**
- `idx_test_results_user_id` on `user_id` column
- `idx_test_results_completed_at` on `completed_at` column (DESC)

**Constraints:**
- Valid character types: zombie, joker, skeleton, nun, jack-o-lantern, vampire, ghost, frankenstein
- MBTI type must be exactly 4 characters

### 003_create_verification_tokens_table.sql
Creates the `verification_tokens` table to store email verification tokens.

**Schema:**
- `token` (VARCHAR, Primary Key)
- `email` (VARCHAR, Not Null)
- `expires_at` (TIMESTAMP, Not Null)
- `used` (BOOLEAN, Default: false)
- `created_at` (TIMESTAMP)

**Indexes:**
- `idx_verification_tokens_email` on `email` column
- `idx_verification_tokens_expires_at` on `expires_at` column
- `idx_verification_tokens_used_expires` on `used` and `expires_at` columns

## Usage

### Prerequisites

Ensure your `.env` file contains the following database configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=your_username
DB_PASSWORD=your_password
```

### Running Migrations

**Run all pending migrations:**
```bash
npm run migrate:up
```

**Rollback the last migration:**
```bash
npm run migrate:down
```

**Check migration status:**
```bash
npm run migrate:status
```

**Direct usage:**
```bash
npm run migrate up
npm run migrate down
npm run migrate status
```

## Migration Tracking

The system automatically creates a `schema_migrations` table to track which migrations have been executed:

```sql
CREATE TABLE schema_migrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Creating New Migrations

To create a new migration:

1. Create two files in the `migrations/` directory:
   - `00X_migration_name.sql` (up migration)
   - `00X_migration_name.down.sql` (down migration)

2. Use sequential numbering (001, 002, 003, etc.)

3. Write the SQL for applying the migration in the `.sql` file

4. Write the SQL for rolling back the migration in the `.down.sql` file

**Example:**

`004_add_user_preferences.sql`:
```sql
ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
```

`004_add_user_preferences.down.sql`:
```sql
ALTER TABLE users DROP COLUMN preferences;
```

## Best Practices

1. **Always test migrations** on a development database first
2. **Keep migrations small** and focused on a single change
3. **Write rollback scripts** for every migration
4. **Use transactions** - the migration runner wraps each migration in a transaction
5. **Add indexes** for columns used in WHERE clauses and JOINs
6. **Document changes** in this README when adding new migrations

## Troubleshooting

### Migration fails mid-execution
The migration runner uses transactions, so failed migrations are automatically rolled back. Fix the SQL and run again.

### "Migration already executed" error
Check the `schema_migrations` table to see which migrations have been executed. You may need to manually remove an entry if a migration was partially applied.

### Connection errors
Verify your database credentials in `.env` and ensure PostgreSQL is running.

## Feature Flag Integration

These migrations are only needed when `ENABLE_EMAIL_AUTH=true`. In simple mode, the application uses no-op repository implementations that don't require a database.
