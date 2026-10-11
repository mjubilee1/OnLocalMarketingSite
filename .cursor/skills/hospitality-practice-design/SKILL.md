---
name: hospitality-practice-design
description: >-
  Designs data-backed hospitality practice modules for onlocal setup training
  (plated dinner, round table, coffee station). Use when drafting TrainingSpec
  modules, Alex coach lines, place/spot checks, change notes, practice materials,
  setup standards, or engaging crew drills backed by learning science.
---

# Hospitality practice design

Build short, do-first practice for banquet / F&B crew — not slide decks.

Read [reference.md](reference.md) for the research rules. Read [examples.md](examples.md) before writing a full module.

## When to use

- New setup board / practice module
- Rewrite Alex captions or checks to be more engaging
- Turn an SOP or photo standard into a train-and-check flow
- Pair GenAI video (welcome) with interactive practice (this skill)

## Inputs to gather (ask if missing)

1. **Venue** — e.g. Gaylord Hotel
2. **Template** — `plate` | `round-table` | `station`
3. **Standard** — what “correct” looks like (items + positions in plain English)
4. **What changed** (optional) — one concrete change vs last version
5. **Audience** — banquet servers, stewards, barbacks, etc.

## Design rules (non-negotiable)

1. **Retrieval over lecture** — every module ends in a place and/or spot check
2. **Worked → try** — watch the picture (steps) then rebuild / find the change
3. **One job** — one standard per module; 2–5 spoken steps; ≤4 minutes
4. **Speakable lines** — Alex captions: ≤18 words, concrete, no jargon pile-ups
5. **Change note when revising** — name the moved items; lead with the change
6. **Safety** — do not invent allergen, alcohol, or legal rules; only use what the user supplied
7. **Photos optional** — prefer library kinds / labels; note where a house photo helps

## Workflow

Copy and track:

```
Practice draft:
- [ ] 1. Pick template + title + venue
- [ ] 2. List scene items (id, label, rough x/y %, z)
- [ ] 3. Write 2–5 step captions (anim: appear → highlight)
- [ ] 4. Add place check (and spot check if previousScene exists)
- [ ] 5. Add changeNotes if version > 1
- [ ] 6. Self-check against research checklist in reference.md
- [ ] 7. Deliver TrainingSpec JSON + “how to demo” blurb
```

### Step captions

- Step 1: orientation (clean plate / table / station)
- Middle: one item or tight group per line; clock positions when useful
- Last: “same standard every cover / every room” (highlight)

### Checks

| Kind | Use when | Prompt style |
|------|----------|--------------|
| `place` | Build the standard | “Build it. Drag each item onto the picture.” |
| `spot` | `previousScene` differs | “What changed? Tap the piece that moved.” |

Scramble `start` poses for place checks off the board (high y, spread x).

## Output format

Deliver:

1. **Demo blurb** — 2 sentences: what crew does + what proves they got it
2. **TrainingSpec** — valid JSON matching `src/training/types.ts` (see template below)
3. **Photo notes** — which pieces need house photos vs built-in shapes
4. **Open questions** — anything unsafe or ambiguous left for the manager

### TrainingSpec template

```json
{
  "id": "kebab-id",
  "department": "banquets",
  "title": "Short title — venue or standard name",
  "venue": "Gaylord Hotel",
  "status": "draft",
  "version": 1,
  "updatedAt": "YYYY-MM-DD",
  "template": "plate",
  "scene": {
    "kind": "plate",
    "items": [
      { "id": "plate", "kind": "plate", "label": "Plate", "x": 50, "y": 52, "z": 0 }
    ]
  },
  "previousScene": null,
  "steps": [
    { "id": "s1", "caption": "Speakable line.", "anim": "appear", "itemIds": ["plate"] }
  ],
  "checks": [
    {
      "id": "place-main",
      "kind": "place",
      "prompt": "Build it. Drag each item onto the picture.",
      "itemIds": [],
      "start": {}
    }
  ],
  "changeNotes": []
}
```

Use real `kind` values from `src/training/items.ts` when possible (`chicken`, `starch`, `cup`, `fork`, …). Custom house pieces: invent `id`/`label` and note “add to library.”

## Code integration (only if asked)

- Seed module: `src/data/training/<name>.ts` + export from `index.ts`
- Or leave as draft JSON for the Setup editor
- Do not invent API/backend changes for practice content

## Anti-patterns

- Long paragraphs Alex would never say
- Quiz-only with no hands-on place/spot
- Five competing standards in one module
- Decorative filler steps that teach nothing
- Claiming “research says” without following [reference.md](reference.md)
