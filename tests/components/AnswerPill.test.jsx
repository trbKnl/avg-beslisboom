import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnswerPill from '../../src/components/AnswerPill';

describe('AnswerPill', () => {
  it('renders the label text', () => {
    render(<AnswerPill label="Yes" />);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders as a rounded pill with correct styling classes', () => {
    const { container } = render(<AnswerPill label="No" />);
    const pill = container.firstChild;
    expect(pill).toHaveClass('rounded-full');
  });
});
