/**
 * ErrorBoundary Component
 * Catches React errors and displays a fallback UI
 */

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-halloween-dark/80 backdrop-blur-sm border-2 border-halloween-blood/50 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">💀</div>
            <h1 className="font-spooky text-3xl text-halloween-orange mb-4">
              오류 발생!
            </h1>
            <p className="font-korean text-lg text-gray-300 mb-6">
              예상치 못한 오류가 발생했습니다.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <div className="bg-halloween-darker/50 rounded p-4 mb-6 text-left">
                <p className="font-mono text-xs text-halloween-blood break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="px-6 py-3 bg-halloween-orange text-halloween-darker font-korean font-bold rounded-lg hover:bg-halloween-blood transition-colors"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
