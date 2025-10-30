import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterResult from './CharacterResult';
import type { HalloweenCharacter, CharacterInfo } from '../types';

// Mock the features config
vi.mock('../config/features', () => ({
  features: {
    emailAuth: false,
  },
}));

describe('CharacterResult', () => {
  const mockCharacterInfo: CharacterInfo = {
    name: '좀비',
    description: '당신은 현실적이고 실용적인 좀비입니다.',
    imagePath: '/assets/characters/zombie.png',
    mbtiTypes: ['ESTJ', 'ESTP'],
  };

  const mockOnRetakeTest = vi.fn();
  const mockOnViewProfile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders character name in Korean', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    expect(screen.getByText('좀비')).toBeInTheDocument();
  });

  it('renders character description in Korean', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    expect(screen.getByText(/당신은 현실적이고 실용적인 좀비입니다/)).toBeInTheDocument();
  });

  it('displays character image with correct src', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    const image = screen.getByAltText('좀비') as HTMLImageElement;
    expect(image).toBeInTheDocument();
    expect(image.src).toContain('/assets/characters/zombie.png');
  });

  it('renders retake test button', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    const retakeButton = screen.getByRole('button', { name: /테스트 다시하기/ });
    expect(retakeButton).toBeInTheDocument();
  });

  it('calls onRetakeTest when retake button is clicked', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    const retakeButton = screen.getByRole('button', { name: /테스트 다시하기/ });
    fireEvent.click(retakeButton);

    expect(mockOnRetakeTest).toHaveBeenCalledTimes(1);
  });

  it('does not show view profile button when emailAuth is disabled', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
        onViewProfile={mockOnViewProfile}
      />
    );

    const profileButton = screen.queryByRole('button', { name: /프로필 보기/ });
    expect(profileButton).not.toBeInTheDocument();
  });

  it('shows view profile button when emailAuth is enabled', async () => {
    // Re-mock with emailAuth enabled
    vi.resetModules();
    vi.doMock('../config/features', () => ({
      features: {
        emailAuth: true,
      },
    }));

    const { default: CharacterResultWithAuth } = await import('./CharacterResult');

    render(
      <CharacterResultWithAuth
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
        onViewProfile={mockOnViewProfile}
      />
    );

    const profileButton = screen.getByRole('button', { name: /프로필 보기/ });
    expect(profileButton).toBeInTheDocument();
  });

  it('calls onViewProfile when profile button is clicked', async () => {
    // Re-mock with emailAuth enabled
    vi.resetModules();
    vi.doMock('../config/features', () => ({
      features: {
        emailAuth: true,
      },
    }));

    const { default: CharacterResultWithAuth } = await import('./CharacterResult');

    render(
      <CharacterResultWithAuth
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
        onViewProfile={mockOnViewProfile}
      />
    );

    const profileButton = screen.getByRole('button', { name: /프로필 보기/ });
    fireEvent.click(profileButton);

    expect(mockOnViewProfile).toHaveBeenCalledTimes(1);
  });

  it('applies Halloween theme styling', () => {
    const { container } = render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    // Check for Halloween theme classes
    expect(container.querySelector('.bg-halloween-dark')).toBeInTheDocument();
    expect(container.querySelector('.border-halloween-purple')).toBeInTheDocument();
    expect(container.querySelector('.text-halloween-orange')).toBeInTheDocument();
  });

  it('applies floating animation to character image', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    const image = screen.getByAltText('좀비');
    expect(image).toHaveClass('animate-float');
  });

  it('handles image load error with fallback', () => {
    render(
      <CharacterResult
        character="zombie"
        characterInfo={mockCharacterInfo}
        onRetakeTest={mockOnRetakeTest}
      />
    );

    const image = screen.getByAltText('좀비') as HTMLImageElement;
    
    // Simulate image error
    fireEvent.error(image);

    // Check that src was changed to fallback SVG
    expect(image.src).toContain('data:image/svg+xml');
  });

  it('renders all character types correctly', () => {
    const characters: Array<{ character: HalloweenCharacter; name: string }> = [
      { character: 'zombie', name: '좀비' },
      { character: 'joker', name: '조커' },
      { character: 'skeleton', name: '해골' },
      { character: 'nun', name: '수녀' },
      { character: 'jack-o-lantern', name: '잭오랜턴' },
      { character: 'vampire', name: '뱀파이어' },
      { character: 'ghost', name: '유령' },
      { character: 'frankenstein', name: '프랑켄슈타인' },
    ];

    characters.forEach(({ character, name }) => {
      const info: CharacterInfo = {
        name,
        description: `${name} 설명`,
        imagePath: `/assets/characters/${character}.png`,
        mbtiTypes: ['TEST', 'TEST'],
      };

      const { unmount } = render(
        <CharacterResult
          character={character}
          characterInfo={info}
          onRetakeTest={mockOnRetakeTest}
        />
      );

      expect(screen.getByText(name)).toBeInTheDocument();
      unmount();
    });
  });
});
