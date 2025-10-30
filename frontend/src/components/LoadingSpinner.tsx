/**
 * LoadingSpinner Component
 * Displays a loading spinner with Halloween theme styling
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  message = '로딩 중...',
  size = 'medium',
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-8 w-8 border-2',
    medium: 'h-16 w-16 border-4',
    large: 'h-24 w-24 border-4',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-xl',
    large: 'text-2xl',
  };

  const spinner = (
    <div className="text-center">
      <div
        className={`inline-block animate-spin rounded-full border-t-halloween-orange border-b-halloween-orange border-l-transparent border-r-transparent ${sizeClasses[size]} mb-4`}
        role="status"
        aria-label="로딩 중"
      ></div>
      {message && (
        <p className={`font-korean text-halloween-purple ${textSizeClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}
