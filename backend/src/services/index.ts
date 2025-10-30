/**
 * Service layer exports
 */

// Core services
export { TestScoringService } from './TestScoringService';
export { VerificationTokenService } from './VerificationTokenService';
export { AuthService } from './AuthService';

// Service factory and dependency injection
export { ServiceFactory, ServiceContainer } from './ServiceFactory';

// Service interfaces
export { IEmailService } from './interfaces/IEmailService';
export { IUserRepository } from './interfaces/IUserRepository';
export { ITestResultRepository } from './interfaces/ITestResultRepository';
export { IVerificationTokenRepository } from './interfaces/IVerificationTokenRepository';

// Service implementations
export {
  NoOpEmailService,
  NoOpUserRepository,
  NoOpTestResultRepository,
  NoOpVerificationTokenRepository,
} from './implementations';
