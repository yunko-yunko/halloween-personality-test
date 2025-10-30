import { features } from '../config/features';
import { IEmailService } from './interfaces/IEmailService';
import { IUserRepository } from './interfaces/IUserRepository';
import { ITestResultRepository } from './interfaces/ITestResultRepository';
import { IVerificationTokenRepository } from './interfaces/IVerificationTokenRepository';
import {
  NoOpEmailService,
  NoOpUserRepository,
  NoOpTestResultRepository,
  NoOpVerificationTokenRepository,
  SESEmailService,
  PostgresConnection,
  PostgresUserRepository,
  PostgresTestResultRepository,
  PostgresVerificationTokenRepository,
} from './implementations';

/**
 * Service container that holds all service instances
 */
export interface ServiceContainer {
  emailService: IEmailService;
  userRepository: IUserRepository;
  testResultRepository: ITestResultRepository;
  verificationTokenRepository: IVerificationTokenRepository;
}

/**
 * Service factory that creates appropriate service implementations
 * based on feature flags
 */
export class ServiceFactory {
  private static instance: ServiceContainer | null = null;

  /**
   * Get or create service container with appropriate implementations
   * based on feature flags
   */
  static getServices(): ServiceContainer {
    if (!this.instance) {
      this.instance = this.createServices();
    }
    return this.instance;
  }

  /**
   * Create service implementations based on feature flags
   */
  private static createServices(): ServiceContainer {
    if (features.emailAuth) {
      // Advanced mode: Use real implementations (PostgreSQL, AWS SES)
      const dbConnection = new PostgresConnection();
      
      return {
        emailService: new SESEmailService(),
        userRepository: new PostgresUserRepository(dbConnection),
        testResultRepository: new PostgresTestResultRepository(dbConnection),
        verificationTokenRepository: new PostgresVerificationTokenRepository(dbConnection),
      };
    } else {
      // Simple mode: Use no-op implementations
      return {
        emailService: new NoOpEmailService(),
        userRepository: new NoOpUserRepository(),
        testResultRepository: new NoOpTestResultRepository(),
        verificationTokenRepository: new NoOpVerificationTokenRepository(),
      };
    }
  }

  /**
   * Reset the service container (useful for testing)
   */
  static reset(): void {
    this.instance = null;
  }

  /**
   * Create a custom service container (useful for testing with mocks)
   */
  static createCustomContainer(services: ServiceContainer): void {
    this.instance = services;
  }
}
