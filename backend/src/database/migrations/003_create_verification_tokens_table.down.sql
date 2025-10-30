-- Rollback: Drop verification_tokens table
-- Description: Removes verification_tokens table and related objects

DROP INDEX IF EXISTS idx_verification_tokens_email;
DROP INDEX IF EXISTS idx_verification_tokens_expires_at;
DROP INDEX IF EXISTS idx_verification_tokens_used_expires;
DROP TABLE IF EXISTS verification_tokens CASCADE;
