/**
 * Tests for EmailVerificationForm component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EmailVerificationForm from './EmailVerificationForm';

describe('EmailVerificationForm', () => {
  it('should render email input field', () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    expect(emailInput).toBeInTheDocument();
  });

  it('should render submit button', () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('should disable submit button when email is empty', () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when email is entered', () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('should show validation error for invalid email', async () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.submit(submitButton.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('유효하지 않은 이메일 주소입니다.')).toBeInTheDocument();
    });
    
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with valid email', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should trim email before submitting', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    
    fireEvent.change(emailInput, { target: { value: '  test@example.com  ' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('should show loading state during submission', async () => {
    const onSubmit = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(<EmailVerificationForm onSubmit={onSubmit} isLoading={true} />);
    
    expect(screen.getByText('전송 중...')).toBeInTheDocument();
  });

  it('should disable form during loading', () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} isLoading={true} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button');
    
    expect(emailInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('should clear validation error when user types', async () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    
    // Trigger validation error
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.submit(submitButton.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('유효하지 않은 이메일 주소입니다.')).toBeInTheDocument();
    });
    
    // Type again to clear error
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    await waitFor(() => {
      expect(screen.queryByText('유효하지 않은 이메일 주소입니다.')).not.toBeInTheDocument();
    });
  });

  it('should show submit error when onSubmit rejects', async () => {
    const onSubmit = vi.fn().mockRejectedValue({ message: '서버 오류' });
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('서버 오류')).toBeInTheDocument();
    });
  });

  it('should show success message when showSuccessMessage is true', () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} showSuccessMessage={true} />);
    
    expect(screen.getByText('인증 이메일이 전송되었습니다. 이메일을 확인해주세요.')).toBeInTheDocument();
  });

  it('should show custom success message', () => {
    const onSubmit = vi.fn();
    const customMessage = '이메일이 성공적으로 전송되었습니다!';
    render(
      <EmailVerificationForm
        onSubmit={onSubmit}
        showSuccessMessage={true}
        successMessage={customMessage}
      />
    );
    
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('should not show success message by default', () => {
    const onSubmit = vi.fn();
    render(<EmailVerificationForm onSubmit={onSubmit} />);
    
    expect(screen.queryByText('인증 이메일이 전송되었습니다. 이메일을 확인해주세요.')).not.toBeInTheDocument();
  });
});
