import { ServiceFactory } from '../ServiceFactory';
import { NoOpEmailService } from '../implementations/NoOpEmailService';
import { NoOpUserRepository } from '../implementations/NoOpUserRepository';
import { NoOpTestResultRepository } from '../implementations/NoOpTestResultRepository';

// Mock the features config
jest.mock('../../config/features', () => ({
  features: {
    emailAuth: false,
  },
}));

describe('ServiceFactory', () => {
  beforeEach(() => {
    // Reset the singleton instance before each test
    ServiceFactory.reset();
  });

  afterEach(() => {
    // Clean up after each test
    ServiceFactory.reset();
  });

  describe('Simple Mode (emailAuth = false)', () => {
    it('should return no-op implementations when emailAuth is false', () => {
      const services = ServiceFactory.getServices();

      expect(services.emailService).toBeInstanceOf(NoOpEmailService);
      expect(services.userRepository).toBeInstanceOf(NoOpUserRepository);
      expect(services.testResultRepository).toBeInstanceOf(NoOpTestResultRepository);
    });

    it('should return the same instance on multiple calls (singleton)', () => {
      const services1 = ServiceFactory.getServices();
      const services2 = ServiceFactory.getServices();

      expect(services1).toBe(services2);
      expect(services1.emailService).toBe(services2.emailService);
      expect(services1.userRepository).toBe(services2.userRepository);
      expect(services1.testResultRepository).toBe(services2.testResultRepository);
    });

    it('should create new instance after reset', () => {
      const services1 = ServiceFactory.getServices();
      ServiceFactory.reset();
      const services2 = ServiceFactory.getServices();

      expect(services1).not.toBe(services2);
      // But they should still be the same type
      expect(services2.emailService).toBeInstanceOf(NoOpEmailService);
    });
  });

  describe('Advanced Mode (emailAuth = true)', () => {
    beforeEach(() => {
      // Mock emailAuth as true for these tests
      jest.resetModules();
      jest.doMock('../../config/features', () => ({
        features: {
          emailAuth: true,
        },
      }));
    });

    afterEach(() => {
      jest.resetModules();
    });

    it('should provide real implementations when advanced mode is enabled', () => {
      // Re-import ServiceFactory with mocked config
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
  });

  describe('Custom Container', () => {
    it('should allow setting custom service container for testing', () => {
      const mockEmailService = {
        sendVerificationEmail: jest.fn(),
        sendResultEmail: jest.fn(),
      };
      const mockUserRepository = {
        findByEmail: jest.fn(),
        create: jest.fn(),
        updateLastLogin: jest.fn(),
      };
      const mockTestResultRepository = {
        create: jest.fn(),
        findByUserId: jest.fn(),
      };
      const mockVerificationTokenRepository = {
        create: jest.fn(),
        findByToken: jest.fn(),
        markAsUsed: jest.fn(),
        deleteExpiredTokens: jest.fn(),
        deleteByEmail: jest.fn(),
      };

      ServiceFactory.createCustomContainer({
        emailService: mockEmailService,
        userRepository: mockUserRepository,
        testResultRepository: mockTestResultRepository,
        verificationTokenRepository: mockVerificationTokenRepository,
      });

      const services = ServiceFactory.getServices();

      expect(services.emailService).toBe(mockEmailService);
      expect(services.userRepository).toBe(mockUserRepository);
      expect(services.testResultRepository).toBe(mockTestResultRepository);
      expect(services.verificationTokenRepository).toBe(mockVerificationTokenRepository);
    });
  });

  describe('Service Interface Compliance', () => {
    it('should provide services that implement required interfaces', async () => {
      const services = ServiceFactory.getServices();

      // Test IEmailService interface
      expect(typeof services.emailService.sendVerificationEmail).toBe('function');
      expect(typeof services.emailService.sendResultEmail).toBe('function');

      // Test IUserRepository interface
      expect(typeof services.userRepository.findByEmail).toBe('function');
      expect(typeof services.userRepository.create).toBe('function');
      expect(typeof services.userRepository.updateLastLogin).toBe('function');

      // Test ITestResultRepository interface
      expect(typeof services.testResultRepository.create).toBe('function');
      expect(typeof services.testResultRepository.findByUserId).toBe('function');
    });

    it('should allow calling service methods without errors', async () => {
      const services = ServiceFactory.getServices();

      // These should not throw errors (no-op implementations just log)
      await expect(
        services.emailService.sendVerificationEmail('test@example.com', 'token123')
      ).resolves.not.toThrow();

      await expect(
        services.emailService.sendResultEmail('test@example.com', 'zombie')
      ).resolves.not.toThrow();

      await expect(
        services.userRepository.findByEmail('test@example.com')
      ).resolves.toBeNull();

      await expect(
        services.userRepository.create('test@example.com')
      ).resolves.toHaveProperty('email', 'test@example.com');

      await expect(
        services.userRepository.updateLastLogin('user-id')
      ).resolves.not.toThrow();

      await expect(
        services.testResultRepository.create({
          userId: 'user-id',
          characterType: 'zombie',
          mbtiType: 'EST',
        })
      ).resolves.toHaveProperty('characterType', 'zombie');

      await expect(
        services.testResultRepository.findByUserId('user-id')
      ).resolves.toEqual([]);
    });
  });
});
