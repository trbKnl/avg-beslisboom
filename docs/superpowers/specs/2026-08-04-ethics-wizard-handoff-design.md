# Ethics Wizard + Study Characteristics — Handoff Design

## Goal

Create a single self-contained HTML page that serves as a clickable handoff artifact for the implementer of datadonation.eu. It replaces the current React-based DPIA decision tree entirely. The page combines an ethics wizard (step-by-step flow) with a study characteristics accordion — the wizard gates access to the characteristics section.

## Constraints

- No build step, no framework, no dependencies
- Uses datadonation.eu's existing design system (Nunito/Nunito Sans fonts, their color palette, BEM naming)
- Links to `/assets/css/main.css` from datadonation.eu for base styles
- All content (text, labels, branching logic) lives in JSON `<script>` blocks in the HTML — editable without touching JS or CSS
- New CSS classes follow datadonation.eu's BEM convention
- File sizes should be minimal — JS handles rendering only, content is data

## File Structure

Single HTML file containing:

1. `<script type="application/json" id="wizard-data">` — wizard screen definitions
2. `<script type="application/json" id="chars-data">` — characteristics content
3. `<style>` — new BEM classes for wizard and characteristics components (commented for implementer to merge into their stylesheet)
4. `<section class="ethics-wizard">` — wizard container
5. `<section class="study-chars">` — characteristics container
6. `<script>` — rendering and navigation logic

## Styling Strategy

- Reuse existing datadonation.eu classes where they fit: `.callout`, `.prose`, `.content-page__title`, `.section-cta`, etc.
- New BEM classes for custom components:
  - `.ethics-wizard`, `.ethics-wizard__progress`, `.ethics-wizard__card`, `.ethics-wizard__screen`, `.ethics-wizard__choice-btn`, etc.
  - `.study-chars`, `.study-chars__item`, `.study-chars__summary`, `.study-chars__subbox`, etc.
- Colors from the existing system: `#4272ef` (primary), `#ff5e5e` (accent red), `#252a34` (dark text), `#6a6a6a` (muted), `#f5f7fb` (bg muted), `#e6e6e6` (borders)
- Card style: 22px border radius, shadow `0 1px 2px rgba(0,0,0,.04), 0 26px 50px -28px rgba(37,42,52,.3)`
- Fonts: Nunito (headings, weight 800) + Nunito Sans (body)

## Wizard Component

### Progress Indicator

Horizontal bar with 4 numbered step dots:
- **Upcoming:** grey border, grey number
- **Current:** primary-colored border, glow/ring effect, primary number
- **Done:** filled primary background, white checkmark

Fill line animates between dots based on current step.

### Screen Types

All screens are rendered in the HTML at build time (from JSON data) and shown/hidden via a CSS class toggle.

**Intro screen:**
- Title, description paragraph, "Start" button
- Step count label ("Takes about 3 minutes")

**Question screens (4):**
- Eyebrow label ("Question N of 4")
- Icon badge (inline SVG in a rounded square)
- Question heading
- Help text
- Yes/No choice buttons (side by side, with label + sublabel)
- Back button + step counter in footer

**Interstitial screens (3):**
- Left border accent (primary color)
- Eyebrow ("Before you continue")
- Info heading and body text
- Back + Continue buttons

**Stop screens (3):**
- Warning icon badge
- Heading and body text
- Callout box with suggested text (where applicable)
- "Start over" + "Browse general guidance anyway" buttons

**Done screen:**
- Success icon badge (checkmark)
- Heading and body text
- "Start over" + "View full guidance" buttons
- "View full guidance" smooth-scrolls to characteristics section

### Wizard Flow

```
Intro
  → Q1: Do you use the Next platform?
    → No  → Q1-stop (general guidance, can browse anyway)
    → Yes → Q1-interstitial (Fair Use Policy note)
      → Q2: Do you use the free ODISSEI license?
        → No  → Q2-stop (general guidance, can browse anyway)
        → Yes → Q2-interstitial (ODISSEI User Policy note)
          → Q3: Will you be collecting personal data?
            → No  → Q3-stop (positive: straightforward application, can browse anyway)
            → Yes → Q3-interstitial (DPIA note)
              → Q4: Is your university in the list?
                → No  → Q4-stop (need to carry out DPIA, contact email)
                → Yes → Done (scroll to characteristics)
```

### Branching Data

Branching logic is encoded in the wizard JSON: each screen has `next`, or `yes.next`/`no.next` properties pointing to screen IDs. The JS simply looks up the next screen ID — no hardcoded flow in the code.

## Characteristics Component

### Structure

A `<section class="study-chars">` containing:
- Heading + intro paragraph
- Accordion list of 8 items

### Accordion Items

Each item is a native `<details>` element — no JS needed for open/close behavior. Multiple items can be open simultaneously.

**Summary row:**
- Icon (small inline SVG in a teal-tinted rounded square)
- Title text
- CSS-rotated chevron indicator

**Body (three sub-boxes):**
Each sub-box has:
- Numbered circle label (1, 2, 3) in primary color
- Section label:
  1. "Explanation — what is it, why does it matter?"
  2. "Example text for your ethics application"
  3. "Example text for participant communication"
- Body text from the JSON data

Sub-boxes are styled with a muted background, rounded border, matching the mockup's `.subbox` pattern but using datadonation.eu's color variables.

### Characteristics List

From the mockup (8 items):
1. Study purpose
2. Personal data
3. Combining data
4. Enriching data
5. Data from other persons
6. Secondary data use
7. Third party data access
8. Scraping

Each has an associated icon (SVG paths from the mockup) and three content sections.

## Content Data Format

### wizard.json (embedded as `<script type="application/json" id="wizard-data">`)

```json
[
  {
    "id": "intro",
    "type": "intro",
    "title": "Preparing your ethical review board application",
    "body": "Are you a researcher...",
    "nextLabel": "Start \u2192",
    "next": "q1"
  },
  {
    "id": "q1",
    "type": "question",
    "eyebrow": "Question 1 of 4",
    "icon": "monitor",
    "title": "Do you make use of the data donation software service on the Next platform?",
    "helptext": "This determines whether the guidance on this page is written specifically for your setup.",
    "yes": { "label": "Yes", "sublabel": "I use the Next platform", "next": "q1-yes-note" },
    "no": { "label": "No", "sublabel": "I use something else, or haven't decided yet", "next": "q1-stop" }
  },
  {
    "id": "q1-yes-note",
    "type": "interstitial",
    "eyebrow": "Before you continue",
    "title": "Your study needs to comply with the Eyra Fair Use Policy",
    "body": "To use the data donation service...",
    "back": "q1",
    "next": "q2"
  },
  {
    "id": "q1-stop",
    "type": "stop",
    "eyebrow": "General guidance",
    "title": "This page is tailored to the Next platform",
    "body": "The information here is written specifically...",
    "callout": "Suggested text for your application:...",
    "browseAnyway": true
  }
]
```

### characteristics.json (embedded as `<script type="application/json" id="chars-data">`)

```json
[
  {
    "id": "personal-data",
    "title": "Personal data",
    "icon": "lock",
    "explanation": "Personal data is any information...",
    "application": "This study collects personal data via...",
    "participant": "When you donate your data..."
  }
]
```

## JavaScript Logic

Small, focused script (~100-150 lines) that:

1. Parses both JSON blocks on DOMContentLoaded
2. Renders wizard screens into `.ethics-wizard__card`
3. Renders characteristic items into `.study-chars` as `<details>` elements
4. Handles wizard navigation: `showScreen(id)` toggles visibility, updates progress bar
5. Handles "View full guidance" scroll: `document.querySelector('.study-chars').scrollIntoView({ behavior: 'smooth' })`

No state management beyond tracking the current screen ID.

## Icons

Inline SVGs from the mockup, stored as path data in a JS object:
- `target`, `lock`, `merge`, `sparkle`, `people`, `archive`, `key`, `scrape` (for characteristics)
- `monitor`, `building`, `database`, `checkmark`, `warning`, `document`, `shield` (for wizard screens)

## Animations

- Fade-slide transition between wizard screens (0.25s ease)
- Chevron rotation on `<details>` open (0.2s ease via CSS)
- Progress bar fill width transition (0.3s ease)
- Choice button hover states (border/background color transitions)
