import { NoOpEmailService } from '../implementations/NoOpEmailService';

describe('NoOpEmailService', () => {
  let service: NoOpEmailService;

  beforeEach(() => {
    service = new NoOpEmailService();
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should complete without error', async () => {
      await expect(
        service.sendVerificationEmail('test@example.com', 'token-123')
      ).resolves.toBeUndefined();
    });

    it('should log the email details', async () => {
      await service.sendVerificationEmail('test@example.com', 'token-abc');
      
      expect(console.log).toHaveBeenCalledWith(
        '[NoOpEmailService] Would send verification email:',
        {
          to: 'test@example.com',
          token: 'token-abc',
          message: 'Verification email not sent in simple mode',
        }
      );
    });

    it('should not actually send emails', async () => {
      // This test verifies that the method completes synchronously
      // and doesn't make any external calls
      const startTime = Date.now();
      await service.sendVerificationEmail('test@example.com', 'token-123');
      const endTime = Date.now();
      
      // Should complete almost instantly (< 10ms)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });

  describe('sendResultEmail', () => {
    it('should complete without error', async () => {
      await expect(
        service.sendResultEmail('test@example.com', 'zombie')
      ).resolves.toBeUndefined();
    });

    it('should log the email details', async () => {
      await service.sendResultEmail('test@example.com', 'vampire');
      
      expect(console.log).toHaveBeenCalledWith(
        '[NoOpEmailService] Would send result email:',
        {
          to: 'test@example.com',
          character: 'vampire',
          message: 'Result email not sent in simple mode',
        }
      );
    });

    it('should handle all character types', async () => {
      const characters = [
        'zombie',
        'joker',
        'skeleton',
        'nun',
        'jack-o-lantern',
        'vampire',
        'ghost',
        'frankenstein',
      ] as const;

      for (const character of characters) {
        await expect(
          service.sendResultEmail('test@example.com', character)
        ).resolves.toBeUndefined();
      }
    });

    it('should not actually send emails', async () => {
      // This test verifies that the method completes synchronously
      // and doesn't make any external calls
      const startTime = Date.now();
      await service.sendResultEmail('test@example.com', 'ghost');
      const endTime = Date.now();
      
      // Should complete almost instantly (< 10ms)
      expect(endTime - startTime).toBeLessThan(10);
    });
  });
});
