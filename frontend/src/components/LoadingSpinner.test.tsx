/**
 * Tests for LoadingSpinner component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('should render with default message', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('로딩 중...')).toBeInTheDocument();
  });

  it('should render with custom message', () => {
    render(<LoadingSpinner message="데이터 불러오는 중..." />);
    expect(screen.getByText('데이터 불러오는 중...')).toBeInTheDocument();
  });

  it('should render without message when empty string provided', () => {
    render(<LoadingSpinner message="" />);
    expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument();
  });

  it('should render spinner with aria-label', () => {
    render(<LoadingSpinner />);
    const spinner = screen.getByLabelText('로딩 중');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply small size classes', () => {
    const { container } = render(<LoadingSpinner size="small" />);
    const spinner = container.querySelector('.h-8.w-8');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply medium size classes', () => {
    const { container } = render(<LoadingSpinner size="medium" />);
    const spinner = container.querySelector('.h-16.w-16');
    expect(spinner).toBeInTheDocument();
  });

  it('should apply large size classes', () => {
    const { container } = render(<LoadingSpinner size="large" />);
    const spinner = container.querySelector('.h-24.w-24');
    expect(spinner).toBeInTheDocument();
  });

  it('should render in fullScreen mode', () => {
    const { container } = render(<LoadingSpinner fullScreen />);
    const fullScreenDiv = container.querySelector('.min-h-screen');
    expect(fullScreenDiv).toBeInTheDocument();
  });

  it('should not render in fullScreen mode by default', () => {
    const { container } = render(<LoadingSpinner />);
    const fullScreenDiv = container.querySelector('.min-h-screen');
    expect(fullScreenDiv).not.toBeInTheDocument();
  });

  it('should have spinning animation', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
