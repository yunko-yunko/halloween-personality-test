# TestScoringService

## Overview
The `TestScoringService` class implements the core personality calculation logic for the Halloween Personality Test. It calculates MBTI personality types from user answers and maps them to Halloween characters.

## Features

### 1. Personality Calculation
- Takes 15 answers (5 per dimension: E/I, N/S, T/F)
- Uses majority vote algorithm for each dimension
- Returns 3-letter MBTI type (e.g., 'EST', 'INF')

### 2. Character Mapping
Maps MBTI types to 8 Halloween characters:
- **EST** → 좀비 (Zombie)
- **ENT** → 조커 (Joker)
- **INF** → 해골 (Skeleton)
- **ISF** → 수녀 (Nun)
- **ENF** → 잭오랜턴 (Jack-o'-lantern)
- **IST** → 뱀파이어 (Vampire)
- **ESF** → 유령 (Ghost)
- **INT** → 프랑켄슈타인 (Frankenstein)

## Usage

```typescript
import { TestScoringService } from './services/TestScoringService';
import { DimensionValue } from './types';

const service = new TestScoringService();

// Calculate personality from answers
const answers: DimensionValue[] = [
  'E', 'E', 'E', 'I', 'I', // E/I dimension
  'N', 'N', 'S', 'S', 'S', // N/S dimension
  'T', 'T', 'T', 'F', 'F', // T/F dimension
];

const result = service.calculateResult(answers);
// { mbtiType: 'EST', character: 'zombie' }
```

## Methods

### `calculatePersonality(answers: DimensionValue[]): string`
Calculates the MBTI personality type from user answers.

**Parameters:**
- `answers`: Array of 15 dimension values (5 E/I, 5 N/S, 5 T/F)

**Returns:**
- 3-letter MBTI type string

**Throws:**
- Error if not exactly 15 answers
- Error if answers not distributed correctly (5 per dimension)

### `mapToCharacter(mbtiType: string): HalloweenCharacter`
Maps a 3-letter MBTI type to a Halloween character.

**Parameters:**
- `mbtiType`: 3-letter MBTI type (e.g., 'EST')

**Returns:**
- Halloween character type

**Throws:**
- Error if MBTI type is not exactly 3 characters
- Error if MBTI type is unknown

### `calculateResult(answers: DimensionValue[]): { mbtiType: string; character: HalloweenCharacter }`
Convenience method that calculates personality and maps to character in one step.

**Parameters:**
- `answers`: Array of 15 dimension values

**Returns:**
- Object with `mbtiType` and `character`

## Testing

The service has comprehensive unit tests covering:
- All 8 character mappings
- Majority vote algorithm for each dimension
- Edge cases (ties, mixed answers)
- Error handling (invalid input)

Run tests:
```bash
npm test -- TestScoringService
```

## Requirements Satisfied

This implementation satisfies the following requirements:
- **1.2**: Calculate personality type using majority vote per dimension
- **1.3**: Map personality type to Halloween character
- **1.4**: Use first 3 MBTI letters for mapping
- **3.1-3.8**: All 8 character mappings implemented correctly
