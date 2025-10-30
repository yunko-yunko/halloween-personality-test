/**
 * EmailEntryPage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmailEntryPage from './EmailEntryPage';
import { authService } from '../services';

// Mock the authService
vi.mock('../services', () => ({
  authService: {
    sendVerification: vi.fn(),
  },
}));

describe('EmailEntryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the email entry page with title and form', () => {
    render(<EmailEntryPage />);

    expect(screen.getByText('이메일 인증')).toBeInTheDocument();
    expect(screen.getByText('테스트 결과를 저장하고 나중에 확인하세요')).toBeInTheDocument();
    expect(screen.getByLabelText('이메일 주소')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /인증 이메일 받기/i })).toBeInTheDocument();
  });

  it('displays additional info text before submission', () => {
    render(<EmailEntryPage />);

    expect(
      screen.getByText('이메일로 전송된 인증 링크를 클릭하면 테스트를 시작할 수 있습니다.')
    ).toBeInTheDocument();
  });

  it('calls authService.sendVerification when form is submitted with valid email', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.sendVerification).mockResolvedValue({
      message: 'Success',
      success: true,
    });

    render(<EmailEntryPage />);

    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(authService.sendVerification).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('displays success message after successful email submission', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.sendVerification).mockResolvedValue({
      message: 'Success',
      success: true,
    });

    render(<EmailEntryPage />);

    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('인증 이메일이 전송되었습니다. 이메일을 확인해주세요.')
      ).toBeInTheDocument();
    });
  });

  it('displays spam folder hint after successful submission', async () => {
    const user = userEvent.setup();
    vi.mocked(authService.sendVerification).mockResolvedValue({
      message: 'Success',
      success: true,
    });

    render(<EmailEntryPage />);

    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('이메일이 도착하지 않았나요? 스팸 폴더를 확인해주세요.')
      ).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(authService.sendVerification).mockReturnValue(promise as any);

    render(<EmailEntryPage />);

    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    // Should show loading state
    expect(screen.getByText('전송 중...')).toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({ message: 'Success', success: true });

    await waitFor(() => {
      expect(screen.queryByText('전송 중...')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    const errorMessage = '이메일 전송에 실패했습니다. 다시 시도해주세요.';
    vi.mocked(authService.sendVerification).mockRejectedValue({
      message: errorMessage,
    });

    render(<EmailEntryPage />);

    const emailInput = screen.getByLabelText('이메일 주소');
    const submitButton = screen.getByRole('button', { name: /인증 이메일 받기/i });

    await user.type(emailInput, 'test@example.com');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('is fully responsive with proper styling', () => {
    const { container } = render(<EmailEntryPage />);

    // Check for responsive classes
    const mainContainer = container.querySelector('.min-h-screen');
    expect(mainContainer).toBeInTheDocument();
    expect(mainContainer).toHaveClass('px-4', 'py-8');

    // Check for responsive title
    const title = screen.getByText('이메일 인증');
    expect(title).toHaveClass('text-5xl', 'md:text-7xl');

    // Check for responsive subtitle
    const subtitle = screen.getByText('테스트 결과를 저장하고 나중에 확인하세요');
    expect(subtitle).toHaveClass('text-lg', 'md:text-xl');
  });

  it('displays expiration info at the bottom', () => {
    render(<EmailEntryPage />);

    expect(screen.getByText('인증 링크는 24시간 동안 유효합니다')).toBeInTheDocument();
  });
});
