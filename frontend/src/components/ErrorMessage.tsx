/**
 * ErrorMessage Component
 * Displays error messages with Halloween theme styling
 */

interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export default function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <div className="bg-halloween-blood/20 border-2 border-halloween-blood rounded-lg p-4 text-center animate-shake">
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">⚠️</span>
        <p className="font-korean text-halloween-blood flex-1">{message}</p>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-halloween-blood hover:text-halloween-orange transition-colors"
            aria-label="오류 메시지 닫기"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
