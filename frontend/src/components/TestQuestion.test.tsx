import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TestQuestion from './TestQuestion';
import type { Question } from '../types';

describe('TestQuestion', () => {
  const mockQuestion: Question = {
    id: 'ei_1',
    text: '주말에 에너지를 충전하는 방법은?',
    dimension: 'EI',
    answers: [
      {
        id: 'ei_1_a',
        text: '친구들과 만나서 활동적으로 보낸다',
        value: 'E',
      },
      {
        id: 'ei_1_b',
        text: '집에서 혼자 조용히 쉰다',
        value: 'I',
      },
    ],
  };

  const mockOnAnswer = vi.fn();

  beforeEach(() => {
    mockOnAnswer.mockClear();
  });

  it('renders the question text', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer={null}
        onAnswer={mockOnAnswer}
      />
    );

    expect(screen.getByText(mockQuestion.text)).toBeInTheDocument();
  });

  it('renders both answer options', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer={null}
        onAnswer={mockOnAnswer}
      />
    );

    expect(screen.getByText(mockQuestion.answers[0].text)).toBeInTheDocument();
    expect(screen.getByText(mockQuestion.answers[1].text)).toBeInTheDocument();
  });

  it('calls onAnswer when an answer is clicked', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer={null}
        onAnswer={mockOnAnswer}
      />
    );

    const firstAnswerButton = screen.getByText(mockQuestion.answers[0].text);
    fireEvent.click(firstAnswerButton);

    expect(mockOnAnswer).toHaveBeenCalledTimes(1);
    expect(mockOnAnswer).toHaveBeenCalledWith('ei_1_a');
  });

  it('highlights the selected answer', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer="ei_1_a"
        onAnswer={mockOnAnswer}
      />
    );

    const firstAnswerButton = screen.getByText(mockQuestion.answers[0].text).closest('button');
    const secondAnswerButton = screen.getByText(mockQuestion.answers[1].text).closest('button');

    // Selected answer should have specific styling classes
    expect(firstAnswerButton).toHaveClass('bg-halloween-purple');
    expect(firstAnswerButton).toHaveClass('border-halloween-orange');
    
    // Unselected answer should have different styling
    expect(secondAnswerButton).toHaveClass('bg-halloween-dark');
    expect(secondAnswerButton).not.toHaveClass('bg-halloween-purple');
  });

  it('shows checkmark for selected answer', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer="ei_1_b"
        onAnswer={mockOnAnswer}
      />
    );

    const secondAnswerButton = screen.getByText(mockQuestion.answers[1].text).closest('button');
    expect(secondAnswerButton?.textContent).toContain('✓');
  });

  it('does not show checkmark for unselected answers', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer="ei_1_a"
        onAnswer={mockOnAnswer}
      />
    );

    const secondAnswerButton = screen.getByText(mockQuestion.answers[1].text).closest('button');
    expect(secondAnswerButton?.textContent).not.toContain('✓');
  });

  it('allows changing the selected answer', () => {
    const { rerender } = render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer="ei_1_a"
        onAnswer={mockOnAnswer}
      />
    );

    const secondAnswerButton = screen.getByText(mockQuestion.answers[1].text);
    fireEvent.click(secondAnswerButton);

    expect(mockOnAnswer).toHaveBeenCalledWith('ei_1_b');

    // Simulate parent component updating the selectedAnswer prop
    rerender(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer="ei_1_b"
        onAnswer={mockOnAnswer}
      />
    );

    const secondButton = screen.getByText(mockQuestion.answers[1].text).closest('button');
    expect(secondButton).toHaveClass('bg-halloween-purple');
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer="ei_1_a"
        onAnswer={mockOnAnswer}
      />
    );

    const firstAnswerButton = screen.getByText(mockQuestion.answers[0].text).closest('button');
    const secondAnswerButton = screen.getByText(mockQuestion.answers[1].text).closest('button');

    // Check aria-pressed attribute
    expect(firstAnswerButton).toHaveAttribute('aria-pressed', 'true');
    expect(secondAnswerButton).toHaveAttribute('aria-pressed', 'false');

    // Check aria-label
    expect(firstAnswerButton).toHaveAttribute('aria-label');
    expect(secondAnswerButton).toHaveAttribute('aria-label');
  });

  it('renders correctly with no answer selected', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer={null}
        onAnswer={mockOnAnswer}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toHaveAttribute('aria-pressed', 'false');
      expect(button).toHaveClass('bg-halloween-dark');
    });
  });

  it('applies responsive classes for different screen sizes', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer={null}
        onAnswer={mockOnAnswer}
      />
    );

    const questionText = screen.getByText(mockQuestion.text);
    
    // Check for responsive text size classes
    expect(questionText).toHaveClass('text-xl');
    expect(questionText).toHaveClass('sm:text-2xl');
    expect(questionText).toHaveClass('lg:text-3xl');
  });

  it('handles keyboard interaction', () => {
    render(
      <TestQuestion
        question={mockQuestion}
        selectedAnswer={null}
        onAnswer={mockOnAnswer}
      />
    );

    const firstAnswerButton = screen.getByText(mockQuestion.answers[0].text).closest('button');
    
    // Simulate Enter key press
    if (firstAnswerButton) {
      fireEvent.keyDown(firstAnswerButton, { key: 'Enter', code: 'Enter' });
      fireEvent.click(firstAnswerButton);
    }

    expect(mockOnAnswer).toHaveBeenCalledWith('ei_1_a');
  });
});
