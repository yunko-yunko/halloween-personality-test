# ProgressIndicator Component

A Halloween-themed progress indicator component that displays the current page and total pages with a visual progress bar.

## Features

- **Page Counter**: Displays current page and total pages (e.g., "1/3", "2/3", "3/3")
- **Visual Progress Bar**: Animated progress bar with gradient fill
- **Halloween Theme**: Dark, spooky styling with orange and purple accents
- **Responsive Design**: Adapts to mobile, tablet, and desktop screen sizes
- **Accessibility**: Includes ARIA attributes and screen reader text
- **Smooth Animation**: 500ms transition animation when progress changes

## Usage

```tsx
import { ProgressIndicator } from './components';

function TestPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;

  return (
    <div>
      <ProgressIndicator 
        currentPage={currentPage} 
        totalPages={totalPages} 
      />
      {/* Your page content */}
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `currentPage` | `number` | Yes | The current page number (1-indexed) |
| `totalPages` | `number` | Yes | The total number of pages |

## Styling

The component uses Tailwind CSS with custom Halloween theme colors:

- **halloween-orange**: `#ff6b35` - Used for page numbers and progress glow
- **halloween-purple**: `#6a0dad` - Used for separator and progress gradient
- **halloween-blood**: `#8b0000` - Used in progress gradient
- **halloween-dark**: `#0a0a0a` - Used for progress bar background
- **halloween-darker**: `#050505` - Used for segment borders

## Responsive Breakpoints

- **Mobile** (default): Single column, smaller text and spacing
- **Tablet** (sm: 640px+): Medium text and spacing
- **Desktop** (lg: 1024px+): Larger text and spacing

## Accessibility

- Uses `role="progressbar"` with appropriate ARIA attributes
- Includes `aria-label` in Korean for screen readers
- Provides hidden text for screen readers: "{currentPage} of {totalPages} pages completed"
- Keyboard accessible (no interactive elements)

## Animation

The progress bar includes:
- **Fill Animation**: 500ms ease-out transition when width changes
- **Shimmer Effect**: Continuous 2s animation for visual interest
- **Gradient**: Multi-color gradient from purple to orange to blood red

## Examples

### Three-page test (first page)
```tsx
<ProgressIndicator currentPage={1} totalPages={3} />
// Displays: 1/3 with 33% progress bar
```

### Three-page test (middle page)
```tsx
<ProgressIndicator currentPage={2} totalPages={3} />
// Displays: 2/3 with 67% progress bar
```

### Three-page test (last page)
```tsx
<ProgressIndicator currentPage={3} totalPages={3} />
// Displays: 3/3 with 100% progress bar
```

## Requirements Satisfied

- **Requirement 2.1**: Displays progress indicator showing current page and total pages
- **Requirement 11.1**: Uses Halloween-themed design with dark, spooky styling

## Testing

The component includes comprehensive unit tests covering:
- Rendering of page numbers
- Progress bar percentage calculations
- ARIA attributes and accessibility
- Responsive classes
- Halloween theme styling
- Different page counts

Run tests with:
```bash
npm test -- ProgressIndicator.test.tsx
```

## Storybook

View the component in Storybook to see all variations:
```bash
npm run storybook
```

Stories include:
- First Page (1/3)
- Middle Page (2/3)
- Last Page (3/3)
- Five Pages (3/5)
- Ten Pages (7/10)
- Interactive (adjustable controls)
