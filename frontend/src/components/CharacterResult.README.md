# CharacterResult Component

## Overview

The `CharacterResult` component displays the Halloween personality test result to the user. It shows the matched Halloween character with an animated image, character name and description in Korean, and action buttons for retaking the test or viewing the profile (in advanced mode).

## Features

- **Character Display**: Shows the Halloween character name in Korean with spooky styling
- **Character Image**: Displays character image with floating animation and glow effect
- **Description**: Shows detailed character description in Korean
- **Retake Test Button**: Always visible, allows users to retake the test
- **View Profile Button**: Conditionally shown based on `VITE_ENABLE_EMAIL_AUTH` feature flag
- **Halloween Theme**: Dark, spooky design with orange and purple accents
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Error Handling**: Fallback SVG if character image fails to load

## Props

```typescript
interface CharacterResultProps {
  character: HalloweenCharacter;           // Character type identifier
  characterInfo: CharacterInfo;            // Character details (name, description, image)
  onRetakeTest: () => void;                // Callback for retake button
  onViewProfile?: () => void;              // Optional callback for profile button
}
```

## Usage

### Simple Mode (No Authentication)

```tsx
import { CharacterResult } from '../components';

function ResultsPage() {
  const handleRetakeTest = () => {
    // Reset test and navigate to test page
    dispatch(resetTest());
    navigate('/test');
  };

  return (
    <CharacterResult
      character="zombie"
      characterInfo={{
        name: '좀비',
        description: '당신은 현실적이고 실용적인 좀비입니다...',
        imagePath: '/assets/characters/zombie.png',
        mbtiTypes: ['ESTJ', 'ESTP']
      }}
      onRetakeTest={handleRetakeTest}
    />
  );
}
```

### Advanced Mode (With Authentication)

```tsx
import { CharacterResult } from '../components';
import { useNavigate } from 'react-router-dom';

function ResultsPage() {
  const navigate = useNavigate();

  const handleRetakeTest = () => {
    dispatch(resetTest());
    navigate('/test');
  };

  const handleViewProfile = () => {
    navigate('/profile');
  };

  return (
    <CharacterResult
      character="zombie"
      characterInfo={characterInfo}
      onRetakeTest={handleRetakeTest}
      onViewProfile={handleViewProfile}
    />
  );
}
```

## Styling

### Halloween Theme Colors

- **Background**: `halloween-dark` (#0a0a0a)
- **Border**: `halloween-purple` (#6a0dad)
- **Title**: `halloween-orange` (#ff6b35)
- **Character Name**: `halloween-purple` (#6a0dad)
- **Text**: Gray-200 for descriptions

### Animations

- **Floating Animation**: Character image floats up and down (3s ease-in-out infinite)
- **Glow Effect**: Pulsing orange glow behind character image
- **Button Hover**: Scale transform on hover (1.05x)
- **Button Active**: Scale transform on click (0.95x)

### Responsive Breakpoints

- **Mobile**: Base styles, single column layout
- **Tablet (sm)**: Larger text, buttons in row
- **Desktop (lg)**: Maximum sizes for text and images

## Accessibility

- Semantic HTML with proper heading hierarchy
- ARIA labels on buttons
- Alt text on images
- Focus states with visible outlines
- Keyboard navigation support
- High contrast text colors

## Feature Flag Behavior

The component checks the `features.emailAuth` flag to determine whether to show the "View Profile" button:

- **Simple Mode** (`VITE_ENABLE_EMAIL_AUTH=false`): Only "Retake Test" button shown
- **Advanced Mode** (`VITE_ENABLE_EMAIL_AUTH=true`): Both buttons shown if `onViewProfile` is provided

## Error Handling

If the character image fails to load, the component displays a fallback SVG with a question mark in Halloween theme colors.

## Testing

The component includes comprehensive tests covering:

- Character name and description rendering
- Image display and error handling
- Button rendering and click handlers
- Feature flag conditional rendering
- Halloween theme styling
- Floating animation application
- All 8 character types

Run tests with:

```bash
npm test CharacterResult.test.tsx
```

## Requirements Satisfied

- **1.5**: Display Halloween character result with description
- **11.1**: Halloween-themed design with dark, spooky styling
- **11.2**: Character images from assets directory
- **11.3**: Character descriptions in Korean
- **12.4**: Character name and description display
- **12.5**: Retake test functionality

## Related Components

- `TestQuestion`: Displays individual test questions
- `ProgressIndicator`: Shows test progress
- Pages that use this component:
  - `ResultsPage`: Main results display page

## Future Enhancements

- Social sharing buttons
- Animation on component mount
- Character comparison feature
- Download result as image
- Share result link generation
