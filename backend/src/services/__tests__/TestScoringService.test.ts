import { TestScoringService } from '../TestScoringService';
import { DimensionValue, HalloweenCharacter } from '../../types';

describe('TestScoringService', () => {
  let service: TestScoringService;

  beforeEach(() => {
    service = new TestScoringService();
  });

  describe('calculatePersonality', () => {
    it('should calculate EST personality type', () => {
      // 5 E answers, 5 S answers, 5 T answers
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E', // All E
        'S', 'S', 'S', 'S', 'S', // All S
        'T', 'T', 'T', 'T', 'T', // All T
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('EST');
    });

    it('should calculate INT personality type', () => {
      // 5 I answers, 5 N answers, 5 T answers
      const answers: DimensionValue[] = [
        'I', 'I', 'I', 'I', 'I', // All I
        'N', 'N', 'N', 'N', 'N', // All N
        'T', 'T', 'T', 'T', 'T', // All T
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('INT');
    });

    it('should calculate ENF personality type', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E', // All E
        'N', 'N', 'N', 'N', 'N', // All N
        'F', 'F', 'F', 'F', 'F', // All F
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('ENF');
    });

    it('should calculate ISF personality type', () => {
      const answers: DimensionValue[] = [
        'I', 'I', 'I', 'I', 'I', // All I
        'S', 'S', 'S', 'S', 'S', // All S
        'F', 'F', 'F', 'F', 'F', // All F
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('ISF');
    });

    it('should use majority vote for E/I dimension', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'I', 'I', // 3 E, 2 I -> E wins
        'S', 'S', 'S', 'S', 'S',
        'T', 'T', 'T', 'T', 'T',
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('EST');
    });

    it('should use majority vote for N/S dimension', () => {
      const answers: DimensionValue[] = [
        'I', 'I', 'I', 'I', 'I',
        'N', 'N', 'N', 'S', 'S', // 3 N, 2 S -> N wins
        'T', 'T', 'T', 'T', 'T',
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('INT');
    });

    it('should use majority vote for T/F dimension', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E',
        'N', 'N', 'N', 'N', 'N',
        'F', 'F', 'F', 'T', 'T', // 3 F, 2 T -> F wins
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('ENF');
    });

    it('should default to first option when tied (E/I)', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'I', 'I', 'I', // 2 E, 3 I -> I wins
        'S', 'S', 'S', 'S', 'S',
        'T', 'T', 'T', 'T', 'T',
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('IST');
    });

    it('should handle mixed answers correctly', () => {
      const answers: DimensionValue[] = [
        'E', 'I', 'E', 'I', 'E', // 3 E, 2 I -> E
        'N', 'S', 'N', 'S', 'N', // 3 N, 2 S -> N
        'T', 'F', 'T', 'F', 'T', // 3 T, 2 F -> T
      ];

      const result = service.calculatePersonality(answers);
      expect(result).toBe('ENT');
    });

    it('should throw error if not exactly 15 answers', () => {
      const answers: DimensionValue[] = ['E', 'S', 'T'];

      expect(() => service.calculatePersonality(answers)).toThrow(
        'Expected exactly 15 answers'
      );
    });

    it('should throw error if answers are not distributed correctly', () => {
      // 10 E/I answers, 5 N/S answers, 0 T/F answers
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E',
        'I', 'I', 'I', 'I', 'I',
        'N', 'N', 'N', 'N', 'N',
      ];

      expect(() => service.calculatePersonality(answers)).toThrow(
        'Expected 5 answers per dimension (E/I, N/S, T/F)'
      );
    });
  });

  describe('mapToCharacter', () => {
    it('should map EST to zombie', () => {
      const character = service.mapToCharacter('EST');
      expect(character).toBe('zombie');
    });

    it('should map ENT to joker', () => {
      const character = service.mapToCharacter('ENT');
      expect(character).toBe('joker');
    });

    it('should map INF to skeleton', () => {
      const character = service.mapToCharacter('INF');
      expect(character).toBe('skeleton');
    });

    it('should map ISF to nun', () => {
      const character = service.mapToCharacter('ISF');
      expect(character).toBe('nun');
    });

    it('should map ENF to jack-o-lantern', () => {
      const character = service.mapToCharacter('ENF');
      expect(character).toBe('jack-o-lantern');
    });

    it('should map IST to vampire', () => {
      const character = service.mapToCharacter('IST');
      expect(character).toBe('vampire');
    });

    it('should map ESF to ghost', () => {
      const character = service.mapToCharacter('ESF');
      expect(character).toBe('ghost');
    });

    it('should map INT to frankenstein', () => {
      const character = service.mapToCharacter('INT');
      expect(character).toBe('frankenstein');
    });

    it('should throw error for invalid MBTI type length', () => {
      expect(() => service.mapToCharacter('ES')).toThrow(
        'MBTI type must be exactly 3 characters'
      );
    });

    it('should throw error for unknown MBTI type', () => {
      expect(() => service.mapToCharacter('XYZ')).toThrow(
        'Unknown MBTI type: XYZ'
      );
    });
  });

  describe('calculateResult', () => {
    it('should calculate result for EST -> zombie', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E',
        'S', 'S', 'S', 'S', 'S',
        'T', 'T', 'T', 'T', 'T',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('EST');
      expect(result.character).toBe('zombie');
    });

    it('should calculate result for ENT -> joker', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E',
        'N', 'N', 'N', 'N', 'N',
        'T', 'T', 'T', 'T', 'T',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('ENT');
      expect(result.character).toBe('joker');
    });

    it('should calculate result for INF -> skeleton', () => {
      const answers: DimensionValue[] = [
        'I', 'I', 'I', 'I', 'I',
        'N', 'N', 'N', 'N', 'N',
        'F', 'F', 'F', 'F', 'F',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('INF');
      expect(result.character).toBe('skeleton');
    });

    it('should calculate result for ISF -> nun', () => {
      const answers: DimensionValue[] = [
        'I', 'I', 'I', 'I', 'I',
        'S', 'S', 'S', 'S', 'S',
        'F', 'F', 'F', 'F', 'F',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('ISF');
      expect(result.character).toBe('nun');
    });

    it('should calculate result for ENF -> jack-o-lantern', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E',
        'N', 'N', 'N', 'N', 'N',
        'F', 'F', 'F', 'F', 'F',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('ENF');
      expect(result.character).toBe('jack-o-lantern');
    });

    it('should calculate result for IST -> vampire', () => {
      const answers: DimensionValue[] = [
        'I', 'I', 'I', 'I', 'I',
        'S', 'S', 'S', 'S', 'S',
        'T', 'T', 'T', 'T', 'T',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('IST');
      expect(result.character).toBe('vampire');
    });

    it('should calculate result for ESF -> ghost', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'E', 'E',
        'S', 'S', 'S', 'S', 'S',
        'F', 'F', 'F', 'F', 'F',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('ESF');
      expect(result.character).toBe('ghost');
    });

    it('should calculate result for INT -> frankenstein', () => {
      const answers: DimensionValue[] = [
        'I', 'I', 'I', 'I', 'I',
        'N', 'N', 'N', 'N', 'N',
        'T', 'T', 'T', 'T', 'T',
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('INT');
      expect(result.character).toBe('frankenstein');
    });

    it('should handle edge case with majority votes', () => {
      const answers: DimensionValue[] = [
        'E', 'E', 'E', 'I', 'I', // 3 E -> E
        'N', 'N', 'S', 'S', 'S', // 3 S -> S
        'T', 'T', 'T', 'F', 'F', // 3 T -> T
      ];

      const result = service.calculateResult(answers);
      expect(result.mbtiType).toBe('EST');
      expect(result.character).toBe('zombie');
    });
  });

  describe('All 8 character mappings', () => {
    const testCases: Array<{
      mbtiType: string;
      character: HalloweenCharacter;
      koreanName: string;
    }> = [
      { mbtiType: 'EST', character: 'zombie', koreanName: '좀비' },
      { mbtiType: 'ENT', character: 'joker', koreanName: '조커' },
      { mbtiType: 'INF', character: 'skeleton', koreanName: '해골' },
      { mbtiType: 'ISF', character: 'nun', koreanName: '수녀' },
      { mbtiType: 'ENF', character: 'jack-o-lantern', koreanName: '잭오랜턴' },
      { mbtiType: 'IST', character: 'vampire', koreanName: '뱀파이어' },
      { mbtiType: 'ESF', character: 'ghost', koreanName: '유령' },
      { mbtiType: 'INT', character: 'frankenstein', koreanName: '프랑켄슈타인' },
    ];

    testCases.forEach(({ mbtiType, character, koreanName }) => {
      it(`should correctly map ${mbtiType} to ${character} (${koreanName})`, () => {
        const result = service.mapToCharacter(mbtiType);
        expect(result).toBe(character);
      });
    });
  });
});
