# Halloween Theme Guide

This guide provides comprehensive documentation for using the Halloween theme in the application.

## Table of Contents

1. [Colors](#colors)
2. [Typography](#typography)
3. [Buttons](#buttons)
4. [Cards](#cards)
5. [Input Fields](#input-fields)
6. [Animations](#animations)
7. [Component Classes](#component-classes)
8. [Usage Examples](#usage-examples)

## Colors

### Primary Colors

```css
halloween-dark: #0a0a0a        /* Main dark background */
halloween-darker: #050505      /* Darker background variant */
halloween-orange: #ff6b35      /* Primary accent color */
halloween-purple: #6a0dad      /* Secondary accent color */
halloween-green: #39ff14       /* Success/highlight color */
halloween-blood: #8b0000       /* Error/danger color */
```

### Additional Colors

```css
halloween-orange-light: #ff8c5a    /* Lighter orange for hovers */
halloween-purple-light: #8b2fc9    /* Lighter purple for hovers */
halloween-gray-dark: #1a1a1a       /* Dark gray for cards */
halloween-gray-medium: #2a2a2a     /* Medium gray for inputs */
```

### Usage

```tsx
<div className="bg-halloween-dark text-halloween-orange">
  Content
</div>
```

## Typography

### Font Families

- **Creepster**: Spooky display font for headings
- **Noto Sans KR**: Clean Korean font for body text

### Typography Classes

```tsx
// Headings
<h1 className="text-halloween-heading">
  Main Heading (4xl-6xl, Creepster, Orange Glow)
</h1>

<h2 className="text-halloween-subheading">
  Subheading (2xl-4xl, Creepster, Purple Glow)
</h2>

// Body Text
<p className="text-halloween-body">
  Body text (base-lg, Noto Sans KR, White)
</p>

<p className="text-halloween-small">
  Small text (sm, Noto Sans KR, Gray)
</p>
```

### Text Glow Effects

```tsx
<p className="text-glow-orange">Glowing orange text</p>
<p className="text-glow-purple">Glowing purple text</p>
<p className="text-glow-green">Glowing green text</p>
```

## Buttons

### Button Variants

```tsx
// Primary Button (Orange)
<button className="btn-halloween-primary">
  Primary Action
</button>

// Secondary Button (Purple)
<button className="btn-halloween-secondary">
  Secondary Action
</button>

// Ghost Button (Transparent with Orange Border)
<button className="btn-halloween-ghost">
  Ghost Action
</button>

// Danger Button (Red)
<button className="btn-halloween-danger">
  Delete
</button>

// Disabled Button
<button className="btn-halloween-disabled" disabled>
  Disabled
</button>
```

### Button Features

- Automatic hover scale effect (105%)
- Active press effect (95%)
- Focus ring for accessibility
- Smooth transitions (300ms)
- Glow shadow effects

## Cards

### Card Variants

```tsx
// Basic Card
<div className="card-halloween">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>

// Hover Card (scales on hover)
<div className="card-halloween-hover">
  <h3>Interactive Card</h3>
  <p>Hover over me!</p>
</div>

// Glow Card (Orange glow)
<div className="card-halloween-glow">
  <h3>Highlighted Card</h3>
  <p>Important content</p>
</div>

// Purple Glow Card
<div className="card-halloween-purple">
  <h3>Purple Card</h3>
  <p>Alternative highlight</p>
</div>
```

### Card Features

- Dark background with border
- Rounded corners (xl)
- Padding (6)
- Smooth transitions
- Optional hover effects

## Input Fields

### Input Variants

```tsx
// Normal Input
<input
  type="text"
  className="input-halloween"
  placeholder="Enter text"
/>

// Error Input
<input
  type="text"
  className="input-halloween-error"
  placeholder="Invalid input"
/>

// Success Input
<input
  type="text"
  className="input-halloween-success"
  placeholder="Valid input"
/>
```

### Input Features

- Dark background
- Orange focus ring
- Smooth transitions
- Full width by default
- Accessible focus states

## Animations

### Available Animations

```tsx
// Float Animation (3s infinite)
<div className="animate-float">
  Floating element
</div>

// Glow Animation (2s infinite)
<div className="animate-glow">
  Glowing element
</div>

// Pulse Animation (2s infinite)
<div className="animate-pulse">
  Pulsing element
</div>

// Shake Animation (0.5s once)
<div className="animate-shake">
  Shaking element
</div>

// Fade In Animation (0.5s once)
<div className="animate-fadeIn">
  Fading in element
</div>

// Slide In Animation (0.5s once)
<div className="animate-slideIn">
  Sliding in element
</div>

// Bounce Animation (1s infinite)
<div className="animate-bounce">
  Bouncing element
</div>

// Shimmer Animation (2s infinite)
<div className="animate-shimmer">
  Shimmering element
</div>
```

## Component Classes

### Container Classes

```tsx
// Full-screen Halloween container
<div className="container-halloween">
  Content
</div>

// Centered container
<div className="container-halloween-centered">
  Centered content
</div>
```

### Progress Bar

```tsx
<div className="progress-halloween">
  <div 
    className="progress-halloween-fill" 
    style={{ width: '66%' }}
  />
</div>
```

### Badges

```tsx
<span className="badge-halloween-orange">Orange Badge</span>
<span className="badge-halloween-purple">Purple Badge</span>
<span className="badge-halloween-green">Green Badge</span>
```

### Messages

```tsx
// Error Message
<div className="error-halloween">
  <strong>오류:</strong> 에러 메시지
</div>

// Success Message
<div className="success-halloween">
  <strong>성공:</strong> 성공 메시지
</div>
```

### Loading Spinner

```tsx
<div className="spinner-halloween" />
```

### Links

```tsx
<a href="#" className="link-halloween">
  Halloween Link
</a>
```

### Modal/Overlay

```tsx
<div className="overlay-halloween">
  <div className="modal-halloween">
    <h3>Modal Title</h3>
    <p>Modal content</p>
  </div>
</div>
```

### Answer Options

```tsx
// Unselected
<div className="answer-option-halloween">
  <p>Answer option</p>
</div>

// Selected
<div className="answer-option-halloween-selected">
  <p>Selected answer</p>
</div>
```

### Character Card

```tsx
<div className="character-card-halloween">
  <div className="character-image-halloween">
    <img src="/path/to/character.png" alt="Character" />
  </div>
  <h3>Character Name</h3>
  <p>Character description</p>
</div>
```

### Dividers

```tsx
<div className="divider-halloween" />
<div className="divider-halloween-glow" />
```

## Usage Examples

### Complete Page Example

```tsx
import React from 'react';

const ExamplePage: React.FC = () => {
  return (
    <div className="container-halloween-centered">
      <div className="max-w-2xl w-full space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-halloween-heading mb-4">
            할로윈 성격 테스트
          </h1>
          <p className="text-halloween-body">
            당신의 할로윈 캐릭터를 찾아보세요!
          </p>
        </div>

        {/* Card with Form */}
        <div className="card-halloween space-y-6">
          <h2 className="text-halloween-subheading">
            시작하기
          </h2>
          
          <div>
            <label className="block text-halloween-body mb-2">
              이메일
            </label>
            <input
              type="email"
              className="input-halloween"
              placeholder="email@example.com"
            />
          </div>

          <button className="btn-halloween-primary w-full">
            테스트 시작
          </button>
        </div>

        {/* Progress */}
        <div className="card-halloween">
          <p className="text-halloween-body mb-2">진행률: 33%</p>
          <div className="progress-halloween">
            <div 
              className="progress-halloween-fill" 
              style={{ width: '33%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamplePage;
```

### Answer Selection Example

```tsx
import React, { useState } from 'react';

const QuestionExample: React.FC = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="container-halloween p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <h2 className="text-halloween-subheading">
          질문 1
        </h2>
        
        <p className="text-halloween-body">
          주말에 에너지를 충전하는 방법은?
        </p>

        <div className="space-y-4">
          <div
            className={
              selected === 'a'
                ? 'answer-option-halloween-selected'
                : 'answer-option-halloween'
            }
            onClick={() => setSelected('a')}
          >
            <p className="text-halloween-body">
              A. 친구들과 만나서 활동적으로 보낸다
            </p>
          </div>

          <div
            className={
              selected === 'b'
                ? 'answer-option-halloween-selected'
                : 'answer-option-halloween'
            }
            onClick={() => setSelected('b')}
          >
            <p className="text-halloween-body">
              B. 집에서 혼자 조용히 쉰다
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="btn-halloween-ghost flex-1">
            이전
          </button>
          <button 
            className={
              selected 
                ? "btn-halloween-primary flex-1"
                : "btn-halloween-disabled flex-1"
            }
            disabled={!selected}
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionExample;
```

## Testing the Theme

To view all theme components in action, navigate to the ThemeShowcase page during development:

```tsx
import ThemeShowcase from './pages/ThemeShowcase';

// Add to your router
<Route path="/theme-showcase" element={<ThemeShowcase />} />
```

## Best Practices

1. **Consistency**: Always use theme classes instead of custom styles
2. **Accessibility**: Ensure proper contrast ratios and focus states
3. **Responsive**: Test on mobile, tablet, and desktop
4. **Performance**: Use animations sparingly on mobile devices
5. **Korean Text**: Always use `font-korean` for Korean content
6. **Headings**: Use `font-spooky` for English/decorative headings only

## Customization

To customize the theme, edit:
- `frontend/tailwind.config.js` - Theme configuration
- `frontend/src/index.css` - Component classes

After making changes, restart the development server to see updates.
