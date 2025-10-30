/**
 * EmailEntryPage Component
 * Page for email verification entry (advanced mode only)
 */

import { useState } from 'react';
import { authService } from '../services';
import EmailVerificationForm from '../components/EmailVerificationForm';

export default function EmailEntryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (email: string) => {
    setIsLoading(true);
    setShowSuccess(false);

    try {
      await authService.sendVerification(email);
      setShowSuccess(true);
    } catch (error: any) {
      // Error is already handled by EmailVerificationForm
      throw error;
    } finally {
      setIsLoading(false);
    }
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
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="font-spooky text-5xl md:text-7xl text-halloween-orange mb-4 animate-pulse drop-shadow-[0_0_20px_rgba(255,107,53,0.5)]">
            이메일 인증
          </h1>
          <p className="font-korean text-lg md:text-xl text-halloween-purple drop-shadow-[0_0_10px_rgba(106,13,173,0.5)]">
            테스트 결과를 저장하고 나중에 확인하세요
          </p>
        </div>

        {/* Form container */}
        <div className="bg-halloween-dark/80 backdrop-blur-sm border-2 border-halloween-orange/30 rounded-lg p-8 md:p-12 shadow-2xl">
          <div className="flex flex-col items-center">
            <EmailVerificationForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              showSuccessMessage={showSuccess}
              successMessage="인증 이메일이 전송되었습니다. 이메일을 확인해주세요."
            />

            {/* Additional info */}
            {!showSuccess && (
              <div className="mt-6 text-center">
                <p className="font-korean text-sm text-gray-400">
                  이메일로 전송된 인증 링크를 클릭하면 테스트를 시작할 수 있습니다.
                </p>
              </div>
            )}

            {showSuccess && (
              <div className="mt-6 text-center">
                <p className="font-korean text-sm text-gray-400">
                  이메일이 도착하지 않았나요? 스팸 폴더를 확인해주세요.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Decorative info */}
        <div className="mt-8 text-center">
          <p className="font-korean text-xs text-gray-500">
            인증 링크는 24시간 동안 유효합니다
          </p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-halloween-darker to-transparent"></div>
    </div>
  );
}
