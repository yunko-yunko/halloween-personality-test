/**
 * EmailVerificationForm Component
 * Form for email input with validation (for advanced mode)
 */

import { useState, type FormEvent } from 'react';
import { validateEmail } from '../utils/validation';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

interface EmailVerificationFormProps {
  onSubmit: (email: string) => Promise<void>;
  isLoading?: boolean;
  showSuccessMessage?: boolean;
  successMessage?: string;
}

export default function EmailVerificationForm({
  onSubmit,
  isLoading = false,
  showSuccessMessage = false,
  successMessage = '인증 이메일이 전송되었습니다. 이메일을 확인해주세요.',
}: EmailVerificationFormProps) {
  const [email, setEmail] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setValidationError(null);
    setSubmitError(null);

    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      setValidationError(validation.error || '유효하지 않은 이메일 주소입니다.');
      return;
    }

    // Submit email
    try {
      await onSubmit(email.trim());
    } catch (error: any) {
      const errorMsg = error?.message || '이메일 전송에 실패했습니다. 다시 시도해주세요.';
      setSubmitError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="mb-6">
        <label
          htmlFor="email"
          className="block font-korean text-lg text-halloween-purple mb-2"
        >
          이메일 주소
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setValidationError(null);
            setSubmitError(null);
          }}
          disabled={isLoading}
          className="w-full px-4 py-3 bg-halloween-dark/80 border-2 border-halloween-orange/30 rounded-lg text-white font-korean focus:outline-none focus:border-halloween-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          placeholder="your@email.com"
          autoComplete="email"
        />
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mb-4">
          <ErrorMessage
            message={validationError}
            onDismiss={() => setValidationError(null)}
          />
        </div>
      )}

      {/* Submit Error */}
      {submitError && (
        <div className="mb-4">
          <ErrorMessage message={submitError} onDismiss={() => setSubmitError(null)} />
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-4 p-4 bg-halloween-green/20 border-2 border-halloween-green rounded-lg">
          <p className="text-halloween-green font-korean text-center">{successMessage}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full px-6 py-4 bg-gradient-to-r from-halloween-orange to-halloween-blood text-halloween-darker font-korean font-bold text-lg rounded-lg hover:shadow-lg hover:shadow-halloween-orange/50 transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <LoadingSpinner size="small" message="" />
            <span>전송 중...</span>
          </div>
        ) : (
          '인증 이메일 받기'
        )}
      </button>
    </form>
  );
}
