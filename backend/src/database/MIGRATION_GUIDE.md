# Database Migration Guide

Quick reference for working with database migrations in the Halloween Personality Test application.

## Quick Start

### 1. Set up your database connection

Create a `.env` file in the backend directory with your database credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=halloween_test
DB_USER=postgres
DB_PASSWORD=your_password
```

### 2. Run migrations

```bash
# Run all pending migrations
npm run migrate:up

# Check migration status
npm run migrate:status

# Rollback last migration
npm run migrate:down

# Validate migration files
npm run migrate:validate
```

## Migration Files

The system includes three core migrations:

1. **001_create_users_table.sql** - User authentication table
2. **002_create_test_results_table.sql** - Test results storage
3. **003_create_verification_tokens_table.sql** - Email verification tokens

Each migration has a corresponding `.down.sql` file for rollback.

## Database Schema

### Users Table
```sql
users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

### Test Results Table
```sql
test_results (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  character_type VARCHAR(50),
  mbti_type VARCHAR(4),
  completed_at TIMESTAMP
)
```

### Verification Tokens Table
```sql
verification_tokens (
  token VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP
)
```

## Common Tasks

### Check if migrations are needed
```bash
npm run migrate:status
```

### Apply all pending migrations
```bash
npm run migrate:up
```

### Undo the last migration
```bash
npm run migrate:down
```

### Validate migration files
```bash
npm run migrate:validate
```

## Creating a New Migration

1. Create two files in `src/database/migrations/`:
   - `00X_description.sql` (up migration)
   - `00X_description.down.sql` (rollback)

2. Write your SQL in both files

3. Validate the migration:
   ```bash
   npm run migrate:validate
   ```

4. Test on development database:
   ```bash
   npm run migrate:up
   npm run migrate:down
   npm run migrate:up
   ```

## Troubleshooting

### "Connection refused" error
- Ensure PostgreSQL is running
- Check your `.env` database credentials
- Verify the database exists

### "Migration already executed" error
- Check `schema_migrations` table
- The migration may have been partially applied
- Manually remove the entry if needed:
  ```sql
  DELETE FROM schema_migrations WHERE name = 'XXX_migration_name.sql';
  ```

### Migration fails
- Migrations run in transactions and auto-rollback on failure
- Fix the SQL error and run again
- Check PostgreSQL logs for detailed error messages

## Feature Flag Note

These migrations are only required when running in **Advanced Mode** (`ENABLE_EMAIL_AUTH=true`).

In **Simple Mode** (`ENABLE_EMAIL_AUTH=false`), the application uses no-op repository implementations that don't require a database.

## Production Deployment

Before deploying to production:

1. ✅ Test all migrations on a staging database
2. ✅ Backup the production database
3. ✅ Run migrations during a maintenance window
4. ✅ Verify the application works after migration
5. ✅ Keep rollback scripts ready

```bash
# Production migration workflow
npm run migrate:status    # Check current state
npm run migrate:up        # Apply migrations
npm run migrate:status    # Verify success
```

## Additional Resources

- See `README.md` for detailed documentation
- See `validate-migrations.ts` for validation logic
- See `migrate.ts` for migration runner implementation
