/**
 * Centralized error messages in Korean
 * Maps error codes to user-friendly Korean messages
 */

export const errorMessages: Record<string, string> = {
  // Validation errors
  VALIDATION_ERROR: '입력 데이터가 올바르지 않습니다.',
  INVALID_EMAIL: '유효하지 않은 이메일 주소입니다.',
  INCOMPLETE_ANSWERS: '모든 질문에 답변해주세요.',
  REQUIRED_FIELD: '필수 항목입니다.',

  // Authentication errors
  TOKEN_EXPIRED: '인증 링크가 만료되었습니다. 다시 시도해주세요.',
  TOKEN_INVALID: '유효하지 않은 인증 링크입니다.',
  UNAUTHORIZED: '인증이 필요합니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',

  // Network errors
  NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다. 다시 시도해주세요.',

  // Server errors
  DATABASE_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  EMAIL_SEND_FAILED: '이메일 전송에 실패했습니다. 다시 시도해주세요.',
  INTERNAL_ERROR: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',

  // Test-specific errors
  QUESTIONS_LOAD_FAILED: '질문을 불러오는데 실패했습니다. 다시 시도해주세요.',
  TEST_SUBMIT_FAILED: '테스트 제출에 실패했습니다. 다시 시도해주세요.',
  RESULT_LOAD_FAILED: '결과를 불러오는데 실패했습니다. 다시 시도해주세요.',

  // Generic fallback
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
};

/**
 * Gets a user-friendly error message for an error code
 * @param code - Error code from API or internal error
 * @returns Korean error message
 */
export function getErrorMessage(code: string): string {
  return errorMessages[code] || errorMessages.UNKNOWN_ERROR;
}

/**
 * Extracts error message from various error formats
 * @param error - Error object from API or caught exception
 * @returns Korean error message
 */
export function extractErrorMessage(error: any): string {
  // If error has a message property (from API)
  if (error?.message && typeof error.message === 'string') {
    return error.message;
  }

  // If error has a code property
  if (error?.code && typeof error.code === 'string') {
    return getErrorMessage(error.code);
  }

  // If error is a string
  if (typeof error === 'string') {
    return error;
  }

  // Fallback
  return errorMessages.UNKNOWN_ERROR;
}
