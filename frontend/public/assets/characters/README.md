# Character Images

Place your Halloween character images in this directory.

## Required Images

The following images are referenced in the application:

1. `zombie.png` - For ESTJ/ESTP personality types
2. `joker.png` - For ENTJ/ENTP personality types
3. `skeleton.png` - For INFJ/INFP personality types
4. `nun.png` - For ISFJ/ISFP personality types
5. `jack-o-lantern.png` - For ENFJ/ENFP personality types
6. `vampire.png` - For ISTJ/ISTP personality types
7. `ghost.png` - For ESFJ/ESFP personality types
8. `frankenstein.png` - For INTJ/INTP personality types

## Image Specifications

- **Format:** PNG (with transparency recommended)
- **Size:** 512x512 pixels or larger (will be displayed at 200-320px)
- **Aspect Ratio:** Square (1:1)
- **File Size:** Keep under 500KB for optimal loading

## File Naming

File names must match exactly as shown above (lowercase, with hyphens).

## Example Structure

```
frontend/public/assets/characters/
├── zombie.png
├── joker.png
├── skeleton.png
├── nun.png
├── jack-o-lantern.png
├── vampire.png
├── ghost.png
└── frankenstein.png
```

## Fallback

If an image is missing, a placeholder with a "?" will be shown automatically.

## Testing

After adding images, test by:
1. Running the app: `npm run dev`
2. Taking the personality test
3. Checking if your character image displays correctly

## Tips

- Use transparent backgrounds for better visual effect
- Ensure images are Halloween-themed
- Consider the dark background when designing images
- Test images on different screen sizes
