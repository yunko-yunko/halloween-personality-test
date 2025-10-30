import { DimensionValue, HalloweenCharacter } from '../types';

/**
 * Service for calculating MBTI personality types and mapping to Halloween characters
 */
export class TestScoringService {
  /**
   * Calculate MBTI personality type from user answers
   * Uses majority vote for each dimension (E/I, N/S, T/F)
   * 
   * @param answers - Array of dimension values from user's answers
   * @returns MBTI type as 3-letter string (e.g., 'EST')
   */
  calculatePersonality(answers: DimensionValue[]): string {
    if (answers.length !== 15) {
      throw new Error('Expected exactly 15 answers');
    }

    // Separate answers by dimension
    const eiAnswers = answers.filter(a => a === 'E' || a === 'I');
    const nsAnswers = answers.filter(a => a === 'N' || a === 'S');
    const tfAnswers = answers.filter(a => a === 'T' || a === 'F');

    // Validate we have 5 answers per dimension
    if (eiAnswers.length !== 5 || nsAnswers.length !== 5 || tfAnswers.length !== 5) {
      throw new Error('Expected 5 answers per dimension (E/I, N/S, T/F)');
    }

    // Calculate majority vote for each dimension
    const eiResult = this.calculateDimension(eiAnswers, 'E', 'I');
    const nsResult = this.calculateDimension(nsAnswers, 'N', 'S');
    const tfResult = this.calculateDimension(tfAnswers, 'T', 'F');

    return `${eiResult}${nsResult}${tfResult}`;
  }

  /**
   * Calculate the result for a single dimension using majority vote
   * 
   * @param answers - Array of answers for this dimension
   * @param first - First option (e.g., 'E')
   * @param second - Second option (e.g., 'I')
   * @returns The winning option
   */
  private calculateDimension(
    answers: DimensionValue[],
    first: string,
    second: string
  ): string {
    const firstCount = answers.filter(a => a === first).length;
    const secondCount = answers.filter(a => a === second).length;

    // Majority vote - if tied, default to first option
    return firstCount >= secondCount ? first : second;
  }

  /**
   * Map MBTI type (3 letters) to Halloween character
   * Based on E/I, N/S, T/F dimensions only (ignoring J/P)
   * 
   * @param mbtiType - 3-letter MBTI type (e.g., 'EST')
   * @returns Halloween character type
   */
  mapToCharacter(mbtiType: string): HalloweenCharacter {
    if (mbtiType.length !== 3) {
      throw new Error('MBTI type must be exactly 3 characters');
    }

    // Character mapping based on first 3 MBTI letters
    const characterMap: Record<string, HalloweenCharacter> = {
      // ESTJ/ESTP -> 좀비 (Zombie)
      'EST': 'zombie',
      
      // ENTJ/ENTP -> 조커 (Joker)
      'ENT': 'joker',
      
      // INFJ/INFP -> 해골 (Skeleton)
      'INF': 'skeleton',
      
      // ISFJ/ISFP -> 수녀 (Nun)
      'ISF': 'nun',
      
      // ENFJ/ENFP -> 잭오랜턴 (Jack-o'-lantern)
      'ENF': 'jack-o-lantern',
      
      // ISTJ/ISTP -> 뱀파이어 (Vampire)
      'IST': 'vampire',
      
      // ESFJ/ESFP -> 유령 (Ghost)
      'ESF': 'ghost',
      
      // INTJ/INTP -> 프랑켄슈타인 (Frankenstein)
      'INT': 'frankenstein',
    };

    const character = characterMap[mbtiType];
    
    if (!character) {
      throw new Error(`Unknown MBTI type: ${mbtiType}`);
    }

    return character;
  }

  /**
   * Calculate personality and map to character in one step
   * 
   * @param answers - Array of dimension values from user's answers
   * @returns Object containing MBTI type and Halloween character
   */
  calculateResult(answers: DimensionValue[]): {
    mbtiType: string;
    character: HalloweenCharacter;
  } {
    const mbtiType = this.calculatePersonality(answers);
    const character = this.mapToCharacter(mbtiType);

    return { mbtiType, character };
  }
}
