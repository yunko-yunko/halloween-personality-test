/**
 * Service implementations for both simple and advanced modes
 * 
 * No-op implementations are used in simple mode (ENABLE_EMAIL_AUTH=false)
 * Real implementations (PostgreSQL, AWS SES) are used in advanced mode
 */

export { NoOpUserRepository } from './NoOpUserRepository';
export { NoOpTestResultRepository } from './NoOpTestResultRepository';
export { NoOpEmailService } from './NoOpEmailService';
export { NoOpVerificationTokenRepository } from './NoOpVerificationTokenRepository';
export { PostgresConnection } from './PostgresConnection';
export { PostgresUserRepository } from './PostgresUserRepository';
export { PostgresTestResultRepository } from './PostgresTestResultRepository';
export { PostgresVerificationTokenRepository } from './PostgresVerificationTokenRepository';
export { SESEmailService } from './SESEmailService';
