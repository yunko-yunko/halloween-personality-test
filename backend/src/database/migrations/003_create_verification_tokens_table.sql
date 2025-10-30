-- Migration: Create verification_tokens table
-- Description: Stores email verification tokens for authentication

CREATE TABLE IF NOT EXISTS verification_tokens (
  token VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_verification_tokens_email ON verification_tokens(email);
CREATE INDEX IF NOT EXISTS idx_verification_tokens_expires_at ON verification_tokens(expires_at);

-- Create index for cleanup queries (finding expired tokens)
CREATE INDEX IF NOT EXISTS idx_verification_tokens_used_expires ON verification_tokens(used, expires_at);
