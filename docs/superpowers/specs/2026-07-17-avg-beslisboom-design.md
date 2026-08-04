# AVG Decision Tree — Design Spec
**Date:** 2026-07-17

## Overview

An interactive, embeddable decision tree component for AVG/GDPR compliance guidance. Built with React and Tailwind CSS, bundled with esbuild, and handed off as two static files (`bundle.js` + `bundle.css`) that anyone can drop into a website.

---

## Data Model

The entire tree is defined in `src/tree.json`. This is the single file to edit when adding or changing branches.

### Node types

| Type | Purpose |
|------|---------|
| `question` | Shows a question with one or more answer buttons, each pointing to the next node |
| `info` | Shows an informational block or checklist with a single "Continue" button |
| `outcome` | Terminal node — shows a styled result (GO / no action required / stop) |

### JSON structure

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

**Adding a branch:** Add a node to `nodes`, reference its `id` from an answer's `next`. No code changes needed.

---

## Architecture

### Project structure

```
avg-beslisboom/
  src/
    index.jsx            # React entry point — mounts to <div id="avg-beslisboom">
    index.css            # Tailwind entry: @import "tailwindcss"
    tree.json            # All decision tree content
    components/
      DecisionTree.jsx   # Stateful root: tracks currentNodeId + history stack
      QuestionNode.jsx   # Renders question text + answer buttons
      InfoNode.jsx       # Renders info/checklist text + Continue button
      OutcomeNode.jsx    # Renders terminal result card
      Breadcrumb.jsx     # Path trail at top, each step clickable to go back
  build.js               # esbuild config
  package.json
  dist/
    bundle.js            # Bundled React app
    bundle.css           # Processed Tailwind CSS
```

### Build

- **JS:** esbuild bundles `src/index.jsx` → `dist/bundle.js`
- **CSS:** Tailwind CLI v4 processes `src/index.css` → `dist/bundle.css`
- **Command:** `npm run build` runs both steps

### Embedding

Recipients drop three lines into their HTML:

```html
<div id="avg-beslisboom"></div>
<link rel="stylesheet" href="bundle.css">
<script src="bundle.js"></script>
```

---

## UX Flow

1. Component mounts and renders the node at `startId`
2. **Question node:** shows question text + one button per answer. Clicking an answer pushes current node to history and navigates to `next`
3. **Info node:** shows informational text + a "Continue" button that navigates to `next`
4. **Outcome node:** shows a styled result card. A "Start over" button resets to `startId`
5. **Breadcrumb:** always visible at top, shows the path of questions answered. Clicking any step navigates back to that point (pops history)
6. Node transitions use a fade animation

---

## Styling

- Tailwind CSS v4 utility classes, no custom CSS
- Card-based layout centered on the page
- Large, tap-friendly answer buttons
- Outcome variants:
  - `success` — green card (GO)
  - `neutral` — grey card (no action needed)
  - `stop` — red card (blocked / not permitted)
- Responsive: works on mobile and desktop

---

## Out of Scope

- Backend / persistence (no answers are saved)
- Multi-language support
- Admin UI for editing the tree
- Analytics / tracking
