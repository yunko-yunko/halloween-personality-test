/**
 * Tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validateRequired,
  validateAllQuestionsAnswered,
} from './validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.co.kr',
      'user+tag@example.com',
      'user123@test-domain.com',
    ];

    validEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  it('should reject invalid email addresses', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'user@',
      'user @example.com',
      'user@example',
      '',
    ];

    invalidEmails.forEach((email) => {
      const result = validateEmail(email);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  it('should reject empty email', () => {
    const result = validateEmail('');
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('이메일 주소를 입력해주세요.');
  });

  it('should trim whitespace before validation', () => {
    const result = validateEmail('  test@example.com  ');
    expect(result.isValid).toBe(true);
  });
});

describe('validateRequired', () => {
  it('should validate non-empty values', () => {
    const result = validateRequired('some value', '필드');
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject empty values', () => {
    const result = validateRequired('', '필드');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('필드');
  });

  it('should reject whitespace-only values', () => {
    const result = validateRequired('   ', '필드');
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('필드');
  });
});

describe('validateAllQuestionsAnswered', () => {
  it('should validate when all questions are answered', () => {
    const answers = {
      q1: 'a1',
      q2: 'a2',
      q3: 'a3',
    };
    const questionIds = ['q1', 'q2', 'q3'];

    const result = validateAllQuestionsAnswered(answers, questionIds);
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject when some questions are unanswered', () => {
    const answers = {
      q1: 'a1',
      q3: 'a3',
    };
    const questionIds = ['q1', 'q2', 'q3'];

    const result = validateAllQuestionsAnswered(answers, questionIds);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('모든 질문에 답변해주세요.');
  });

  it('should reject when no questions are answered', () => {
    const answers = {};
    const questionIds = ['q1', 'q2', 'q3'];

    const result = validateAllQuestionsAnswered(answers, questionIds);
    expect(result.isValid).toBe(false);
    expect(result.error).toBe('모든 질문에 답변해주세요.');
  });

  it('should validate empty arrays', () => {
    const answers = {};
    const questionIds: string[] = [];

    const result = validateAllQuestionsAnswered(answers, questionIds);
    expect(result.isValid).toBe(true);
  });
});
