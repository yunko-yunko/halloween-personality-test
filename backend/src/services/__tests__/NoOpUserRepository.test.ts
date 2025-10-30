import { NoOpUserRepository } from '../implementations/NoOpUserRepository';

describe('NoOpUserRepository', () => {
  let repository: NoOpUserRepository;

  beforeEach(() => {
    repository = new NoOpUserRepository();
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('findByEmail', () => {
    it('should return null for any email', async () => {
      const result = await repository.findByEmail('test@example.com');
      expect(result).toBeNull();
    });

    it('should log the operation', async () => {
      await repository.findByEmail('test@example.com');
      expect(console.log).toHaveBeenCalledWith(
        '[NoOpUserRepository] findByEmail called:',
        'test@example.com'
      );
    });
  });

  describe('create', () => {
    it('should return a mock user with the provided email', async () => {
      const email = 'newuser@example.com';
      const result = await repository.create(email);

      expect(result).toMatchObject({
        id: 'mock-user-id',
        email,
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should log the operation', async () => {
      await repository.create('newuser@example.com');
      expect(console.log).toHaveBeenCalledWith(
        '[NoOpUserRepository] create called:',
        'newuser@example.com'
      );
    });

    it('should not persist data', async () => {
      const email = 'test@example.com';
      await repository.create(email);
      
      // Verify that subsequent findByEmail still returns null
      const found = await repository.findByEmail(email);
      expect(found).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should complete without error', async () => {
      await expect(repository.updateLastLogin('user-123')).resolves.toBeUndefined();
    });

    it('should log the operation', async () => {
      await repository.updateLastLogin('user-123');
      expect(console.log).toHaveBeenCalledWith(
        '[NoOpUserRepository] updateLastLogin called:',
        'user-123'
      );
    });
  });
});
