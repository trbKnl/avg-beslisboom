# AVG Beslisboom — Visual UX Redesign Spec
**Date:** 2026-07-21

## Overview

Redesign the AVG decision tree from a plain step-by-step questionnaire into an interactive, progressively-revealed flowchart where the tree IS the interface. Each node is a styled card, connected by animated SVG paths. The visual language matches datadonation.eu and dd-script-selector (Nunito fonts, `#4272EF` blue primary, rounded cards, subtle shadows).

---

## Core Concept

The flowchart is the entire UI — there is no separate question panel. The tree renders vertically (top-to-bottom). On first load only the start node is visible. As the user answers questions, chosen branches draw themselves and new cards animate in below. The full path taken remains visible above, creating a visual trail of decisions made.

---

## Approach

Custom CSS/SVG tree — no graph library. Flexbox handles vertical layout, SVG `<path>` elements draw curved connectors between cards. React manages state, CSS handles animations. This keeps the bundle tiny for the "drop two files into any site" embedding story.

---

## Node Card Styling

### Active Question Card
- Background: `#FFFFFF`
- Border: `1px solid rgba(37,42,52,0.1)`
- Border-radius: `22px`
- Box-shadow: `0 1px 2px rgba(0,0,0,0.04), 0 26px 50px -28px rgba(37,42,52,0.3)`
- Padding: `24px`
- Question text: Nunito, weight 700, color `#252A34`
- Answer buttons: `#4272EF` blue background, white text, rounded-lg, hover darkens slightly

### Completed Card
- Background: `#F5F7FB`
- Border: `1px solid #E6E6E6`
- Same border-radius (22px), shadow removed
- Green checkmark icon top-right
- Question text visible but lighter (`#6A6A6A`)
- Chosen answer displayed as a small pill/tag: `#4272EF` background, white text, rounded-full
- Unchosen answers hidden
- Clickable — clicking rewinds the tree to that point (replaces breadcrumb)

### Info Card
- Background: `#FDF4DF`
- Left border: `4px solid #E8B53C`
- Border-radius: `22px`
- Matches the datadonation.eu "postit note" aesthetic
- "Continue" button in `#4272EF` blue

### Outcome Card
- Border-radius: `22px`
- Left border: `4px solid` (color varies by variant)
- **Success (GO):** background `#EEF3FE`, border `#4272EF`
- **Neutral:** background `#F5F7FB`, border `#6A6A6A`
- **Stop:** background `#FFEFEF`, border `#FF5E5E`
- "Start over" styled as arrow CTA: `← Start over` in `#FF5E5E`

---

## Connectors

- SVG curved paths between cards, 2px stroke
- Default color: `#E6E6E6`
- Chosen path transitions to `#4272EF` blue
- Small animated dot travels along the connector during reveal (subtle flourish)
- Connector stubs for unchosen branches: short dashed lines (~20px) in light grey, hinting at unexplored paths without revealing content

---

## Progressive Reveal & Animations

### Reveal Flow
1. On mount: only the start node card is visible
2. User clicks an answer button
3. The active card collapses to completed state: buttons fade out (200ms), replaced by chosen-answer pill, background transitions to `#F5F7FB`
4. Chosen connector draws itself downward: SVG `stroke-dashoffset` animation, ~400ms
5. Next card fades + slides in: `opacity 0→1`, `translateY 20px→0`, ~300ms ease-out
6. Auto-scroll so new active card is centered in viewport (smooth, ~400ms)

### Branching Visual
- For questions with multiple answers, connector stubs fan out below the card (one per possible `next` node)
- Only the chosen branch fully draws and reveals its target
- Unchosen stubs remain as short dashed lines in light grey

### Rewinding
- Clicking a completed card: everything below fades out (150ms), clicked card re-expands to active state (buttons reappear), connectors below disappear
- Smooth scroll to reactivated card

### Start Over
- All cards except first collapse upward and fade out in staggered sequence (50ms offset each)
- Start card re-expands to active state

---

## Typography

- **Headings (question text, outcome text):** Nunito, weight 700, color `#252A34`
- **Body (info text, descriptions):** Nunito Sans, weight 400, color `#333333`
- **Secondary text (completed card question, labels):** Nunito Sans, weight 400, color `#6A6A6A`
- **Button text:** Nunito Sans, weight 600, white
- Load via Google Fonts link, or bundle `@font-face` in built CSS for self-contained embedding

---

## Layout & Responsiveness

- Max-width container: `672px` (max-w-2xl), centered
- Cards are full-width within the container
- Connectors render in an SVG overlay positioned between cards
- Mobile: same vertical layout, cards stack naturally, touch-friendly button sizing (min 48px tap targets)
- No horizontal scrolling at any breakpoint

---

## Component Architecture

```
src/
  index.jsx              # Mount point (unchanged)
  index.css              # Tailwind + @font-face + custom animations
  tree.json              # Decision tree data (unchanged)
  components/
    DecisionTree.jsx     # Root: manages currentNodeId, history, scroll, SVG overlay
    TreeNode.jsx         # Renders a single node card (all types), handles active/completed states
    Connector.jsx        # SVG path between two nodes, handles draw animation
    AnswerPill.jsx       # Small pill showing chosen answer on completed cards
```

Replaces the current single `DecisionTree.jsx` with a component hierarchy. `QuestionNode`, `InfoNode`, `OutcomeNode`, `Breadcrumb` from the original spec are consolidated — `TreeNode` handles all node types via a `type` prop, and the breadcrumb is replaced by the clickable completed cards in the tree itself.

---

## Data Model

No changes to `tree.json`. The existing node types (`question`, `info`, `outcome`) and structure are sufficient.

---

## State Management

All in React `useState`/`useRef`:
- `currentId` — the active node
- `history` — array of `{ nodeId, chosenAnswer }` objects (extended from current plain ID array to track which answer was picked)
- `nodeRefs` — ref map for measuring card positions to draw SVG connectors
- `revealState` — tracks animation phase per node (hidden / connector-drawing / card-revealing / visible)

---

## Out of Scope

- Pan/zoom (tree is small enough to scroll)
- Drag-to-rearrange nodes
- Backend persistence
- Tree editor UI
- Multi-language
