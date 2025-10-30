-- Migration: Create test_results table
-- Description: Stores personality test results for users

CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  character_type VARCHAR(50) NOT NULL,
  mbti_type VARCHAR(4) NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at DESC);

-- Add constraint to ensure valid character types
ALTER TABLE test_results
  ADD CONSTRAINT check_character_type
  CHECK (character_type IN (
    'zombie',
    'joker',
    'skeleton',
    'nun',
    'jack-o-lantern',
    'vampire',
    'ghost',
    'frankenstein'
  ));

-- Add constraint to ensure valid MBTI type format (4 characters)
ALTER TABLE test_results
  ADD CONSTRAINT check_mbti_type_length
  CHECK (LENGTH(mbti_type) = 4);
