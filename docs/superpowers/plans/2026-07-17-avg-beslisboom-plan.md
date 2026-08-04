# AVG Decision Tree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an embeddable, interactive AVG/GDPR decision tree React component bundled into `dist/bundle.js` + `dist/bundle.css`.

**Architecture:** A single React app mounts to `<div id="avg-beslisboom">`. State (current node + history) lives in `DecisionTree.jsx`. All tree content is in `src/tree.json` — adding a branch is adding JSON, no code change needed. esbuild handles JS bundling, Tailwind CLI v4 handles CSS.

**Tech Stack:** React 18, Tailwind CSS v4, esbuild, Vitest + @testing-library/react (tests), jsdom

---

## File Map

| File | Responsibility |
|------|---------------|
| `package.json` | Dependencies and build/test scripts |
| `build.js` | esbuild config — bundles `src/index.jsx` → `dist/bundle.js` |
| `vitest.config.js` | Vitest config with jsdom + React plugin |
| `tests/setup.js` | Import @testing-library/jest-dom matchers |
| `src/index.css` | Tailwind entry: `@import "tailwindcss"` + fade animation |
| `src/index.jsx` | React entry point — mounts `<DecisionTree>` to `#avg-beslisboom` |
| `src/tree.json` | All decision tree nodes (questions, info, outcomes) |
| `src/components/DecisionTree.jsx` | Root state: currentNodeId + history stack, navigation logic |
| `src/components/QuestionNode.jsx` | Renders question text + styled answer buttons |
| `src/components/InfoNode.jsx` | Renders info text + Continue button |
| `src/components/OutcomeNode.jsx` | Renders terminal result card (success/neutral/stop variants) |
| `src/components/Breadcrumb.jsx` | Path trail, each step clickable to navigate back |
| `tests/DecisionTree.test.jsx` | Navigation, back, reset logic tests |

---

## Task 1: Project scaffold

**Files:**
- Create: `package.json`
- Create: `build.js`
- Create: `vitest.config.js`
- Create: `tests/setup.js`
- Create: `src/index.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "avg-beslisboom",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "node build.js && npx tailwindcss -i src/index.css -o dist/bundle.css --minify",
    "dev:js": "node build.js --watch",
    "dev:css": "npx tailwindcss -i src/index.css -o dist/bundle.css --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@tailwindcss/cli": "^4.0.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.5.2",
    "@vitejs/plugin-react": "^4.3.4",
    "esbuild": "^0.25.0",
    "jsdom": "^25.0.1",
    "tailwindcss": "^4.0.0",
    "vitest": "^2.1.9"
  }
}
```

- [ ] **Step 2: Create build.js**

```js
import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');

const ctx = await esbuild.context({
  entryPoints: ['src/index.jsx'],
  bundle: true,
  outfile: 'dist/bundle.js',
  minify: !watch,
  jsx: 'automatic',
});

if (watch) {
  await ctx.watch();
  console.log('Watching...');
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Built dist/bundle.js');
}
```

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
  },
});
```

- [ ] **Step 4: Create tests/setup.js**

```js
import '@testing-library/jest-dom';
```

- [ ] **Step 5: Create src/index.css**

```css
@import "tailwindcss";

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@utility animate-fade-in {
  animation: fade-in 0.2s ease-out;
}
```

- [ ] **Step 6: Create dist/ directory and install deps**

```bash
mkdir -p dist
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 7: Commit**

```bash
git init
git add package.json build.js vitest.config.js tests/setup.js src/index.css
git commit -m "feat: project scaffold — esbuild + tailwind + vitest"
```

---

## Task 2: Tree data

**Files:**
- Create: `src/tree.json`

- [ ] **Step 1: Create src/tree.json**

```json
{
  "startId": "start",
  "nodes": {
    "start": {
      "type": "question",
      "text": "Does the research involve personal data?",
      "answers": [
        { "label": "Yes", "next": "identifiable" },
        { "label": "No",  "next": "no-action" }
      ]
    },
    "identifiable": {
      "type": "question",
      "text": "Is the data directly identifiable (name, email, BSN)?",
      "answers": [
        { "label": "Yes",            "next": "sensitive-check" },
        { "label": "No, anonymised", "next": "no-action" },
        { "label": "Pseudonymised",  "next": "phase-1" }
      ]
    },
    "sensitive-check": {
      "type": "question",
      "text": "Does it include sensitive data (health, religion, ethnicity)?",
      "answers": [
        { "label": "Yes", "next": "phase-2" },
        { "label": "No",  "next": "phase-1" }
      ]
    },
    "phase-1": {
      "type": "info",
      "text": "Phase 1 applies. Complete the standard data processing checklist.",
      "next": "manage-docs"
    },
    "phase-2": {
      "type": "info",
      "text": "Phase 2 applies. A DPIA is required before processing.",
      "next": "manage-docs"
    },
    "manage-docs": {
      "type": "question",
      "text": "Have you created an information sheet for participants?",
      "answers": [
        { "label": "Yes", "next": "go" },
        { "label": "No",  "next": "create-docs" }
      ]
    },
    "create-docs": {
      "type": "info",
      "text": "Create an information sheet and consent form using the standard template.",
      "next": "go"
    },
    "go": {
      "type": "outcome",
      "text": "GO — all requirements met. You may proceed.",
      "variant": "success"
    },
    "no-action": {
      "type": "outcome",
      "text": "No AVG action required.",
      "variant": "neutral"
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/tree.json
git commit -m "feat: add AVG decision tree data"
```

---

## Task 3: DecisionTree component (TDD)

**Files:**
- Create: `tests/DecisionTree.test.jsx`
- Create: `src/components/DecisionTree.jsx`

- [ ] **Step 1: Write the failing tests**

Create `tests/DecisionTree.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DecisionTree from '../src/components/DecisionTree';

describe('DecisionTree', () => {
  it('renders the start question on mount', () => {
    render(<DecisionTree />);
    expect(screen.getByText('Does the research involve personal data?')).toBeInTheDocument();
  });

  it('navigates to next node when an answer is clicked', async () => {
    render(<DecisionTree />);
    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(
      screen.getByText('Is the data directly identifiable (name, email, BSN)?')
    ).toBeInTheDocument();
  });

  it('adds the previous question to the breadcrumb after navigating', async () => {
    render(<DecisionTree />);
    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    expect(
      screen.getByRole('button', { name: /Does the research involve personal data/ })
    ).toBeInTheDocument();
  });

  it('navigates back when a breadcrumb item is clicked', async () => {
    render(<DecisionTree />);
    await userEvent.click(screen.getByRole('button', { name: 'Yes' }));
    await userEvent.click(
      screen.getByRole('button', { name: /Does the research involve personal data/ })
    );
    expect(screen.getByText('Does the research involve personal data?')).toBeInTheDocument();
  });

  it('resets to the start question when Start over is clicked on an outcome', async () => {
    render(<DecisionTree />);
    await userEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(screen.getByText('No AVG action required.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByText('Does the research involve personal data?')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests — expect them to fail**

```bash
npm test
```

Expected: FAIL — `Cannot find module '../src/components/DecisionTree'`

- [ ] **Step 3: Create src/components/DecisionTree.jsx**

```jsx
import { useState } from 'react';
import treeData from '../tree.json';
import QuestionNode from './QuestionNode';
import InfoNode from './InfoNode';
import OutcomeNode from './OutcomeNode';
import Breadcrumb from './Breadcrumb';

export default function DecisionTree() {
  const [currentId, setCurrentId] = useState(treeData.startId);
  const [history, setHistory] = useState([]);

  const node = treeData.nodes[currentId];

  function navigate(nextId) {
    setHistory(prev => [...prev, currentId]);
    setCurrentId(nextId);
  }

  function goBack(index) {
    setCurrentId(history[index]);
    setHistory(prev => prev.slice(0, index));
  }

  function reset() {
    setCurrentId(treeData.startId);
    setHistory([]);
  }

  const breadcrumbItems = history.map(id => ({
    id,
    text: treeData.nodes[id].text,
  }));

  return (
    <div className="max-w-2xl mx-auto p-6 font-sans">
      <Breadcrumb items={breadcrumbItems} onNavigate={goBack} />
      <div key={currentId} className="animate-fade-in">
        {node.type === 'question' && (
          <QuestionNode node={node} onAnswer={navigate} />
        )}
        {node.type === 'info' && (
          <InfoNode node={node} onContinue={() => navigate(node.next)} />
        )}
        {node.type === 'outcome' && (
          <OutcomeNode node={node} onReset={reset} />
        )}
      </div>
    </div>
  );
}
```

Also create stub files so the import chain resolves:

`src/components/QuestionNode.jsx`:
```jsx
export default function QuestionNode({ node, onAnswer }) {
  return (
    <div>
      <p>{node.text}</p>
      {node.answers.map(a => (
        <button key={a.label} onClick={() => onAnswer(a.next)}>{a.label}</button>
      ))}
    </div>
  );
}
```

`src/components/InfoNode.jsx`:
```jsx
export default function InfoNode({ node, onContinue }) {
  return (
    <div>
      <p>{node.text}</p>
      <button onClick={onContinue}>Continue</button>
    </div>
  );
}
```

`src/components/OutcomeNode.jsx`:
```jsx
export default function OutcomeNode({ node, onReset }) {
  return (
    <div>
      <p>{node.text}</p>
      <button onClick={onReset}>Start over</button>
    </div>
  );
}
```

`src/components/Breadcrumb.jsx`:
```jsx
export default function Breadcrumb({ items, onNavigate }) {
  return (
    <nav>
      {items.map((item, index) => (
        <button key={item.id} onClick={() => onNavigate(index)}>{item.text}</button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run tests — expect them to pass**

```bash
npm test
```

Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add tests/DecisionTree.test.jsx src/components/DecisionTree.jsx src/components/QuestionNode.jsx src/components/InfoNode.jsx src/components/OutcomeNode.jsx src/components/Breadcrumb.jsx
git commit -m "feat: DecisionTree state and navigation (TDD)"
```

---

## Task 4: Style QuestionNode

**Files:**
- Modify: `src/components/QuestionNode.jsx`

- [ ] **Step 1: Replace QuestionNode with styled version**

```jsx
export default function QuestionNode({ node, onAnswer }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{node.text}</h2>
      <div className="flex flex-col gap-3">
        {node.answers.map(answer => (
          <button
            key={answer.label}
            onClick={() => onAnswer(answer.next)}
            className="w-full text-left px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 transition-all duration-150 cursor-pointer"
          >
            {answer.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: 5 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/QuestionNode.jsx
git commit -m "feat: style QuestionNode with Tailwind"
```

---

## Task 5: Style InfoNode

**Files:**
- Modify: `src/components/InfoNode.jsx`

- [ ] **Step 1: Replace InfoNode with styled version**

```jsx
export default function InfoNode({ node, onContinue }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8">
      <p className="text-gray-700 text-lg leading-relaxed mb-6">{node.text}</p>
      <button
        onClick={onContinue}
        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors duration-150 cursor-pointer"
      >
        Continue
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: 5 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/InfoNode.jsx
git commit -m "feat: style InfoNode with Tailwind"
```

---

## Task 6: Style OutcomeNode

**Files:**
- Modify: `src/components/OutcomeNode.jsx`

- [ ] **Step 1: Replace OutcomeNode with styled version**

```jsx
const variants = {
  success: {
    wrapper: 'bg-green-50 border-2 border-green-400 rounded-2xl shadow-md p-8',
    text: 'text-green-800',
  },
  neutral: {
    wrapper: 'bg-gray-50 border-2 border-gray-300 rounded-2xl shadow-md p-8',
    text: 'text-gray-700',
  },
  stop: {
    wrapper: 'bg-red-50 border-2 border-red-400 rounded-2xl shadow-md p-8',
    text: 'text-red-800',
  },
};

export default function OutcomeNode({ node, onReset }) {
  const style = variants[node.variant] ?? variants.neutral;
  return (
    <div className={style.wrapper}>
      <p className={`text-lg font-semibold mb-6 ${style.text}`}>{node.text}</p>
      <button
        onClick={onReset}
        className="px-5 py-2 rounded-xl border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition-colors duration-150 text-sm font-medium cursor-pointer"
      >
        Start over
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: 5 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/OutcomeNode.jsx
git commit -m "feat: style OutcomeNode with Tailwind (success/neutral/stop variants)"
```

---

## Task 7: Style Breadcrumb

**Files:**
- Modify: `src/components/Breadcrumb.jsx`

- [ ] **Step 1: Replace Breadcrumb with styled version**

```jsx
export default function Breadcrumb({ items, onNavigate }) {
  if (items.length === 0) return null;
  return (
    <nav className="flex flex-wrap gap-1 items-center mb-6 text-sm text-gray-500">
      {items.map((item, index) => (
        <span key={item.id} className="flex items-center gap-1">
          {index > 0 && <span className="text-gray-300 select-none">›</span>}
          <button
            onClick={() => onNavigate(index)}
            title={item.text}
            className="hover:text-blue-600 hover:underline transition-colors duration-100 max-w-[200px] truncate cursor-pointer"
          >
            {item.text.length > 45 ? item.text.slice(0, 45) + '…' : item.text}
          </button>
        </span>
      ))}
    </nav>
  );
}
```

- [ ] **Step 2: Run tests to confirm nothing broke**

```bash
npm test
```

Expected: 5 tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/components/Breadcrumb.jsx
git commit -m "feat: style Breadcrumb with Tailwind"
```

---

## Task 8: Entry point

**Files:**
- Create: `src/index.jsx`

- [ ] **Step 1: Create src/index.jsx**

```jsx
import { createRoot } from 'react-dom/client';
import DecisionTree from './components/DecisionTree';

const container = document.getElementById('avg-beslisboom');
if (container) {
  createRoot(container).render(<DecisionTree />);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.jsx
git commit -m "feat: React entry point — mounts to #avg-beslisboom"
```

---

## Task 9: Build and verify

**Files:**
- Output: `dist/bundle.js`, `dist/bundle.css`

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Expected output:
```
Built dist/bundle.js
```
Both `dist/bundle.js` and `dist/bundle.css` should exist and be non-empty.

- [ ] **Step 2: Create a local test page**

Create `dist/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AVG Beslisboom</title>
  <link rel="stylesheet" href="bundle.css">
</head>
<body class="bg-gray-100 min-h-screen py-12">
  <div id="avg-beslisboom"></div>
  <script src="bundle.js"></script>
</body>
</html>
```

- [ ] **Step 3: Open the test page in a browser**

```bash
npx serve dist
```

Open `http://localhost:3000`. Verify:
- Start question renders
- Clicking Yes/No navigates to next node
- Breadcrumb appears and clicking it goes back
- Info nodes show Continue button
- Outcome nodes show coloured card + Start over button

- [ ] **Step 4: Commit**

```bash
git add dist/index.html
git commit -m "feat: build output and local test page"
```

---

## Handoff

The recipient receives:
- `dist/bundle.js`
- `dist/bundle.css`

They embed with:
```html
<div id="avg-beslisboom"></div>
<link rel="stylesheet" href="bundle.css">
<script src="bundle.js"></script>
```

To update the tree content: edit `src/tree.json` and run `npm run build`.
