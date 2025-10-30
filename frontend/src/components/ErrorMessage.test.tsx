/**
 * Tests for ErrorMessage component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';

describe('ErrorMessage', () => {
  it('should render error message', () => {
    render(<ErrorMessage message="테스트 오류 메시지" />);
    expect(screen.getByText('테스트 오류 메시지')).toBeInTheDocument();
  });

  it('should render warning icon', () => {
    render(<ErrorMessage message="오류" />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('should not render when message is empty', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container.firstChild).toBeNull();
  });

  it('should render dismiss button when onDismiss is provided', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="오류" onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText('오류 메시지 닫기');
    expect(dismissButton).toBeInTheDocument();
  });

  it('should call onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="오류" onDismiss={onDismiss} />);
    
    const dismissButton = screen.getByLabelText('오류 메시지 닫기');
    fireEvent.click(dismissButton);
    
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('should not render dismiss button when onDismiss is not provided', () => {
    render(<ErrorMessage message="오류" />);
    
    const dismissButton = screen.queryByLabelText('오류 메시지 닫기');
    expect(dismissButton).not.toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(<ErrorMessage message="오류" />);
    const errorDiv = container.querySelector('.bg-halloween-blood\\/20');
    expect(errorDiv).toBeInTheDocument();
  });
});
