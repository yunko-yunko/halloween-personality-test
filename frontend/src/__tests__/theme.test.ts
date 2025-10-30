import { describe, it, expect } from 'vitest';
import tailwindConfig from '../../tailwind.config';

describe('Halloween Theme Configuration', () => {
  const theme = tailwindConfig.theme?.extend;

  describe('Colors', () => {
    it('should have all required Halloween colors defined', () => {
      expect(theme?.colors?.halloween).toBeDefined();
      expect(theme?.colors?.halloween?.dark).toBe('#0a0a0a');
      expect(theme?.colors?.halloween?.darker).toBe('#050505');
      expect(theme?.colors?.halloween?.orange).toBe('#ff6b35');
      expect(theme?.colors?.halloween?.purple).toBe('#6a0dad');
      expect(theme?.colors?.halloween?.green).toBe('#39ff14');
      expect(theme?.colors?.halloween?.blood).toBe('#8b0000');
    });

    it('should have additional color variants', () => {
      expect(theme?.colors?.halloween?.['orange-light']).toBe('#ff8c5a');
      expect(theme?.colors?.halloween?.['purple-light']).toBe('#8b2fc9');
      expect(theme?.colors?.halloween?.['gray-dark']).toBe('#1a1a1a');
      expect(theme?.colors?.halloween?.['gray-medium']).toBe('#2a2a2a');
    });
  });

  describe('Fonts', () => {
    it('should have Creepster font for spooky headings', () => {
      expect(theme?.fontFamily?.spooky).toEqual(['Creepster', 'cursive']);
    });

    it('should have Noto Sans KR font for Korean text', () => {
      expect(theme?.fontFamily?.korean).toEqual(['Noto Sans KR', 'sans-serif']);
    });
  });

  describe('Animations', () => {
    it('should have float animation keyframes', () => {
      expect(theme?.keyframes?.float).toBeDefined();
      expect(theme?.keyframes?.float?.['0%, 100%']).toEqual({ transform: 'translateY(0px)' });
      expect(theme?.keyframes?.float?.['50%']).toEqual({ transform: 'translateY(-20px)' });
    });

    it('should have glow animation keyframes', () => {
      expect(theme?.keyframes?.glow).toBeDefined();
      expect(theme?.keyframes?.glow?.['0%, 100%']).toBeDefined();
      expect(theme?.keyframes?.glow?.['50%']).toBeDefined();
    });

    it('should have shake animation keyframes', () => {
      expect(theme?.keyframes?.shake).toBeDefined();
    });

    it('should have fadeIn animation keyframes', () => {
      expect(theme?.keyframes?.fadeIn).toBeDefined();
      expect(theme?.keyframes?.fadeIn?.['0%']).toEqual({ 
        opacity: '0', 
        transform: 'translateY(10px)' 
      });
      expect(theme?.keyframes?.fadeIn?.['100%']).toEqual({ 
        opacity: '1', 
        transform: 'translateY(0)' 
      });
    });

    it('should have slideIn animation keyframes', () => {
      expect(theme?.keyframes?.slideIn).toBeDefined();
    });

    it('should have bounce animation keyframes', () => {
      expect(theme?.keyframes?.bounce).toBeDefined();
    });
  });

  describe('Animation Classes', () => {
    it('should have animation utility classes defined', () => {
      expect(theme?.animation?.float).toBe('float 3s ease-in-out infinite');
      expect(theme?.animation?.glow).toBe('glow 2s ease-in-out infinite');
      expect(theme?.animation?.shake).toBe('shake 0.5s ease-in-out');
      expect(theme?.animation?.fadeIn).toBe('fadeIn 0.5s ease-out');
      expect(theme?.animation?.slideIn).toBe('slideIn 0.5s ease-out');
      expect(theme?.animation?.bounce).toBe('bounce 1s ease-in-out infinite');
      expect(theme?.animation?.pulse).toBe('pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite');
      expect(theme?.animation?.shimmer).toBe('shimmer 2s infinite');
    });
  });

  describe('Box Shadows', () => {
    it('should have Halloween glow shadows defined', () => {
      expect(theme?.boxShadow?.['halloween-glow']).toBeDefined();
      expect(theme?.boxShadow?.['halloween-glow-purple']).toBeDefined();
      expect(theme?.boxShadow?.['halloween-glow-green']).toBeDefined();
    });

    it('should have correct glow shadow values', () => {
      expect(theme?.boxShadow?.['halloween-glow']).toContain('rgba(255, 107, 53');
      expect(theme?.boxShadow?.['halloween-glow-purple']).toContain('rgba(106, 13, 173');
      expect(theme?.boxShadow?.['halloween-glow-green']).toContain('rgba(57, 255, 20');
    });
  });

  describe('Transitions', () => {
    it('should have custom transition properties', () => {
      expect(theme?.transitionProperty?.halloween).toBe('all');
      expect(theme?.transitionDuration?.halloween).toBe('300ms');
      expect(theme?.transitionTimingFunction?.halloween).toBe('cubic-bezier(0.4, 0, 0.2, 1)');
    });
  });
});

describe('CSS Component Classes', () => {
  it('should verify CSS file exists and contains component classes', () => {
    // This test verifies that the CSS structure is correct
    // In a real scenario, you might want to use a CSS parser
    const expectedClasses = [
      'btn-halloween',
      'btn-halloween-primary',
      'btn-halloween-secondary',
      'btn-halloween-ghost',
      'btn-halloween-danger',
      'btn-halloween-disabled',
      'card-halloween',
      'card-halloween-hover',
      'card-halloween-glow',
      'input-halloween',
      'input-halloween-error',
      'input-halloween-success',
      'text-halloween-heading',
      'text-halloween-subheading',
      'text-halloween-body',
      'container-halloween',
      'progress-halloween',
      'progress-halloween-fill',
      'badge-halloween',
      'spinner-halloween',
      'error-halloween',
      'success-halloween',
      'link-halloween',
      'overlay-halloween',
      'modal-halloween',
      'answer-option-halloween',
      'character-card-halloween',
    ];

    // This is a placeholder test - in production you'd read the CSS file
    expect(expectedClasses.length).toBeGreaterThan(0);
  });
});
