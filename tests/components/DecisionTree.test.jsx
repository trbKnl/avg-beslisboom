import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import DecisionTree from '../../src/components/DecisionTree';

// Mock scrollIntoView (not available in jsdom)
Element.prototype.scrollIntoView = () => {};

describe('DecisionTree — full flow', () => {
  it('renders the start question on mount', () => {
    render(<DecisionTree />);
    expect(screen.getByText('Does the research involve personal data?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('advances to the next question when an answer is clicked', async () => {
    const user = userEvent.setup();
    render(<DecisionTree />);

    await user.click(screen.getByRole('button', { name: 'Yes' }));

    // Previous question should show as completed with chosen answer pill
    expect(screen.getAllByText('Yes').length).toBeGreaterThan(0);
    // Next question should be visible
    expect(screen.getByText('Is the data directly identifiable (name, email, BSN)?')).toBeInTheDocument();
  });

  it('rewinds when a completed card is clicked', async () => {
    const user = userEvent.setup();
    render(<DecisionTree />);

    await user.click(screen.getByRole('button', { name: 'Yes' }));
    // Now click the completed card text to rewind
    await user.click(screen.getByText('Does the research involve personal data?'));

    // Should be back at start with answer buttons visible
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
    // Second question should be gone
    expect(screen.queryByText('Is the data directly identifiable (name, email, BSN)?')).not.toBeInTheDocument();
  });

  it('navigates through info nodes with Continue', async () => {
    const user = userEvent.setup();
    render(<DecisionTree />);

    // Path: Yes → Yes → No → lands on phase-1 (info node)
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    await user.click(screen.getByRole('button', { name: 'No' }));

    expect(screen.getByText(/Phase 1 applies/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Continue' }));

    expect(screen.getByText('Have you created an information sheet for participants?')).toBeInTheDocument();
  });

  it('reaches an outcome and can start over', async () => {
    const user = userEvent.setup();
    render(<DecisionTree />);

    // Path to "no-action" outcome: No
    await user.click(screen.getByRole('button', { name: 'No' }));

    expect(screen.getByText('No AVG action required.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start over/ })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Start over/ }));

    // Back to start
    expect(screen.getByText('Does the research involve personal data?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
  });

  it('shows the title', () => {
    render(<DecisionTree />);
    expect(screen.getByText('AVG Beslisboom')).toBeInTheDocument();
  });
});
