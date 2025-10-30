-- Rollback: Drop test_results table
-- Description: Removes test_results table and related objects

DROP INDEX IF EXISTS idx_test_results_user_id;
DROP INDEX IF EXISTS idx_test_results_completed_at;
DROP TABLE IF EXISTS test_results CASCADE;
