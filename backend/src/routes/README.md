# API Routes

This directory contains all API route definitions for the Halloween Personality Test backend.

## Test Routes (`/api/test`)

Routes for handling personality test questions and submissions.

### Endpoints

#### `GET /api/test/questions`

Returns all 15 test questions in Korean.

**Response:**
```json
{
  "questions": [
    {
      "id": "ei_1",
      "text": "주말에 에너지를 충전하는 방법은?",
      "dimension": "EI",
      "answers": [
        {
          "id": "ei_1_a",
          "text": "친구들과 만나서 활동적으로 보낸다",
          "value": "E"
        },
        {
          "id": "ei_1_b",
          "text": "집에서 혼자 조용히 쉰다",
          "value": "I"
        }
      ]
    }
    // ... 14 more questions
  ]
}
```

**Status Codes:**
- `200 OK` - Questions returned successfully

---

#### `POST /api/test/submit`

Submits test answers and returns the calculated Halloween character result.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "ei_1",
      "answerId": "ei_1_a",
      "value": "E"
    }
    // ... must include all 15 answers
  ]
}
```

**Validation Rules:**
- Must include exactly 15 answers
- Each answer must have `questionId`, `answerId`, and `value`
- `value` must be one of: `E`, `I`, `N`, `S`, `T`, `F`

**Response:**
```json
{
  "character": "zombie",
  "characterInfo": {
    "name": "좀비",
    "description": "당신은 현실적이고 실용적인 좀비입니다...",
    "imagePath": "/assets/characters/zombie.png",
    "mbtiTypes": ["ESTJ", "ESTP"]
  },
  "mbtiType": "EST"
}
```

**Status Codes:**
- `200 OK` - Result calculated successfully
- `400 Bad Request` - Validation error (missing/invalid answers)
- `500 Internal Server Error` - Server error

**Error Response:**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "모든 질문에 답변해주세요.",
  "errors": [
    {
      "field": "answers",
      "message": "모든 질문에 답변해주세요."
    }
  ]
}
```

---

## Character Mappings

The test calculates MBTI type based on majority vote for each dimension:
- **E/I** (Extraversion/Introversion): 5 questions
- **N/S** (Intuition/Sensing): 5 questions
- **T/F** (Thinking/Feeling): 5 questions

Results are mapped to Halloween characters:

| MBTI Type | Character | Korean Name |
|-----------|-----------|-------------|
| EST | zombie | 좀비 |
| ENT | joker | 조커 |
| INF | skeleton | 해골 |
| ISF | nun | 수녀 |
| ENF | jack-o-lantern | 잭오랜턴 |
| IST | vampire | 뱀파이어 |
| ESF | ghost | 유령 |
| INT | frankenstein | 프랑켄슈타인 |

---

## Error Handling

All routes use centralized error handling with Korean error messages:

| Error Code | Message | Status |
|------------|---------|--------|
| `VALIDATION_ERROR` | 입력 데이터가 올바르지 않습니다. | 400 |
| `INCOMPLETE_ANSWERS` | 모든 질문에 답변해주세요. | 400 |
| `INVALID_JSON` | 잘못된 JSON 형식입니다. | 400 |
| `NOT_FOUND` | 요청한 리소스를 찾을 수 없습니다. | 404 |
| `INTERNAL_ERROR` | 서버 오류가 발생했습니다. | 500 |

---

## Testing

Integration tests are located in `__tests__/testRoutes.test.ts`.

Run tests:
```bash
npm test
```

Run specific test file:
```bash
npm test testRoutes.test.ts
```

Manual testing:
```bash
# Start the server
npm run dev

# In another terminal, run the manual test script
node test-endpoints.js
```

---

## Simple Mode vs Advanced Mode

These routes work in both simple and advanced modes:

**Simple Mode** (`ENABLE_EMAIL_AUTH=false`):
- No authentication required
- Results are not stored
- No email notifications

**Advanced Mode** (`ENABLE_EMAIL_AUTH=true`):
- Authentication required for `/api/test/submit`
- Results are stored in database
- Email notification sent after submission
- Handled automatically by service injection middleware

