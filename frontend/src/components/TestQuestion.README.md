# TestQuestion Component

A Halloween-themed question component for displaying personality test questions with two answer options.

## Features

- ✅ Displays question text in Korean
- ✅ Shows two answer options as interactive buttons
- ✅ Visual feedback for selected answers
- ✅ Halloween theme styling (dark background, orange/purple accents)
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Accessibility compliant (ARIA attributes, keyboard navigation)
- ✅ Smooth animations and transitions
- ✅ Comprehensive test coverage

## Usage

```tsx
import TestQuestion from './components/TestQuestion';
import { Question } from './types';

function MyComponent() {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const question: Question = {
    id: 'ei_1',
    text: '주말에 에너지를 충전하는 방법은?',
    dimension: 'EI',
    answers: [
      {
        id: 'ei_1_a',
        text: '친구들과 만나서 활동적으로 보낸다',
        value: 'E',
      },
      {
        id: 'ei_1_b',
        text: '집에서 혼자 조용히 쉰다',
        value: 'I',
      },
    ],
  };

  return (
    <TestQuestion
      question={question}
      selectedAnswer={selectedAnswer}
      onAnswer={(answerId) => setSelectedAnswer(answerId)}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `question` | `Question` | Yes | The question object containing text, dimension, and answer options |
| `selectedAnswer` | `string \| null` | Yes | The ID of the currently selected answer, or null if none selected |
| `onAnswer` | `(answerId: string) => void` | Yes | Callback function called when an answer is selected |

## Question Type

```typescript
interface Question {
  id: string;
  text: string;
  dimension: 'EI' | 'NS' | 'TF';
  answers: [Answer, Answer];
}

interface Answer {
  id: string;
  text: string;
  value: 'E' | 'I' | 'N' | 'S' | 'T' | 'F';
}
```

## Styling

The component uses Tailwind CSS with custom Halloween theme colors:

- **Background**: `halloween-dark` (#0a0a0a) and `halloween-darker` (#050505)
- **Primary accent**: `halloween-orange` (#ff6b35)
- **Secondary accent**: `halloween-purple` (#6a0dad)
- **Font**: `Noto Sans KR` for Korean text

### Responsive Breakpoints

- **Mobile**: Base styles (< 640px)
- **Tablet**: `sm:` prefix (≥ 640px)
- **Desktop**: `lg:` prefix (≥ 1024px)

## Accessibility

- Uses semantic HTML (`<button>` elements)
- Includes `aria-pressed` attribute to indicate selection state
- Includes `aria-label` with selection status
- Supports keyboard navigation (Tab, Enter, Space)
- Focus indicators with ring styling
- Sufficient color contrast for readability

## Visual States

### Unselected Answer
- Dark background with purple border
- Hover effect: lighter purple background with glow
- Scale animation on hover

### Selected Answer
- Purple background with orange border
- Orange glow shadow effect
- Checkmark (✓) indicator
- Maintains hover effects

## Animations

- **Hover**: Scale up (1.02x) with smooth transition
- **Active**: Scale down (0.98x) for click feedback
- **Transition**: 300ms ease-in-out for all state changes
- **Shadow**: Glow effect on selected answers

## Testing

Run tests with:

```bash
npm test -- TestQuestion.test.tsx --run
```

### Test Coverage

- ✅ Renders question text
- ✅ Renders both answer options
- ✅ Calls onAnswer callback when clicked
- ✅ Highlights selected answer
- ✅ Shows checkmark for selected answer
- ✅ Allows changing selection
- ✅ Accessibility attributes
- ✅ Responsive classes
- ✅ Keyboard interaction

## Requirements Satisfied

- **1.1**: Presents questions with answer options
- **11.1**: Halloween-themed design with dark, spooky styling
- **11.4**: Visual feedback for interactions
- **16.1**: Single-column layout for mobile
- **16.2**: Adapted layout for tablets
- **16.3**: Optimized layout for desktop
- **16.4**: Appropriately sized touch targets

## Demo

To see the component in action, check out `TestQuestion.stories.tsx` for an interactive demo.
