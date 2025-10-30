/**
 * VerifyPage Component
 * Handles email verification token validation and user authentication
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyToken = async () => {
      // Extract token from URL query parameter
      const token = searchParams.get('token');

      if (!token) {
        setError('인증 토큰이 없습니다.');
        setIsVerifying(false);
        return;
      }

      try {
        // Dispatch login async thunk
        const result = await dispatch(login(token)).unwrap();
        console.log(result)

        // Redirect to /test after successful verification
        setTimeout(() => {
          navigate('/test', { replace: true });
        }, 1000);
      } catch (err: any) {
        // Display error message for invalid/expired tokens
        const errorMessage =
          err ||
          '인증에 실패했습니다. 토큰이 유효하지 않거나 만료되었습니다.';
        setError(errorMessage);
        setIsVerifying(false);
      }
    };

    verifyToken();
  }, [searchParams, navigate, dispatch]);

  const handleResend = () => {
    // Navigate back to email entry page to resend verification
    navigate('/auth/email', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-halloween-orange rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-halloween-purple rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-halloween-green rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-2xl w-full">
        <div className="bg-halloween-dark/80 backdrop-blur-sm border-2 border-halloween-orange/30 rounded-lg p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            {/* Show loading spinner during verification */}
            {isVerifying && (
              <>
                <div className="mb-6">
                  <div className="w-16 h-16 border-4 border-halloween-orange border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h2 className="font-spooky text-3xl md:text-4xl text-halloween-orange mb-4 drop-shadow-[0_0_20px_rgba(255,107,53,0.5)]">
                  인증 중...
                </h2>
                <p className="font-korean text-lg text-gray-300">
                  잠시만 기다려주세요
                </p>
              </>
            )}

            {/* Show success message briefly before redirect */}
            {!isVerifying && !error && (
              <>
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-halloween-green"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="font-spooky text-3xl md:text-4xl text-halloween-green mb-4 drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">
                  인증 완료!
                </h2>
                <p className="font-korean text-lg text-gray-300">
                  테스트 페이지로 이동합니다...
                </p>
              </>
            )}

            {/* Display error message for invalid/expired tokens with option to resend */}
            {!isVerifying && error && (
              <>
                <div className="mb-6">
                  <svg
                    className="w-16 h-16 text-halloween-blood"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <h2 className="font-spooky text-3xl md:text-4xl text-halloween-blood mb-4 drop-shadow-[0_0_20px_rgba(139,0,0,0.5)]">
                  인증 실패
                </h2>
                <p className="font-korean text-lg text-gray-300 mb-6">
                  {error}
                </p>
                <button
                  onClick={handleResend}
                  className="font-korean px-8 py-3 bg-halloween-orange hover:bg-halloween-orange/80 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_20px_rgba(255,107,53,0.5)]"
                >
                  다시 인증 이메일 받기
                </button>
                <p className="font-korean text-sm text-gray-500 mt-4">
                  인증 링크는 24시간 동안 유효합니다
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-halloween-darker to-transparent"></div>
    </div>
  );
}
