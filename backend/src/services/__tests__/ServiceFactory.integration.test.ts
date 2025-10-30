/**
 * Integration tests for ServiceFactory with feature flag switching
 * These tests verify that the factory correctly switches between implementations
 * based on the ENABLE_EMAIL_AUTH environment variable
 */

import { ServiceFactory } from '../ServiceFactory';
import { NoOpEmailService } from '../implementations/NoOpEmailService';
import { NoOpUserRepository } from '../implementations/NoOpUserRepository';
import { NoOpTestResultRepository } from '../implementations/NoOpTestResultRepository';
import { NoOpVerificationTokenRepository } from '../implementations/NoOpVerificationTokenRepository';

describe('ServiceFactory Integration Tests - Feature Flag Switching', () => {
  const originalEnv = process.env.ENABLE_EMAIL_AUTH;

  beforeEach(() => {
    // Reset the singleton and clear module cache
    ServiceFactory.reset();
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv !== undefined) {
      process.env.ENABLE_EMAIL_AUTH = originalEnv;
    } else {
      delete process.env.ENABLE_EMAIL_AUTH;
    }
    ServiceFactory.reset();
  });

  describe('Feature Flag: ENABLE_EMAIL_AUTH=false (Simple Mode)', () => {
    beforeEach(() => {
      process.env.ENABLE_EMAIL_AUTH = 'false';
    });

    it('should use no-op implementations when feature flag is false', () => {
      // Force reload of features module
      jest.isolateModules(() => {
        const { ServiceFactory: SF } = require('../ServiceFactory');
        const services = SF.getServices();

        // Check that services have the expected behavior (no-op implementations)
        expect(services.emailService.constructor.name).toBe('NoOpEmailService');
        expect(services.userRepository.constructor.name).toBe('NoOpUserRepository');
        expect(services.testResultRepository.constructor.name).toBe('NoOpTestResultRepository');
        expect(services.verificationTokenRepository.constructor.name).toBe('NoOpVerificationTokenRepository');
      });
    });

    it('should allow test operations without persistence', async () => {
      jest.isolateModules(async () => {
        const { ServiceFactory: SF } = require('../ServiceFactory');
        const services = SF.getServices();

        // Email operations should not throw
        await services.emailService.sendVerificationEmail('test@example.com', 'token');
        await services.emailService.sendResultEmail('test@example.com', 'zombie');

        // User operations should return mock data
        const user = await services.userRepository.create('test@example.com');
        expect(user.email).toBe('test@example.com');
        expect(user.id).toBe('mock-user-id');

        const foundUser = await services.userRepository.findByEmail('test@example.com');
        expect(foundUser).toBeNull(); // No persistence

        // Test result operations should return mock data
        const result = await services.testResultRepository.create({
          userId: 'user-123',
          characterType: 'zombie',
          mbtiType: 'EST',
        });
        expect(result.characterType).toBe('zombie');
        expect(result.id).toBe('mock-result-id');

        const history = await services.testResultRepository.findByUserId('user-123');
        expect(history).toEqual([]); // No persistence
      });
    });
  });

  describe('Feature Flag: ENABLE_EMAIL_AUTH=true (Advanced Mode)', () => {
    beforeEach(() => {
      process.env.ENABLE_EMAIL_AUTH = 'true';
    });

    it('should provide real implementations when advanced mode is enabled', () => {
      jest.isolateModules(() => {
        const { ServiceFactory: SF } = require('../ServiceFactory');
        const { SESEmailService } = require('../implementations/SESEmailService');
        const { PostgresUserRepository } = require('../implementations/PostgresUserRepository');
        const { PostgresTestResultRepository } = require('../implementations/PostgresTestResultRepository');
        const { PostgresVerificationTokenRepository } = require('../implementations/PostgresVerificationTokenRepository');

        const services = SF.getServices();

        expect(services.emailService).toBeInstanceOf(SESEmailService);
        expect(services.userRepository).toBeInstanceOf(PostgresUserRepository);
        expect(services.testResultRepository).toBeInstanceOf(PostgresTestResultRepository);
        expect(services.verificationTokenRepository).toBeInstanceOf(PostgresVerificationTokenRepository);
      });
    });

    it('should provide verification token repository in advanced mode', () => {
      jest.isolateModules(() => {
        const { ServiceFactory: SF } = require('../ServiceFactory');

        const services = SF.getServices();

        expect(services.verificationTokenRepository).toBeDefined();
        expect(typeof services.verificationTokenRepository.create).toBe('function');
        expect(typeof services.verificationTokenRepository.findByToken).toBe('function');
        expect(typeof services.verificationTokenRepository.markAsUsed).toBe('function');
        expect(typeof services.verificationTokenRepository.deleteExpiredTokens).toBe('function');
        expect(typeof services.verificationTokenRepository.deleteByEmail).toBe('function');
      });
    });
  });

  describe('Feature Flag: ENABLE_EMAIL_AUTH undefined (defaults to Simple Mode)', () => {
    beforeEach(() => {
      delete process.env.ENABLE_EMAIL_AUTH;
    });

    it('should default to no-op implementations when flag is not set', () => {
      jest.isolateModules(() => {
        const { ServiceFactory: SF } = require('../ServiceFactory');
        const services = SF.getServices();

        expect(services.emailService.constructor.name).toBe('NoOpEmailService');
        expect(services.userRepository.constructor.name).toBe('NoOpUserRepository');
        expect(services.testResultRepository.constructor.name).toBe('NoOpTestResultRepository');
      });
    });
  });

  describe('Feature Flag: ENABLE_EMAIL_AUTH=any_other_value (defaults to Simple Mode)', () => {
    it('should use no-op implementations for non-"true" values', () => {
      const testValues = ['false', 'FALSE', '0', 'no', 'disabled', ''];

      testValues.forEach((value) => {
        process.env.ENABLE_EMAIL_AUTH = value;
        ServiceFactory.reset();

        jest.isolateModules(() => {
          const { ServiceFactory: SF } = require('../ServiceFactory');
          const services = SF.getServices();

          expect(services.emailService.constructor.name).toBe('NoOpEmailService');
        });
      });
    });
  });

  describe('Singleton Behavior Across Feature Flags', () => {
    it('should maintain singleton within same configuration', () => {
      process.env.ENABLE_EMAIL_AUTH = 'false';

      jest.isolateModules(() => {
        const { ServiceFactory: SF } = require('../ServiceFactory');
        const services1 = SF.getServices();
        const services2 = SF.getServices();

        expect(services1).toBe(services2);
      });
    });

    it('should create new instance after reset', () => {
      process.env.ENABLE_EMAIL_AUTH = 'false';

      jest.isolateModules(() => {
        const { ServiceFactory: SF } = require('../ServiceFactory');
        const services1 = SF.getServices();
        SF.reset();
        const services2 = SF.getServices();

        expect(services1).not.toBe(services2);
        expect(services1.emailService).not.toBe(services2.emailService);
      });
    });
  });
});
