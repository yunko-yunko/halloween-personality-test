import { PostgresVerificationTokenRepository } from '../PostgresVerificationTokenRepository';
import { IDatabaseConnection } from '../../interfaces/IDatabaseConnection';
import { VerificationToken } from '../../../types';

describe('PostgresVerificationTokenRepository', () => {
  let repository: PostgresVerificationTokenRepository;
  let mockConnection: jest.Mocked<IDatabaseConnection>;

  beforeEach(() => {
    mockConnection = {
      query: jest.fn(),
      getClient: jest.fn(),
      end: jest.fn(),
    };

    repository = new PostgresVerificationTokenRepository(mockConnection);
  });

  describe('create', () => {
    it('should create a new verification token', async () => {
      const email = 'test@example.com';
      const token = 'test-token-uuid';
      const expiresAt = new Date('2024-12-31T23:59:59Z');

      const mockRow = {
        token,
        email,
        expiresAt,
        used: false,
        createdAt: new Date(),
      };

      mockConnection.query.mockResolvedValue([mockRow]);

      const result = await repository.create(email, token, expiresAt);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO verification_tokens'),
        [token, email, expiresAt]
      );
      expect(result).toEqual({
        token,
        email,
        expiresAt,
        used: false,
        createdAt: mockRow.createdAt,
      });
    });

    it('should throw error if no rows returned', async () => {
      mockConnection.query.mockResolvedValue([]);

      await expect(
        repository.create('test@example.com', 'token', new Date())
      ).rejects.toThrow('Failed to create verification token: no rows returned');
    });

    it('should throw error for duplicate token', async () => {
      const error: any = new Error('Duplicate key');
      error.code = '23505';
      mockConnection.query.mockRejectedValue(error);

      await expect(
        repository.create('test@example.com', 'token', new Date())
      ).rejects.toThrow('Token already exists');
    });

    it('should throw error for other database errors', async () => {
      mockConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(
        repository.create('test@example.com', 'token', new Date())
      ).rejects.toThrow('Failed to create verification token: Database error');
    });
  });

  describe('findByToken', () => {
    it('should find token by token string', async () => {
      const token = 'test-token-uuid';
      const mockRow = {
        token,
        email: 'test@example.com',
        expiresAt: new Date('2024-12-31T23:59:59Z'),
        used: false,
        createdAt: new Date(),
      };

      mockConnection.query.mockResolvedValue([mockRow]);

      const result = await repository.findByToken(token);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT token, email'),
        [token]
      );
      expect(result).toEqual({
        token: mockRow.token,
        email: mockRow.email,
        expiresAt: mockRow.expiresAt,
        used: false,
        createdAt: mockRow.createdAt,
      });
    });

    it('should return null if token not found', async () => {
      mockConnection.query.mockResolvedValue([]);

      const result = await repository.findByToken('non-existent-token');

      expect(result).toBeNull();
    });

    it('should handle date conversion', async () => {
      const mockRow = {
        token: 'test-token',
        email: 'test@example.com',
        expiresAt: '2024-12-31T23:59:59Z', // String date
        used: false,
        createdAt: '2024-01-01T00:00:00Z', // String date
      };

      mockConnection.query.mockResolvedValue([mockRow]);

      const result = await repository.findByToken('test-token');

      expect(result?.expiresAt).toBeInstanceOf(Date);
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error on database error', async () => {
      mockConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.findByToken('token')).rejects.toThrow(
        'Failed to find verification token: Database error'
      );
    });
  });

  describe('markAsUsed', () => {
    it('should mark token as used', async () => {
      const token = 'test-token-uuid';
      mockConnection.query.mockResolvedValue([]);

      await repository.markAsUsed(token);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE verification_tokens'),
        [token]
      );
    });

    it('should throw error on database error', async () => {
      mockConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.markAsUsed('token')).rejects.toThrow(
        'Failed to mark token as used: Database error'
      );
    });
  });

  describe('deleteExpiredTokens', () => {
    it('should delete expired tokens and return count', async () => {
      const mockResult: any = { rowCount: 5 };
      mockConnection.query.mockResolvedValue(mockResult);

      const result = await repository.deleteExpiredTokens();

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM verification_tokens')
      );
      expect(result).toBe(5);
    });

    it('should return 0 if no rowCount', async () => {
      mockConnection.query.mockResolvedValue([]);

      const result = await repository.deleteExpiredTokens();

      expect(result).toBe(0);
    });

    it('should throw error on database error', async () => {
      mockConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.deleteExpiredTokens()).rejects.toThrow(
        'Failed to delete expired tokens: Database error'
      );
    });
  });

  describe('deleteByEmail', () => {
    it('should delete tokens by email and return count', async () => {
      const email = 'test@example.com';
      const mockResult: any = { rowCount: 3 };
      mockConnection.query.mockResolvedValue(mockResult);

      const result = await repository.deleteByEmail(email);

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM verification_tokens'),
        [email]
      );
      expect(result).toBe(3);
    });

    it('should return 0 if no rowCount', async () => {
      mockConnection.query.mockResolvedValue([]);

      const result = await repository.deleteByEmail('test@example.com');

      expect(result).toBe(0);
    });

    it('should throw error on database error', async () => {
      mockConnection.query.mockRejectedValue(new Error('Database error'));

      await expect(repository.deleteByEmail('test@example.com')).rejects.toThrow(
        'Failed to delete tokens by email: Database error'
      );
    });
  });
});
