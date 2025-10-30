/**
 * Validation utilities for form inputs
 * Provides validation functions with Korean error messages
 */

/**
 * Email validation regex
 * Validates standard email format
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates email format
 * @param email - Email address to validate
 * @returns Validation result with Korean error message if invalid
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return {
      isValid: false,
      error: '이메일 주소를 입력해주세요.',
    };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return {
      isValid: false,
      error: '유효하지 않은 이메일 주소입니다.',
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates that a value is not empty
 * @param value - Value to validate
 * @param fieldName - Name of the field for error message
 * @returns Validation result with Korean error message if invalid
 */
export function validateRequired(value: string, fieldName: string): ValidationResult {
  if (!value || value.trim() === '') {
    return {
      isValid: false,
      error: `${fieldName}을(를) 입력해주세요.`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Validates that all questions in a set are answered
 * @param answers - Record of question IDs to answer IDs
 * @param questionIds - Array of question IDs that should be answered
 * @returns Validation result with Korean error message if incomplete
 */
export function validateAllQuestionsAnswered(
  answers: Record<string, string>,
  questionIds: string[]
): ValidationResult {
  const unansweredQuestions = questionIds.filter((id) => !answers[id]);

  if (unansweredQuestions.length > 0) {
    return {
      isValid: false,
      error: '모든 질문에 답변해주세요.',
    };
  }

  return {
    isValid: true,
  };
}
