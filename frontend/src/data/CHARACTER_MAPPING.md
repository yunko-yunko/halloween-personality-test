# Halloween Character to MBTI Mapping

This document defines the mapping between MBTI personality types and Halloween characters.

## Character Mapping Table

| Character | Korean Name | MBTI Types | Description |
|-----------|-------------|------------|-------------|
| Zombie | 좀비 | ESTJ, ESTP | Practical, organized, goal-oriented |
| Joker | 조커 | ENTJ, ENTP | Strategic, charismatic, innovative |
| Skeleton | 해골 | INFJ, INFP | Idealistic, empathetic, introspective |
| Nun | 수녀 | ISFJ, ISFP | Caring, traditional, harmonious |
| Jack-o'-lantern | 잭오랜턴 | ENFJ, ENFP | Enthusiastic, creative, social |
| Vampire | 뱀파이어 | ISTJ, ISTP | Analytical, independent, efficient |
| Ghost | 유령 | ESFJ, ESFP | Friendly, practical, fun-loving |
| Frankenstein | 프랑켄슈타인 | INTJ, INTP | Intellectual, innovative, logical |

## Mapping Logic

The mapping is based on the first 3 letters of the MBTI type (E/I, N/S, T/F), ignoring the 4th letter (J/P).

### Dimension Breakdown

- **E/I (Extraversion/Introversion)**: Social energy preference
- **N/S (Intuition/Sensing)**: Information processing style
- **T/F (Thinking/Feeling)**: Decision-making approach

### Examples

- ESTJ → Zombie (E + S + T)
- ESTP → Zombie (E + S + T)
- INFJ → Skeleton (I + N + F)
- INFP → Skeleton (I + N + F)

## Data Structure

The character descriptions are stored in `character-descriptions.json` with the following structure:

```json
{
  "character-key": {
    "name": "Korean Name",
    "description": "Korean description",
    "imagePath": "/assets/characters/character-key.png",
    "mbtiTypes": ["TYPE1", "TYPE2"]
  }
}
```

## Image Assets

Character images should be placed in `/frontend/public/assets/characters/` with the following naming convention:

- `zombie.png`
- `joker.png`
- `skeleton.png`
- `nun.png`
- `jack-o-lantern.png`
- `vampire.png`
- `ghost.png`
- `frankenstein.png`
