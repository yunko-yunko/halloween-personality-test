import { PostgresConnection } from '../implementations/PostgresConnection';
import { Pool } from 'pg';

// Mock the pg module
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
    totalCount: 0,
    idleCount: 0,
    waitingCount: 0,
  };

  return {
    Pool: jest.fn(() => mockPool),
  };
});

describe('PostgresConnection Unit Tests', () => {
  let connection: PostgresConnection;
  let mockPool: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create connection
    connection = new PostgresConnection({
      host: 'localhost',
      port: 5432,
      database: 'test_db',
      user: 'test_user',
      password: 'test_password',
    });

    // Get the mocked pool instance
    mockPool = (Pool as jest.MockedClass<typeof Pool>).mock.results[0].value;
  });

  describe('constructor', () => {
    it('should create a Pool instance with provided config', () => {
      expect(Pool).toHaveBeenCalledWith({
        host: 'localhost',
        port: 5432,
        database: 'test_db',
        user: 'test_user',
        password: 'test_password',
      });
    });

    it('should set up event handlers on pool', () => {
      expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockPool.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockPool.on).toHaveBeenCalledWith('remove', expect.any(Function));
    });

    it('should use default config from environment when no config provided', () => {
      // Set environment variables
      process.env.DB_HOST = 'env-host';
      process.env.DB_PORT = '5433';
      process.env.DB_NAME = 'env-db';
      process.env.DB_USER = 'env-user';
      process.env.DB_PASSWORD = 'env-password';

      jest.clearAllMocks();
      const envConnection = new PostgresConnection();

      expect(Pool).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'env-host',
          port: 5433,
          database: 'env-db',
          user: 'env-user',
          password: 'env-password',
        })
      );

      // Clean up
      delete process.env.DB_HOST;
      delete process.env.DB_PORT;
      delete process.env.DB_NAME;
      delete process.env.DB_USER;
      delete process.env.DB_PASSWORD;
    });
  });

  describe('query method', () => {
    it('should execute query and return rows', async () => {
      const mockRows = [{ id: 1, name: 'test' }];
      mockPool.query.mockResolvedValue({ rows: mockRows });

      const result = await connection.query('SELECT * FROM users');

      expect(mockPool.query).toHaveBeenCalledWith('SELECT * FROM users', undefined);
      expect(result).toEqual(mockRows);
    });

    it('should execute query with parameters', async () => {
      const mockRows = [{ id: 1, name: 'test' }];
      mockPool.query.mockResolvedValue({ rows: mockRows });

      const result = await connection.query(
        'SELECT * FROM users WHERE id = $1',
        [1]
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        [1]
      );
      expect(result).toEqual(mockRows);
    });

    it('should return empty array when no rows', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      const result = await connection.query('SELECT * FROM users WHERE id = $1', [999]);

      expect(result).toEqual([]);
    });

    it('should throw wrapped error on query failure', async () => {
      const originalError = new Error('Connection failed');
      mockPool.query.mockRejectedValue(originalError);

      await expect(
        connection.query('SELECT * FROM users')
      ).rejects.toThrow('Database error in SELECT * FROM users');
    });

    it('should retry on retryable errors', async () => {
      const retryableError = new Error('Connection refused');
      (retryableError as any).code = 'ECONNREFUSED';

      // Fail twice, then succeed
      mockPool.query
        .mockRejectedValueOnce(retryableError)
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce({ rows: [{ success: true }] });

      // Spy on console.warn to suppress output
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const result = await connection.query('SELECT 1');

      expect(mockPool.query).toHaveBeenCalledTimes(3);
      expect(result).toEqual([{ success: true }]);
      expect(warnSpy).toHaveBeenCalledTimes(2);

      warnSpy.mockRestore();
    });

    it('should not retry on non-retryable errors', async () => {
      const nonRetryableError = new Error('Syntax error');
      (nonRetryableError as any).code = '42601'; // PostgreSQL syntax error

      mockPool.query.mockRejectedValue(nonRetryableError);

      await expect(
        connection.query('INVALID SQL')
      ).rejects.toThrow();

      // Should only try once
      expect(mockPool.query).toHaveBeenCalledTimes(1);
    });

    it('should throw after max retries exceeded', async () => {
      const retryableError = new Error('Connection timeout');
      (retryableError as any).code = 'ETIMEDOUT';

      mockPool.query.mockRejectedValue(retryableError);

      // Spy on console.warn to suppress output
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      await expect(
        connection.query('SELECT 1')
      ).rejects.toThrow();

      // Should try 3 times (max retries)
      expect(mockPool.query).toHaveBeenCalledTimes(3);

      warnSpy.mockRestore();
    });
  });

  describe('getClient method', () => {
    it('should return a client from the pool', async () => {
      const mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };
      mockPool.connect.mockResolvedValue(mockClient);

      const client = await connection.getClient();

      expect(mockPool.connect).toHaveBeenCalled();
      expect(client).toBe(mockClient);
    });

    it('should throw wrapped error on connection failure', async () => {
      const originalError = new Error('Pool exhausted');
      mockPool.connect.mockRejectedValue(originalError);

      await expect(
        connection.getClient()
      ).rejects.toThrow('Database error in getClient');
    });

    it('should retry on retryable errors', async () => {
      const retryableError = new Error('Connection reset');
      (retryableError as any).code = 'ECONNRESET';

      const mockClient = { query: jest.fn(), release: jest.fn() };

      // Fail once, then succeed
      mockPool.connect
        .mockRejectedValueOnce(retryableError)
        .mockResolvedValueOnce(mockClient);

      // Spy on console.warn to suppress output
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const client = await connection.getClient();

      expect(mockPool.connect).toHaveBeenCalledTimes(2);
      expect(client).toBe(mockClient);

      warnSpy.mockRestore();
    });
  });

  describe('end method', () => {
    it('should close the pool', async () => {
      mockPool.end.mockResolvedValue(undefined);

      // Spy on console.log to suppress output
      const logSpy = jest.spyOn(console, 'log').mockImplementation();

      await connection.end();

      expect(mockPool.end).toHaveBeenCalled();
      expect(logSpy).toHaveBeenCalledWith('Database connection pool closed successfully');

      logSpy.mockRestore();
    });

    it('should throw wrapped error on close failure', async () => {
      const originalError = new Error('Failed to close');
      mockPool.end.mockRejectedValue(originalError);

      // Spy on console.error to suppress output
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(
        connection.end()
      ).rejects.toThrow('Database error in end');

      errorSpy.mockRestore();
    });
  });

  describe('testConnection method', () => {
    it('should return true when connection is successful', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ '?column?': 1 }] });

      const result = await connection.testConnection();

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith('SELECT 1', undefined);
    });

    it('should return false when connection fails', async () => {
      mockPool.query.mockRejectedValue(new Error('Connection failed'));

      // Spy on console.error to suppress output
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = await connection.testConnection();

      expect(result).toBe(false);

      errorSpy.mockRestore();
    });
  });

  describe('getPoolStats method', () => {
    it('should return pool statistics', () => {
      mockPool.totalCount = 5;
      mockPool.idleCount = 3;
      mockPool.waitingCount = 1;

      const stats = connection.getPoolStats();

      expect(stats).toEqual({
        totalCount: 5,
        idleCount: 3,
        waitingCount: 1,
        isConnected: false,
      });
    });

    it('should reflect connection state', () => {
      // Simulate connection by triggering the connect event handler
      const connectHandler = mockPool.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )[1];
      connectHandler();

      const stats = connection.getPoolStats();

      expect(stats.isConnected).toBe(true);
    });
  });

  describe('event handlers', () => {
    it('should log errors from pool', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();

      const errorHandler = mockPool.on.mock.calls.find(
        (call: any) => call[0] === 'error'
      )[1];

      const testError = new Error('Unexpected pool error');
      errorHandler(testError);

      expect(errorSpy).toHaveBeenCalledWith('Unexpected error on idle client', testError);

      errorSpy.mockRestore();
    });

    it('should update connection state on connect', () => {
      const connectHandler = mockPool.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )[1];

      connectHandler();

      const stats = connection.getPoolStats();
      expect(stats.isConnected).toBe(true);
    });

    it('should update connection state on remove when pool is empty', () => {
      // First connect
      const connectHandler = mockPool.on.mock.calls.find(
        (call: any) => call[0] === 'connect'
      )[1];
      connectHandler();

      // Then remove all connections
      mockPool.totalCount = 0;
      const removeHandler = mockPool.on.mock.calls.find(
        (call: any) => call[0] === 'remove'
      )[1];
      removeHandler();

      const stats = connection.getPoolStats();
      expect(stats.isConnected).toBe(false);
    });
  });
});
