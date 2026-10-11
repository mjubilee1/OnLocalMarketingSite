# Research cheat-sheet for practice design

Short principles distilled for hospitality setup drills. Use these to justify design choices; do not paste citations into crew-facing copy.

## Core principles

### 1. Retrieval practice
People remember more when they *pull* knowledge out (rebuild the plate) than when they only re-read or re-watch.

**In product:** place check after the walkthrough; spot check after a standard change.

### 2. Worked example → practice
Novices learn faster from a clear worked example first, then attempt alone. Fade support over time.

**In product:** steps animate the standard → place check with no captions → later modules can skip straight to check if they already know the base.

### 3. Desirable difficulty
Slight challenge (scramble, find what moved) beats easy clicking. Too hard → frustration; too easy → no learning.

**In product:** scramble tray positions; one meaningful change note; keep item count to what fits a real cover (usually 4–8 movable pieces).

### 4. Immediate corrective feedback
Feedback right after a miss beats end-of-module scores alone.

**In product:** wrong tap / wrong drop → flash + retry (already in Player). Captions should set up success, not replace the check.

### 5. Specific, actionable feedback language
“Chicken goes on the guest’s right” beats “Incorrect.”

**In product:** prompts name the rule; Alex lines use clock positions and guest-facing language.

### 6. Transfer / vary the surface
Same rule, slightly new context (venue name, change note, different protein label) builds flexible skill.

**In product:** reuse template; change venue + changeNotes; keep spatial rule stable.

### 7. Spaced, short sessions
Several short practices beat one long dump.

**In product:** one module ≈ 2–4 minutes; ship a family (plate / table / station) rather than one mega-board.

### 8. Dual channel (words + picture)
Spoken line locked to a highlighted item beats a wall of text beside a static image.

**In product:** each step has `itemIds` + short caption; last step `highlight` the whole standard.

## Research checklist (before shipping a draft)

- [ ] Trainee must *do* something (place or spot), not only watch
- [ ] Watch phase is a worked example of the final standard
- [ ] Captions are short enough to speak aloud
- [ ] Check prompt restates the critical rule once
- [ ] If version > 1: change note names what moved
- [ ] Module has one clear job
- [ ] No invented safety/legal claims

## Hospitality framing (content tone)

- Guest-facing language: “guest’s right,” “12 o’clock,” “every cover”
- Property-specific when possible: venue in title or Alex’s last line
- Standards language: “the standard,” not “best practice tip”
- Change management: lead with what chefs/managers changed this week

## Mapping principles → TrainingSpec fields

| Principle | Field |
|-----------|--------|
| Worked example | `steps` + `scene` |
| Retrieval | `checks` (`place`) |
| Desirable difficulty | `checks.start` scramble; `spot` + `previousScene` |
| Change / transfer | `changeNotes`, `previousScene`, `venue` |
| Dual channel | `steps[].caption` + `itemIds` + `anim` |

## Sources (for skill authors — not for crew UI)

Summarized from well-established learning-science themes associated with:

- Retrieval practice (e.g. Roediger & Karpicke tradition)
- Worked examples / cognitive load (e.g. Sweller et al.)
- Desirable difficulties (e.g. Bjork)
- Feedback timing and specificity (formative assessment literature)
- Multimedia / contiguity (e.g. Mayer)

If the user supplies a house SOP or brand standard, that document wins over generic hospitality defaults.
