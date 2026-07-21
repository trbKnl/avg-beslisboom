import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import TreeNode from '../../src/components/TreeNode';

const questionNode = {
  type: 'question',
  text: 'Does the research involve personal data?',
  answers: [
    { label: 'Yes', next: 'a' },
    { label: 'No', next: 'b' },
  ],
};

const infoNode = {
  type: 'info',
  text: 'Phase 1 applies. Complete the standard data processing checklist.',
  next: 'manage-docs',
};

const outcomeNode = {
  type: 'outcome',
  text: 'GO — all requirements met. You may proceed.',
  variant: 'success',
};

describe('TreeNode — active question', () => {
  it('renders question text and answer buttons', () => {
    render(
      <TreeNode node={questionNode} state="active" onAnswer={() => {}} />
    );
    expect(screen.getByText('Does the research involve personal data?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No' })).toBeInTheDocument();
  });

  it('calls onAnswer with the next id when a button is clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(
      <TreeNode node={questionNode} state="active" onAnswer={onAnswer} />
    );
    await user.click(screen.getByRole('button', { name: 'Yes' }));
    expect(onAnswer).toHaveBeenCalledWith('a', 'Yes');
  });
});

describe('TreeNode — completed question', () => {
  it('shows the chosen answer as a pill and hides buttons', () => {
    render(
      <TreeNode
        node={questionNode}
        state="completed"
        chosenAnswer="Yes"
        onRewind={() => {}}
      />
    );
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'No' })).not.toBeInTheDocument();
  });

  it('calls onRewind when clicked', async () => {
    const user = userEvent.setup();
    const onRewind = vi.fn();
    render(
      <TreeNode
        node={questionNode}
        state="completed"
        chosenAnswer="Yes"
        onRewind={onRewind}
      />
    );
    await user.click(screen.getByText('Does the research involve personal data?'));
    expect(onRewind).toHaveBeenCalled();
  });
});

describe('TreeNode — active info', () => {
  it('renders info text and a Continue button', () => {
    render(
      <TreeNode node={infoNode} state="active" onAnswer={() => {}} />
    );
    expect(screen.getByText(/Phase 1 applies/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
  });

  it('calls onAnswer with next id when Continue is clicked', async () => {
    const user = userEvent.setup();
    const onAnswer = vi.fn();
    render(
      <TreeNode node={infoNode} state="active" onAnswer={onAnswer} />
    );
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onAnswer).toHaveBeenCalledWith('manage-docs', 'Continue');
  });
});

describe('TreeNode — outcome', () => {
  it('renders outcome text and Start over button', () => {
    render(
      <TreeNode node={outcomeNode} state="active" onReset={() => {}} />
    );
    expect(screen.getByText(/GO — all requirements met/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start over/ })).toBeInTheDocument();
  });

  it('calls onReset when Start over is clicked', async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(
      <TreeNode node={outcomeNode} state="active" onReset={onReset} />
    );
    await user.click(screen.getByRole('button', { name: /Start over/ }));
    expect(onReset).toHaveBeenCalled();
  });
});
