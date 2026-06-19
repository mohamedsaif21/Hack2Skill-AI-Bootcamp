# Build Brief: AI Document Intelligence Platform — UI & Dashboard

You are building the complete front end for an AI document intelligence platform. A user uploads contracts, policies, or reports; the system answers questions about them with inline citations back to the exact source page, and surfaces a running list of risky clauses in a dedicated sidebar. Build this with the same care as a small design studio handing off a client product — not a generic AI chat template.

This document is the full spec. Follow it exactly. Where it leaves something open, make a deliberate choice and stay consistent with the direction below rather than defaulting to a generic SaaS look.

---

## 1. What this product is

**Working name:** Marginal — *AI document intelligence with margin notes that matter.* (Rename if you prefer, but keep the "margin note" idea — it drives the signature interaction below.)

**One-liner:** Upload a contract or report, ask it questions in plain language, and get answers grounded in the actual document — with every claim traceable to a page, and every risky clause flagged before you have to find it yourself.

**Audience:** Founders, ops teams, and small legal/compliance teams who currently read contracts manually or paste them into a generic chatbot and don't trust the answer.

**The page's single job, per screen:**
- Landing: convince someone this is trustworthy and fast, then get them to upload.
- Workspace: let them read, ask, and verify — with zero ambiguity about where an answer came from.

---

## 2. Tech constraints

- Next.js 14, App Router, TypeScript
- Tailwind CSS for styling — no off-the-shelf UI kit skin (shadcn/ui primitives are fine for accessibility scaffolding only, but every visual property — color, radius, type, spacing — must follow the token system below, not the kit's defaults)
- Build for streaming responses (Server-Sent Events) in the Q&A panel — assume answers arrive token-by-token, design the UI so partial answers look intentional, not broken
- Backend Gemini calls and the vector store are handled separately — wire the UI to clean API route placeholders (`/api/ask`, `/api/upload`, `/api/risk-scan`) returning typed mock data for now
- Fully responsive down to mobile; the workspace can collapse to a tabbed single-pane view below 768px

---

## 3. Design direction — token system

**Color (use these exact hex values, no substitutions):**
- `--ink` `#1C2434` — primary text, headers, document chrome
- `--parchment` `#F7F3E9` — primary background (this is a paper-and-ink product, not a dark SaaS dashboard)
- `--rust` `#B23B2E` — high-risk flags only
- `--amber` `#D98F0B` — medium-risk flags, attention states
- `--verified` `#2E6F63` — verified citations, confirmed/safe states
- `--mist` `#8A8F98` — secondary text, borders, dividers

Do not introduce a bright gradient hero or a near-black background with a single neon accent — that's the generic AI-product default. This product earns trust by feeling like a precise paper instrument, not a flashy app.

**Typography:**
- Display: **Source Serif 4**, semibold — document titles, section headers, the landing headline. Used with restraint, never for body copy.
- Body/UI: **Inter** — all interface text, buttons, labels, chat bubbles.
- Data/mono: **IBM Plex Mono** — page numbers, citation references (e.g. `p. 14 §3.2`), timestamps, risk severity codes. This is what makes citations feel verifiable rather than decorative — numbers should look stamped, not styled.

**Layout concept:**
A three-pane workspace, paper-on-desk metaphor: document on the left/center, conversation on the right, risk flags living *in the margin* of the document itself rather than buried in a separate tab.

```
┌─────────────────────────────────────────────────────────────┐
│ Marginal            [doc title]              [export] [⋯]   │
├───────────────┬───────────────────────────┬─────────────────┤
│               │                           │                 │
│  Library      │   Document viewer         │   Ask panel     │
│  - doc list   │   (rendered PDF/text,     │   (chat thread, │
│  - upload CTA │   highlighted clauses,    │   streamed      │
│               │   margin rail at edge)    │   answers with  │
│               │                           │   citation      │
│               │                           │   chips)        │
└───────────────┴───────────────────────────┴─────────────────┘
```

**Signature element — "The Margin Rail":**
This is the one thing this product should be remembered for. Along the right edge of the document viewer, each AI-detected risk clause gets a small flagged tab positioned at the exact vertical height of the source text in the document — like a lawyer's marginalia, not a dashboard card. The tab is color-coded (`--rust` / `--amber`), shows the severity label in mono type, and connects to the highlighted clause via a thin 1px leader line on hover. Clicking a tab scrolls the document to that clause and expands a short note explaining the risk. Clicking a citation chip in the Ask panel does the same thing — scrolls and highlights the exact passage. The rail and the chat citations should feel like *one system*, not two separate features.

---

## 4. Pages & components

**`/` — Landing**
- Headline in Source Serif, stating the one-liner plainly — no stock "Unlock the power of AI" phrasing
- A single, real example front and center: a short snippet of a contract clause with a citation chip and a risk tab already visible, so the signature interaction is the first thing a visitor sees, not a hero illustration
- Upload CTA, drag-and-drop zone, accepts PDF/DOCX
- No pricing, no testimonials, no logo soup — this is a working tool, not a marketing site

**`/workspace/[docId]` — Main workspace**
- Left rail: document library (uploaded docs, status: processing / ready / error), upload button
- Center: document viewer with highlighted clauses and the margin rail described above
- Right: Ask panel — chat thread, input box, streamed answers, each answer's claims followed by a small mono citation chip (`p. 14 §3.2`)
- Mobile: collapses into three tabs — Library / Document / Ask — bottom tab bar, not a hamburger menu

**Risk severity tags:** `LOW` (mist), `MEDIUM` (amber), `HIGH` (rust) — always mono type, always uppercase, always paired with a one-line plain-language reason, never just a color with no explanation.

---

## 5. States & copy

Write all interface copy in plain, active voice. No apologies, no exclamation points, no "Oops!"

- **Empty library:** "No documents yet. Upload a contract, policy, or report to get started."
- **Processing:** "Reading [filename]… extracting clauses and checking for risk." (with a determinate progress bar if chunk count is known)
- **Upload error:** "Couldn't read [filename]. Try a PDF or DOCX under 25MB."
- **No risks found:** "No flagged clauses found in this document." — not "Great news!"
- **Ask panel, before first question:** "Ask anything about this document. Answers are grounded in its text, with page citations."
- **Answer with low confidence / no match:** "Nothing in this document directly answers that. Here's the closest related clause:" — never silently guess.

---

## 6. Motion — used deliberately, not decoratively

- Margin rail tabs fade and slide in slightly after risk-scan completes (one orchestrated reveal, not a cascade of bouncing cards)
- Leader line between a margin tab and its clause draws in on hover (150ms), not a tooltip popping into place
- Streamed answer text appears at a steady token pace — no typewriter sound-effect gimmicks
- Respect `prefers-reduced-motion` — disable the leader-line draw and reveal animation, keep state changes instant

---

## 7. Accessibility & responsiveness

- All risk tags carry text labels, not color alone (colorblind-safe by design)
- Visible keyboard focus states on every interactive element, especially citation chips and margin tabs
- Document viewer and Ask panel both independently scrollable; keyboard-navigable citation jumps
- Fully usable down to a 375px mobile viewport via the tabbed layout described above

---

## 8. Explicitly avoid

- Generic dark dashboard with a single neon accent color
- Cream background + terracotta accent + generic serif (the other overused AI-product default)
- Numbered "01 / 02 / 03" feature markers — nothing here is a sequence
- Stock dashboard cards with large bold numbers and a small label underneath, used as decoration rather than real data
- Chat-bubble UI that looks identical to a generic ChatGPT clone — citations and the margin rail must visually tie the chat to the document, not float independently

---

## 9. Build order (suggested, for parallel agents)

1. Design tokens + Tailwind config (colors, type scale, spacing) — do this first, everything else depends on it
2. Landing page
3. Workspace shell (three-pane layout, responsive collapse)
4. Document viewer + margin rail (the signature piece — give this the most iteration)
5. Ask panel with streaming + citation chips, wired to the rail
6. Empty/loading/error states using the copy above
7. Pass: check every screen against section 8's avoid-list before calling it done
