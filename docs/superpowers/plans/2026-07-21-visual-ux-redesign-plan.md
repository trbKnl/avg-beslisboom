# Visual UX Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the AVG decision tree from a plain questionnaire into an interactive, progressively-revealed flowchart where the tree IS the interface, styled to match datadonation.eu.

**Architecture:** Custom CSS/SVG tree with no graph library. Flexbox positions cards vertically, SVG `<path>` elements draw animated connectors between them. React manages state (current node, history with chosen answers, animation phases), CSS handles transitions and keyframe animations. The old single-file `DecisionTree.jsx` is replaced by a component hierarchy: `DecisionTree` (root state + SVG overlay), `TreeNode` (card rendering for all node types), `Connector` (animated SVG path), `AnswerPill` (chosen answer tag).

**Tech Stack:** React 18, Tailwind CSS v4, Vite, Vitest + Testing Library

---

## File Structure

```
src/
  index.jsx                    # Mount point (unchanged)
  index.css                    # Tailwind + Google Fonts import + custom animations
  tree.json                    # Decision tree data (unchanged)
  DecisionTree.jsx             # DELETE old file
  components/
    DecisionTree.jsx           # Root: state, history, SVG overlay, scroll behavior
    TreeNode.jsx               # Single node card — question/info/outcome, active/completed states
    Connector.jsx              # SVG curved path between two nodes, draw animation
    AnswerPill.jsx             # Small pill showing chosen answer on completed cards
tests/
  setup.js                     # Existing (unchanged)
  components/
    DecisionTree.test.jsx      # Integration tests for tree navigation
    TreeNode.test.jsx          # Unit tests for node rendering states
    AnswerPill.test.jsx        # Unit tests for pill rendering
```

---

### Task 1: CSS Foundation — Fonts, Colors, Animations

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Write the new CSS file**

Replace `src/index.css` with:

```css
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800&family=Nunito+Sans:wght@400;600&display=swap');

/* ---- Custom properties ---- */
@layer base {
  :root {
    --color-primary: #4272EF;
    --color-primary-hover: #3461d4;
    --color-accent-red: #FF5E5E;
    --color-accent-gold: #E8B53C;
    --color-text-dark: #252A34;
    --color-text-body: #333333;
    --color-text-muted: #6A6A6A;
    --color-bg-muted: #F5F7FB;
    --color-bg-info: #FDF4DF;
    --color-bg-success: #EEF3FE;
    --color-bg-stop: #FFEFEF;
    --color-border: #E6E6E6;
    --color-border-subtle: rgba(37, 42, 52, 0.1);
    --card-radius: 22px;
    --card-shadow: 0 1px 2px rgba(0,0,0,0.04), 0 26px 50px -28px rgba(37,42,52,0.3);
    --font-heading: 'Nunito', sans-serif;
    --font-body: 'Nunito Sans', sans-serif;
  }
}

/* ---- Animations ---- */
@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes draw-connector {
  from { stroke-dashoffset: var(--path-length); }
  to { stroke-dashoffset: 0; }
}

@keyframes travel-dot {
  from { offset-distance: 0%; }
  to { offset-distance: 100%; }
}

@keyframes collapse-up {
  from {
    opacity: 1;
    transform: translateY(0);
    max-height: 500px;
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
    max-height: 0;
  }
}

@utility animate-fade-slide-in {
  animation: fade-slide-in 0.3s ease-out both;
}

@utility animate-fade-out {
  animation: fade-out 0.15s ease-in both;
}

@utility animate-collapse-up {
  animation: collapse-up 0.2s ease-in both;
}
```

- [ ] **Step 2: Verify CSS loads**

Run: `npm run dev`

Open the browser and confirm the page loads without CSS errors. The old DecisionTree will look unstyled (that's fine — we're replacing it). Check the browser console Network tab to confirm the Google Fonts load.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "style: add CSS foundation — fonts, custom properties, animations"
```

---

### Task 2: AnswerPill Component

**Files:**
- Create: `src/components/AnswerPill.jsx`
- Create: `tests/components/AnswerPill.test.jsx`

- [ ] **Step 1: Write the failing test**

Create `tests/components/AnswerPill.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/components/AnswerPill.test.jsx`

Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/AnswerPill.jsx`:

```jsx
export default function AnswerPill({ label }) {
  return (
    <span
      className="inline-block rounded-full px-3 py-1 text-sm text-white"
      style={{
        backgroundColor: 'var(--color-primary)',
        fontFamily: 'var(--font-body)',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/components/AnswerPill.test.jsx`

Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/AnswerPill.jsx tests/components/AnswerPill.test.jsx
git commit -m "feat: add AnswerPill component"
```

---

### Task 3: TreeNode Component

**Files:**
- Create: `src/components/TreeNode.jsx`
- Create: `tests/components/TreeNode.test.jsx`

- [ ] **Step 1: Write the failing tests**

Create `tests/components/TreeNode.test.jsx`:

```jsx
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/components/TreeNode.test.jsx`

Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

Create `src/components/TreeNode.jsx`:

```jsx
import AnswerPill from './AnswerPill';

const cardBase = {
  borderRadius: 'var(--card-radius)',
  fontFamily: 'var(--font-body)',
  padding: '24px',
  width: '100%',
  transition: 'background-color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
};

const activeCardStyle = {
  ...cardBase,
  backgroundColor: '#FFFFFF',
  border: '1px solid var(--color-border-subtle)',
  boxShadow: 'var(--card-shadow)',
};

const completedCardStyle = {
  ...cardBase,
  backgroundColor: 'var(--color-bg-muted)',
  border: '1px solid var(--color-border)',
  boxShadow: 'none',
  cursor: 'pointer',
};

function CheckIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className="absolute top-4 right-4"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="10" fill="#22c55e" />
      <path d="M6 10.5l2.5 2.5 5.5-5.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function TreeNode({
  node,
  state,
  chosenAnswer,
  onAnswer,
  onRewind,
  onReset,
}) {
  if (node.type === 'outcome') {
    return <OutcomeCard node={node} onReset={onReset} />;
  }

  if (state === 'completed') {
    return (
      <CompletedCard
        node={node}
        chosenAnswer={chosenAnswer}
        onRewind={onRewind}
      />
    );
  }

  if (node.type === 'info') {
    return <InfoCard node={node} onAnswer={onAnswer} />;
  }

  return <QuestionCard node={node} onAnswer={onAnswer} />;
}

function QuestionCard({ node, onAnswer }) {
  return (
    <div style={activeCardStyle}>
      <h2
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          fontSize: '1.25rem',
          marginBottom: '16px',
          lineHeight: 1.3,
        }}
      >
        {node.text}
      </h2>
      <div className="flex flex-col gap-2">
        {node.answers.map((answer) => (
          <button
            key={answer.next}
            onClick={() => onAnswer(answer.next, answer.label)}
            className="cursor-pointer text-left transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: '#FFFFFF',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              padding: '12px 16px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '1rem',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-primary-hover)')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-primary)')}
          >
            {answer.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ node, onAnswer }) {
  return (
    <div
      style={{
        ...cardBase,
        backgroundColor: 'var(--color-bg-info)',
        border: 'none',
        borderLeft: '4px solid var(--color-accent-gold)',
      }}
    >
      <p
        style={{
          color: 'var(--color-text-body)',
          fontSize: '1rem',
          lineHeight: 1.6,
          marginBottom: '16px',
        }}
      >
        {node.text}
      </p>
      <button
        onClick={() => onAnswer(node.next, 'Continue')}
        className="cursor-pointer transition-colors"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          padding: '12px 16px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '1rem',
        }}
        onMouseEnter={(e) => (e.target.style.backgroundColor = 'var(--color-primary-hover)')}
        onMouseLeave={(e) => (e.target.style.backgroundColor = 'var(--color-primary)')}
      >
        Continue
      </button>
    </div>
  );
}

function CompletedCard({ node, chosenAnswer, onRewind }) {
  return (
    <div
      style={completedCardStyle}
      onClick={onRewind}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onRewind(); }}
    >
      <div className="relative">
        <CheckIcon />
        <p
          style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            color: 'var(--color-text-muted)',
            fontSize: '1rem',
            lineHeight: 1.3,
            marginBottom: '8px',
            paddingRight: '32px',
          }}
        >
          {node.text}
        </p>
        <AnswerPill label={chosenAnswer} />
      </div>
    </div>
  );
}

function OutcomeCard({ node, onReset }) {
  const variantStyles = {
    success: {
      backgroundColor: 'var(--color-bg-success)',
      borderLeft: '4px solid var(--color-primary)',
    },
    neutral: {
      backgroundColor: 'var(--color-bg-muted)',
      borderLeft: '4px solid var(--color-text-muted)',
    },
    stop: {
      backgroundColor: 'var(--color-bg-stop)',
      borderLeft: '4px solid var(--color-accent-red)',
    },
  };

  return (
    <div style={{ ...cardBase, border: 'none', ...variantStyles[node.variant] }}>
      <p
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          color: 'var(--color-text-dark)',
          fontSize: '1.25rem',
          lineHeight: 1.3,
          marginBottom: '16px',
        }}
      >
        {node.text}
      </p>
      <button
        onClick={onReset}
        className="cursor-pointer transition-colors"
        style={{
          backgroundColor: 'transparent',
          color: 'var(--color-accent-red)',
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          padding: '8px 0',
          border: 'none',
          fontSize: '1rem',
        }}
      >
        ← Start over
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/components/TreeNode.test.jsx`

Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/TreeNode.jsx tests/components/TreeNode.test.jsx
git commit -m "feat: add TreeNode component with all node type variants"
```

---

### Task 4: Connector Component

**Files:**
- Create: `src/components/Connector.jsx`

This component renders an SVG curved path between two vertical positions. It's a presentational component — no test needed beyond integration testing in Task 6, since it's pure SVG math with no logic branches.

- [ ] **Step 1: Write the implementation**

Create `src/components/Connector.jsx`:

```jsx
import { useEffect, useRef } from 'react';

export default function Connector({
  fromY,
  toY,
  containerWidth,
  animate = false,
  chosen = false,
  stub = false,
}) {
  const pathRef = useRef(null);
  const dotRef = useRef(null);

  const midX = containerWidth / 2;
  const stubLength = 20;

  let d;
  if (stub) {
    d = `M ${midX} ${fromY} L ${midX} ${fromY + stubLength}`;
  } else {
    const controlOffset = (toY - fromY) / 3;
    d = `M ${midX} ${fromY} C ${midX} ${fromY + controlOffset}, ${midX} ${toY - controlOffset}, ${midX} ${toY}`;
  }

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    pathRef.current.style.setProperty('--path-length', length);

    if (animate) {
      pathRef.current.style.strokeDasharray = length;
      pathRef.current.style.strokeDashoffset = length;
      pathRef.current.style.animation = `draw-connector 0.4s ease-out forwards`;
    } else {
      pathRef.current.style.strokeDasharray = 'none';
      pathRef.current.style.strokeDashoffset = '0';
      pathRef.current.style.animation = 'none';
    }
  }, [animate, d]);

  return (
    <g>
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke={chosen ? 'var(--color-primary)' : 'var(--color-border)'}
        strokeWidth={2}
        strokeDasharray={stub ? '4 4' : 'none'}
        strokeLinecap="round"
      />
      {animate && !stub && (
        <circle
          ref={dotRef}
          r="3"
          fill="var(--color-primary)"
          style={{
            offsetPath: `path('${d}')`,
            animation: 'travel-dot 0.4s ease-out forwards',
          }}
        />
      )}
    </g>
  );
}
```

- [ ] **Step 2: Verify it renders without errors**

This will be verified in Task 6 when integrated into DecisionTree. For now, confirm the file has no syntax errors:

Run: `npx vite build --mode development 2>&1 | head -5`

Expected: Build starts without import errors (it won't fully build yet since nothing imports Connector, but no syntax errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/Connector.jsx
git commit -m "feat: add Connector SVG component with draw animation"
```

---

### Task 5: DecisionTree Root Component

**Files:**
- Create: `src/components/DecisionTree.jsx`
- Delete: `src/DecisionTree.jsx`
- Modify: `src/index.jsx`

- [ ] **Step 1: Write the implementation**

Create `src/components/DecisionTree.jsx`:

```jsx
import { useState, useRef, useCallback, useEffect } from 'react';
import tree from '../tree.json';
import TreeNode from './TreeNode';
import Connector from './Connector';

export default function DecisionTree() {
  const [currentId, setCurrentId] = useState(tree.startId);
  const [history, setHistory] = useState([]);
  const [animatingNodeId, setAnimatingNodeId] = useState(null);

  const containerRef = useRef(null);
  const nodeRefs = useRef({});

  const registerRef = useCallback((id, el) => {
    if (el) nodeRefs.current[id] = el;
  }, []);

  function handleAnswer(nextId, label) {
    setHistory([...history, { nodeId: currentId, chosenAnswer: label }]);
    setAnimatingNodeId(nextId);
    setCurrentId(nextId);
  }

  function handleRewind(index) {
    setCurrentId(history[index].nodeId);
    setHistory(history.slice(0, index));
    setAnimatingNodeId(null);
  }

  function handleReset() {
    setHistory([]);
    setCurrentId(tree.startId);
    setAnimatingNodeId(null);
  }

  // Auto-scroll to active node after render
  useEffect(() => {
    const activeEl = nodeRefs.current[currentId];
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentId]);

  // Build the visible node list: all history nodes + current node
  const visibleNodes = [
    ...history.map((h) => ({
      id: h.nodeId,
      node: tree.nodes[h.nodeId],
      state: 'completed',
      chosenAnswer: h.chosenAnswer,
    })),
    {
      id: currentId,
      node: tree.nodes[currentId],
      state: 'active',
    },
  ];

  return (
    <div
      ref={containerRef}
      className="relative mx-auto"
      style={{
        maxWidth: '672px',
        padding: '24px 16px',
        fontFamily: 'var(--font-body)',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 800,
          color: 'var(--color-text-dark)',
          fontSize: '1.75rem',
          textAlign: 'center',
          marginBottom: '32px',
        }}
      >
        AVG Beslisboom
      </h1>

      <ConnectorOverlay
        visibleNodes={visibleNodes}
        nodeRefs={nodeRefs}
        containerRef={containerRef}
        animatingNodeId={animatingNodeId}
      />

      <div className="flex flex-col items-center gap-6">
        {visibleNodes.map((entry, index) => (
          <div
            key={entry.id}
            ref={(el) => registerRef(entry.id, el)}
            className={
              entry.state === 'active' && entry.id === animatingNodeId
                ? 'animate-fade-slide-in w-full'
                : 'w-full'
            }
            onAnimationEnd={() => {
              if (entry.id === animatingNodeId) setAnimatingNodeId(null);
            }}
          >
            <TreeNode
              node={entry.node}
              state={entry.state}
              chosenAnswer={entry.chosenAnswer}
              onAnswer={handleAnswer}
              onRewind={() => handleRewind(index)}
              onReset={handleReset}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectorOverlay({ visibleNodes, nodeRefs, containerRef, animatingNodeId }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    // Recalculate connector positions after DOM updates
    const timer = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines = [];

      for (let i = 0; i < visibleNodes.length - 1; i++) {
        const fromId = visibleNodes[i].id;
        const toId = visibleNodes[i + 1].id;
        const fromEl = nodeRefs.current[fromId];
        const toEl = nodeRefs.current[toId];

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          newLines.push({
            key: `${fromId}-${toId}`,
            fromY: fromRect.bottom - containerRect.top,
            toY: toRect.top - containerRect.top,
            chosen: true,
            animate: toId === animatingNodeId,
          });
        }
      }

      setLines(newLines);
    });

    return () => cancelAnimationFrame(timer);
  }, [visibleNodes, animatingNodeId]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {lines.map((line) => (
        <Connector
          key={line.key}
          fromY={line.fromY}
          toY={line.toY}
          containerWidth={containerRef.current?.offsetWidth ?? 672}
          animate={line.animate}
          chosen={line.chosen}
        />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Update the entry point**

Replace `src/index.jsx` with:

```jsx
import { createRoot } from 'react-dom/client';
import DecisionTree from './components/DecisionTree';
import './index.css';

const el = document.getElementById('avg-beslisboom');
if (el) {
  createRoot(el).render(<DecisionTree />);
}
```

- [ ] **Step 3: Delete the old DecisionTree file**

```bash
rm src/DecisionTree.jsx
```

- [ ] **Step 4: Verify it runs in the browser**

Run: `npm run dev`

Open the URL in the browser. Verify:
- The title "AVG Beslisboom" appears centered at top
- The first question card renders with the datadonation.eu styling (rounded, shadow, blue buttons)
- Clicking an answer transitions the card to completed state (muted background, green check, answer pill)
- A new card animates in below with a slide-up fade
- SVG connector lines appear between cards
- Clicking a completed card rewinds the tree
- Reaching an outcome shows the styled card with "← Start over"

- [ ] **Step 5: Commit**

```bash
git add src/components/DecisionTree.jsx src/index.jsx
git rm src/DecisionTree.jsx
git commit -m "feat: add DecisionTree root with connector overlay and progressive reveal"
```

---

### Task 6: Integration Tests

**Files:**
- Create: `tests/components/DecisionTree.test.jsx`

- [ ] **Step 1: Write integration tests**

Create `tests/components/DecisionTree.test.jsx`:

```jsx
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
    expect(screen.getByText('Yes')).toBeInTheDocument();
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
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `npx vitest run tests/components/DecisionTree.test.jsx`

Expected: PASS (5 tests).

- [ ] **Step 3: Run all tests**

Run: `npx vitest run`

Expected: All tests pass (AnswerPill + TreeNode + DecisionTree).

- [ ] **Step 4: Commit**

```bash
git add tests/components/DecisionTree.test.jsx
git commit -m "test: add integration tests for DecisionTree navigation flow"
```

---

### Task 7: Visual Polish & Final Tweaks

**Files:**
- Modify: `src/index.css`
- Modify: `src/components/DecisionTree.jsx`

- [ ] **Step 1: Add connector stub rendering for unchosen branches**

In `src/components/DecisionTree.jsx`, update the `ConnectorOverlay` function. After the main connector loop, add stub connectors for the current active question node's unchosen answer paths. Replace the entire `ConnectorOverlay` function:

```jsx
function ConnectorOverlay({ visibleNodes, nodeRefs, containerRef, animatingNodeId }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines = [];

      // Chosen path connectors
      for (let i = 0; i < visibleNodes.length - 1; i++) {
        const fromId = visibleNodes[i].id;
        const toId = visibleNodes[i + 1].id;
        const fromEl = nodeRefs.current[fromId];
        const toEl = nodeRefs.current[toId];

        if (fromEl && toEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          newLines.push({
            key: `${fromId}-${toId}`,
            fromY: fromRect.bottom - containerRect.top,
            toY: toRect.top - containerRect.top,
            chosen: true,
            animate: toId === animatingNodeId,
            stub: false,
          });
        }
      }

      // Stub connectors for completed question nodes' unchosen answers
      for (const entry of visibleNodes) {
        if (entry.state !== 'completed' || entry.node.type !== 'question') continue;
        const fromEl = nodeRefs.current[entry.id];
        if (!fromEl) continue;
        const fromRect = fromEl.getBoundingClientRect();
        const fromY = fromRect.bottom - containerRect.top;

        const unchosenCount = entry.node.answers.length - 1;
        if (unchosenCount <= 0) continue;

        for (let j = 0; j < unchosenCount; j++) {
          newLines.push({
            key: `${entry.id}-stub-${j}`,
            fromY,
            toY: fromY + 20,
            chosen: false,
            animate: false,
            stub: true,
          });
        }
      }

      setLines(newLines);
    });

    return () => cancelAnimationFrame(timer);
  }, [visibleNodes, animatingNodeId]);

  if (lines.length === 0) return null;

  return (
    <svg
      className="absolute top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      {lines.map((line) => (
        <Connector
          key={line.key}
          fromY={line.fromY}
          toY={line.toY}
          containerWidth={containerRef.current?.offsetWidth ?? 672}
          animate={line.animate}
          chosen={line.chosen}
          stub={line.stub}
        />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2: Add hover transition to completed cards**

In `src/index.css`, add after the existing animation utilities:

```css
@utility hover-lift {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
@utility hover-lift:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(37,42,52,0.12);
}
```

Then in `src/components/TreeNode.jsx`, add the `hover-lift` class to the completed card's outer `<div>`:

Change the `CompletedCard` wrapper `<div>` className from no className to:

```jsx
className="hover-lift"
```

- [ ] **Step 3: Verify visually in the browser**

Run: `npm run dev`

Verify:
- Completed question nodes show short dashed stub lines below them for unchosen branches
- Completed cards have a subtle lift on hover
- The full flow feels smooth: answer → collapse → connector draws → new card slides in

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`

Expected: All tests still pass.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/DecisionTree.jsx src/components/TreeNode.jsx
git commit -m "feat: add connector stubs for unchosen branches and hover lift on completed cards"
```

---

### Task 8: Build Verification

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

Run: `npm run build`

Expected: Build completes without errors. Output in `dist/`.

- [ ] **Step 2: Run all tests one final time**

Run: `npx vitest run`

Expected: All tests pass.

- [ ] **Step 3: Preview the production build**

Run: `npx vite preview`

Open the preview URL and walk through every path in the tree:
1. Start → No → "No AVG action required" → Start over
2. Start → Yes → No, anonymised → "No AVG action required"
3. Start → Yes → Yes → Yes → Phase 2 → Continue → Yes → GO
4. Start → Yes → Yes → No → Phase 1 → Continue → No → Create docs → Continue → GO
5. Start → Yes → Pseudonymised → Phase 1 → Continue → Yes → GO

Verify at each step: cards styled correctly, connectors draw, stubs show, rewind works, start over works.

- [ ] **Step 4: Commit (if any fixes were needed)**

Only if fixes were made in earlier steps. Otherwise skip.
