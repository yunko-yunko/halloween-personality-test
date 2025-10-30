import { NoOpTestResultRepository } from '../implementations/NoOpTestResultRepository';
import { TestResultInput } from '../../types';

describe('NoOpTestResultRepository', () => {
  let repository: NoOpTestResultRepository;

  beforeEach(() => {
    repository = new NoOpTestResultRepository();
    // Suppress console.log during tests
    jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    it('should return a mock test result with provided data', async () => {
      const input: TestResultInput = {
        userId: 'user-123',
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      };

      const result = await repository.create(input);

      expect(result).toMatchObject({
        id: 'mock-result-id',
        userId: 'user-123',
        characterType: 'zombie',
        mbtiType: 'ESTJ',
      });
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('should log the operation', async () => {
      const input: TestResultInput = {
        userId: 'user-123',
        characterType: 'vampire',
        mbtiType: 'ISTJ',
      };

      await repository.create(input);
      expect(console.log).toHaveBeenCalledWith(
        '[NoOpTestResultRepository] create called:',
        input
      );
    });

    it('should not persist data', async () => {
      const input: TestResultInput = {
        userId: 'user-123',
        characterType: 'ghost',
        mbtiType: 'ESFJ',
      };

      await repository.create(input);
      
      // Verify that subsequent findByUserId returns empty array
      const results = await repository.findByUserId('user-123');
      expect(results).toEqual([]);
    });
  });

  describe('findByUserId', () => {
    it('should return empty array for any user ID', async () => {
      const result = await repository.findByUserId('user-123');
      expect(result).toEqual([]);
    });

    it('should log the operation', async () => {
      await repository.findByUserId('user-456');
      expect(console.log).toHaveBeenCalledWith(
        '[NoOpTestResultRepository] findByUserId called:',
        'user-456'
      );
    });

    it('should return empty array even after creating results', async () => {
      const input: TestResultInput = {
        userId: 'user-123',
        characterType: 'joker',
        mbtiType: 'ENTJ',
      };

      await repository.create(input);
      const results = await repository.findByUserId('user-123');
      
      expect(results).toEqual([]);
    });
  });
});
