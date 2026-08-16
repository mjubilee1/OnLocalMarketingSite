# OnLocalAI — Brand Guidelines

> Source of truth for the OnLocalAI brand. Visual tokens live in
> [`src/app/globals.css`](../src/app/globals.css) (`@theme` block); this doc
> explains how to use them. When the two disagree, update both.

---

## 1. Brand essence

**OnLocalAI** is private, on-premises AI for company onboarding, knowledge,
training, and support. Everything runs on the customer's own hardware —
**nothing leaves their machine.**

- **Legal name:** OnLocalAI
- **Wordmark:** `onlocalAI` (lowercase `onlocal`, uppercase `AI` in a lighter navy)
- **One-liner:** Private AI that runs on your own computer.
- **Core promise:** Privacy by architecture, not by policy.

---

## 2. Voice & tone

| Trait | We are | We are not |
|-------|--------|-----------|
| **Direct** | Plain, concrete, benefit-first | Buzzword-heavy, vague |
| **Credible** | Specific ("0 bytes to the cloud") | Hype ("revolutionary AI") |
| **Calm authority** | Confident, quietly technical | Salesy, exclamation-heavy |
| **Honest** | "I don't know" over invention | Overpromising |

Guidelines:
- Lead with the customer's problem, then the fix (the homepage flow: problem → fix → proof).
- Prefer concrete numbers and nouns over adjectives.
- Sentence case for headings. No trailing exclamation points.
- Say **on-premises / on-device / local**, not "the cloud."

---

## 3. Color

Navy scale derived from the logo mark (`#01185E`). Use Tailwind `brand-*` tokens
— never raw hex in components.

| Token | Hex | Primary use |
|-------|-----|-------------|
| `brand-50` | `#eff3fc` | Tinted backgrounds, badges |
| `brand-100` | `#dce5f7` | Hover fills, chips |
| `brand-200` | `#bccbec` | Borders, glows |
| `brand-300` | `#93aade` | Accent borders on hover |
| `brand-500` | `#3b5cb0` | Focus rings, mid accents |
| `brand-600` | `#274199` | Secondary accent, "AI" wordmark tint |
| `brand-700` | `#1a2f80` | Icon color, eyebrow labels |
| `brand-800` | `#0d2068` | Button hover |
| **`brand-900`** | **`#01185e`** | **Primary — buttons, headings, logo** |
| `brand-950` | `#030f3a` | Dark panels (privacy section) |

Neutrals use Tailwind `slate-*`. Theme color (browser chrome): `#01185e`.

**Do:** pair navy on white; use `brand-50` for soft accent surfaces; reserve the
`brand-950` dark panel for the privacy/architecture moment.
**Don't:** introduce new hues; put low-contrast gray-on-gray body text; use raw hex.

---

## 4. Typography

- **Typeface:** **Geist** (sans) + **Geist Mono**, loaded via `next/font/google`
  in [`layout.tsx`](../src/app/layout.tsx) and exposed as `--font-geist-sans` /
  `--font-geist-mono`. Never rely on the system fallback for brand surfaces.
- **Weights:** 600 (semibold) for headings and buttons; 400–500 for body.
- **Headings:** `tracking-tight`, `text-slate-900`; hero uses `leading-[1.05]`.
- **Body:** 16px base, `leading-relaxed`, `text-slate-600`.
- **Eyebrows:** uppercase, `tracking-[0.14em]`, `text-brand-700`.
- **Accent:** hero keyword uses a `brand-700 → brand-900` gradient clip.

---

## 5. Logo & mark

Assets in [`public/brand/`](../public/brand/). Component: [`Logo.tsx`](../src/components/Logo.tsx).

- **`<Logo />`** — full lockup (mark + wordmark). Default header height 26px, footer 24px.
- **`<BrandMark />`** — circular mark alone. Inherits `currentColor`, so tint per placement.

**Do:** keep clear space ≥ the mark's height around the lockup; use the mark as a
low-opacity watermark (`text-white/[0.04]` on dark) for brand presence.
**Don't:** recolor the wordmark outside the navy scale; stretch, rotate, or add
effects to the mark; place the navy lockup on a busy or low-contrast background.

---

## 6. Motion & effects

- **Entrance:** `fade-up` (0.5–0.7s, `cubic-bezier(0.22, 1, 0.36, 1)`).
- **Ambient:** slow floating background glows; live "pulse-dot" status.
- **Hover:** cards lift `-translate-y-0.5` + shadow; icons invert to navy fill.
- **Radii:** `rounded-2xl` cards, `rounded-3xl` feature panels, `rounded-xl` buttons.
- **Accessibility:** all of the above collapse under `prefers-reduced-motion`.
  Focus ring: `2px solid brand-500`, keyboard-only.

---

## 7. Consistency checklist (before shipping UI)

- [ ] Colors use `brand-*` / `slate-*` tokens — no raw hex
- [ ] Text on brand fills meets 4.5:1 contrast
- [ ] Headings in sentence case, `tracking-tight`
- [ ] Interactive elements ≥ 40px tall on mobile, 8px+ apart
- [ ] Motion respects `prefers-reduced-motion`
- [ ] Geist is loading (not system fallback)
- [ ] Voice: problem-first, concrete, no hype
