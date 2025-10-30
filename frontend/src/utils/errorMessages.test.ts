/**
 * Tests for error message utilities
 */

import { describe, it, expect } from 'vitest';
import { getErrorMessage, extractErrorMessage, errorMessages } from './errorMessages';

describe('getErrorMessage', () => {
  it('should return correct message for known error codes', () => {
    expect(getErrorMessage('VALIDATION_ERROR')).toBe(errorMessages.VALIDATION_ERROR);
    expect(getErrorMessage('INVALID_EMAIL')).toBe(errorMessages.INVALID_EMAIL);
    expect(getErrorMessage('NETWORK_ERROR')).toBe(errorMessages.NETWORK_ERROR);
  });

  it('should return unknown error message for unknown codes', () => {
    expect(getErrorMessage('UNKNOWN_CODE_12345')).toBe(errorMessages.UNKNOWN_ERROR);
  });
});

describe('extractErrorMessage', () => {
  it('should extract message from error object with message property', () => {
    const error = { message: '테스트 오류 메시지' };
    expect(extractErrorMessage(error)).toBe('테스트 오류 메시지');
  });

  it('should extract message from error object with code property', () => {
    const error = { code: 'NETWORK_ERROR' };
    expect(extractErrorMessage(error)).toBe(errorMessages.NETWORK_ERROR);
  });

  it('should handle string errors', () => {
    const error = '문자열 오류';
    expect(extractErrorMessage(error)).toBe('문자열 오류');
  });

  it('should return unknown error for null/undefined', () => {
    expect(extractErrorMessage(null)).toBe(errorMessages.UNKNOWN_ERROR);
    expect(extractErrorMessage(undefined)).toBe(errorMessages.UNKNOWN_ERROR);
  });

  it('should prioritize message over code', () => {
    const error = {
      message: '커스텀 메시지',
      code: 'NETWORK_ERROR',
    };
    expect(extractErrorMessage(error)).toBe('커스텀 메시지');
  });

  it('should handle objects without message or code', () => {
    const error = { someOtherProperty: 'value' };
    expect(extractErrorMessage(error)).toBe(errorMessages.UNKNOWN_ERROR);
  });
});
