import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressIndicator from './ProgressIndicator';

describe('ProgressIndicator', () => {
  it('renders current page and total pages', () => {
    const { container } = render(<ProgressIndicator currentPage={1} totalPages={3} />);
    
    // Check the visible counter contains the page numbers
    const counter = container.querySelector('.font-spooky');
    expect(counter).toBeInTheDocument();
    expect(counter?.textContent).toContain('1');
    expect(counter?.textContent).toContain('/');
    expect(counter?.textContent).toContain('3');
  });

  it('displays correct progress percentage for first page', () => {
    render(<ProgressIndicator currentPage={1} totalPages={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '1');
    expect(progressBar).toHaveAttribute('aria-valuemin', '1');
    expect(progressBar).toHaveAttribute('aria-valuemax', '3');
    
    const width = progressBar.style.width;
    expect(parseFloat(width)).toBeCloseTo(33.33, 1);
  });

  it('displays correct progress percentage for middle page', () => {
    render(<ProgressIndicator currentPage={2} totalPages={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '2');
    
    const width = progressBar.style.width;
    expect(parseFloat(width)).toBeCloseTo(66.67, 1);
  });

  it('displays correct progress percentage for last page', () => {
    render(<ProgressIndicator currentPage={3} totalPages={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '3');
    expect(progressBar).toHaveStyle({ width: '100%' });
  });

  it('has accessible label in Korean', () => {
    render(<ProgressIndicator currentPage={2} totalPages={3} />);
    
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-label', '진행률: 2/3 페이지');
  });

  it('renders screen reader text', () => {
    render(<ProgressIndicator currentPage={2} totalPages={3} />);
    
    expect(screen.getByText('2 of 3 pages completed')).toBeInTheDocument();
  });

  it('handles different total page counts', () => {
    const { rerender, container } = render(<ProgressIndicator currentPage={1} totalPages={5} />);
    
    const counter = container.querySelector('.font-spooky');
    expect(counter?.textContent).toContain('1/5');
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar.style.width).toBe('20%');

    rerender(<ProgressIndicator currentPage={3} totalPages={5} />);
    expect(counter?.textContent).toContain('3/5');
    expect(progressBar.style.width).toBe('60%');
  });

  it('applies responsive classes', () => {
    const { container } = render(<ProgressIndicator currentPage={1} totalPages={3} />);
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('max-w-3xl', 'mx-auto', 'px-4', 'sm:px-6', 'lg:px-8');
  });

  it('applies Halloween theme classes', () => {
    const { container } = render(<ProgressIndicator currentPage={1} totalPages={3} />);
    
    // Check for Halloween color classes
    expect(container.querySelector('.text-halloween-orange')).toBeInTheDocument();
    expect(container.querySelector('.text-halloween-purple')).toBeInTheDocument();
    expect(container.querySelector('.border-halloween-purple\\/50')).toBeInTheDocument();
  });
});
