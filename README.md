# onlocalAI

**[onlocalai.com](https://onlocalai.com)**

Onboarding and training for event companies that hire lots of short-term casual staff. It takes a new crew member from scanning a QR code to being ready for a shift in under an hour, all on their phone.

It has two apps:

| | For | Where |
|---|---|---|
| **Manager portal** | Crew managers and ops | `/admin` |
| **Crew app** (mobile-first) | Casual event staff | `/app` |
| **Self sign-up** | New hires | `/join/CREW2026` |

## Run it

```bash
npm install
cp .env.example .env.local   # then add your OpenRouter key
npm run dev
```

Open http://localhost:5173. The app comes loaded with demo data: 16 crew, 6 roles, 9 courses and 4 events. Use **Reset demo data** in the manager sidebar to start over. In the crew app, the **Viewing as** dropdown at the top lets you see the app as any crew member.

## Features, and where the ideas came from

| Feature | What it does here | Inspired by |
|---|---|---|
| **QR / link self-sign-up** | One link or printable poster. The person picks roles and sees the pay rate and how long it takes to get ready. | Rosterfy, Liveforce, Instawork |
| **Email invites & reminders** | Invite people one at a time by email. Each person gets a personal link that pre-fills their sign-up. Real delivery through Resend or SMTP, with the true outcome shown per person, plus copy-link and email-app fallbacks when email isn't set up | Rippling, BambooHR |
| **Role-based onboarding flows** | Each role is a "Sign → Learn → Certify" checklist. A change applies to everyone right away. | BambooHR onboarding templates, Trainual roles |
| **E-signature** | Draw with a finger or type your name. Records the date and time. | DocuSign, Gusto, Deel |
| **Two-party contracts** | The manager fills in your Event Planning Service Contract PDF. The crew member reviews a plain-language summary, adds their address and signs on their phone, and the manager countersigns. Either side can download the PDF: a watermarked draft that's still fillable, or a locked signed copy with a signature certificate | DocuSign, Dropbox Sign, Rippling documents |
| **Microlearning player** | Swipeable cards, progress bar, resumes where you left off | EdApp (SafetyCulture), 7taps |
| **Instant-feedback quizzes** | Right/wrong feedback with an explanation, a pass mark, and retry | EdApp, TalentLMS, Lessonly |
| **Course builder with live phone preview** | Card, video and quiz lessons, reordering, draft/publish | Trainual, EdApp authoring |
| **Video links** | Paste a normal YouTube (including Shorts and `?t=` start times), Vimeo (including unlisted), Loom, Google Drive or direct .mp4/.webm link. The title and length are filled in automatically. Videos can be added in the builder or when creating a course with AI | EdApp, Trainual, 7taps |
| **Researched US template library** | 21 courses, 8 policy documents and 6 starter packs for US event companies, filterable by type and role. Each has sources and a legal note, is assigned to roles when added, and starts as a draft if it needs local details. See `docs/training-research-2026-09.md` | Mitti (formerly SafetyCulture/EdApp), TalentLMS, Trainual |
| **Gamification** | Points, levels (Rookie → Legend), badges, leaderboard, confetti | EdApp, Connecteam, WorkRamp |
| **Certificate wallet + expiry tracking** | Upload a photo or PDF. Managers verify it. Expiry is calculated automatically, with alerts 30 days ahead. | Liveforce, Rosterfy, Deputy |
| **Readiness score** | 0–100% per person and per event. Only people at 100% can claim shifts. | Rosterfy "compliance gating" |
| **AI photos for courses and cards** | AI reads each course and each text card and writes photo searches; photos come from Pexels, Unsplash or Openverse (all licensed for commercial use, photographer credited). Covers show on course cards; card photos show above the lesson text. Pick from results, search yourself, fill a whole course or every course at once, or let new AI and library courses get photos automatically. Google Images isn't used: its results are mostly copyrighted | Coursera, Udemy course catalogs |
| **Event templates** | 6 editable starter templates (festival, conference, gala/wedding, stadium, indoor concert, corporate party) with shifts, run sheet, briefing, contacts and training. "New event" starts from any template. You can create your own, save any event as a template, duplicate, delete, or restore a built-in. Editing a template never changes events already created from it | Rosterfy, Liveforce event templates |
| **Event-specific training** | Extra courses added to one event on top of role training | Rosterfy event credentials |
| **Event briefing** | Call time, map link, dress code, parking, run sheet, tap-to-call contacts | Rosterfy, Liveforce, Connecteam |
| **Shift marketplace** | Crew claim open shifts that match their roles, then confirm or release them | Instawork, Deputy, Sling |
| **Auto-fill roster** | Fills open slots with fully ready crew, ranked by rating | Deputy auto-scheduling, Shiftboard |
| **QR check-in pass** | Personal pass per shift. The supervisor scans it or types the code. | Rosterfy, Liveforce |
| **Post-event ratings** | Star ratings per person feed a reliability score | Instawork, Qwick |
| **Rehire pool / alumni** | 4.5★+ performers kept for re-engagement, with training history preserved | Rosterfy talent pools, Workday rehire |
| **Nudges** | One-click or bulk reminders for people who aren't ready yet | BambooHR, Rippling task reminders |
| **"Needs attention" dashboard** | At-risk crew for events in the next 14 days, expiring or unverified certs, stalled invites | Rippling, Deputy |
| **Time-to-ready analytics** | Average hours from sign-up to fully ready, and training completion rate | WorkRamp, TalentLMS reporting |
| **AI course creation** | A manager describes a topic (and can paste their own SOP). AI writes cards and a scenario quiz in any of 9 languages and saves it as a draft to review | Trainual AI, EdApp Create with AI, TalentLMS AI |
| **AI role designer** | Describe a new role in plain words. AI proposes the name, pay (based on your existing rates), and the documents, courses and certificates it needs from your library, with a reason for each. It also flags training gaps you can draft with AI in one click | Rippling / BambooHR onboarding templates, Trainual AI |
| **AI card assistant** | In the builder: add an AI card or quiz, or rewrite a card (simpler, shorter, add an example, translate) | Trainual, 7taps |
| **Language preference** | Captured at sign-up (the base for multilingual content) | Connecteam, EdApp translations |

## AI training materials

Crew managers can use AI in three places:

- **Onboarding flows → Create role with AI.** Describe the role. AI chooses from **your own** documents, courses and certificates. The server drops any id that isn't in your library and always keeps the paperwork every role shares. It suggests pay within your existing range and lists training gaps. Each gap has a "Draft with AI" button that opens the course creator, pre-filled and linked to the new role.

- **Training → Create with AI.** Describe what crew should learn, pick roles, length and language, and optionally paste an SOP or policy. You get a full course (cards plus a quiz), saved as a **draft** that can be added to those roles' onboarding flows. Drafts stay hidden from crew and don't count towards readiness until a manager publishes them.
- **Course builder → AI / Rewrite with AI.** Add a single card or quiz, or rewrite a card: simpler, shorter, add an example, or translate it.

**How it works.** `server/ai.ts` calls OpenRouter's **free** models. The key is never sent to the browser.

Free models are often rate-limited, so each request tries models in order until one succeeds:

| Order | Model | Why it's in this position (benchmarked Sep 2026) |
|---|---|---|
| 1 | Nex N2.5 Mini | Most practical content, fastest (≈5–30s), uses a provider-enforced JSON schema |
| 2 | Nemotron 3 Super 120B | Strong content, ≈35s with low reasoning effort |
| 3 | Qwen 3.8 27B | Good quality, often rate-limited |
| 4 | Gemma 4 31B | Good writer, often rate-limited |
| 5 | Dots 3 Note | Reliable but slow (≈75s) |
| 6 | OpenRouter free router | Last resort |

The server also repairs broken JSON and fixes formatting quirks (such as bullets crammed onto one line or headings that repeat the title). It also checks every quiz answer before a course reaches the manager.

Free models change often. To change the order without touching code, set `OPENROUTER_MODELS` in `.env.local`. The free tier allows 1,000 requests per day on this account.

**Production.** In dev and `vite preview`, the AI routes run inside the Vite server (`server/vitePlugin.ts`). When you deploy, run `handleAI()` from `server/ai.ts` in a serverless function (Vercel, Netlify or Cloudflare) at `/api/ai/course` and `/api/ai/lesson`, and set `OPENROUTER_API_KEY` as a secret there. Also add manager authentication and per-user rate limits so the endpoint can't be misused.

## Email (invites & reminders)

Email is sent from the server (`server/email.ts`), never from the browser. Set up **one** provider in `.env.local` (see `.env.example`) and restart:

- **Resend:** `RESEND_API_KEY` + `EMAIL_FROM`
- **SMTP:** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` + `EMAIL_FROM`. This works with Google Workspace (use an App Password), Microsoft 365, SendGrid and others.

The **From** address must be on a domain the provider has verified (for example `crew@onlocalai.com`), or messages will bounce or go to spam.

**Safeguards:**
- The server writes each message from a fixed template.
- Links must point to this app's `/join` page.
- Names can't inject email headers.
- There's a cap of 300 emails per hour.

**Without email set up,** invites still add the person, and the page offers "Copy invite" and "Open in email app" instead. The app never says an email was sent unless the provider accepted it.

**Limitation:** crew data is still stored in each browser (see Path to production). An invitee who opens their link on their own phone gets the email and the sign-up page, but their sign-up only reaches the manager's crew list once there's a shared backend.

## Company profile

**Company profile** in the manager sidebar holds the crew manager's legal company name, address, email and phone, plus the name and title of the person who signs for the company. It appears on everything crew sign:

- **Documents.** Document text uses placeholders: `{{company}}`, `{{company_address}}`, `{{company_email}}`, `{{company_phone}}`, `{{manager}}`. The Paperwork editor has buttons to insert them and a live preview. A signed document keeps the company name it was signed under.
- **Contracts.** The profile fills the PDF's Client name and address. Every page gets a company letterhead, and the signature certificate names the issuing company. Saving the profile updates every contract **nobody has signed yet**; signed contracts are never changed.
- Until a manager saves their profile, the dashboard shows a reminder.

## Contracts

**Contracts** in the manager portal uses `public/contracts/event-planning-service-contract.pdf`, a fillable template from eSign. `src/lib/contractPdf.ts` fills its 30 form fields directly, so the downloaded document is the real template and not a copy of it.

1. **Create.** Pick a crew member, and optionally an event. Dates, services, role and hourly rate are filled in from the event and their shift. The form follows the PDF's numbered sections.
2. **Send.** Sending is blocked until the required fields are complete (for example, the governing state).
3. **Sign.** Either party can sign first, by drawing or typing. The company's signature records the named person signing on its behalf. Once anyone signs, the terms lock. To change anything, void the contract and duplicate it.
4. **Download.** Before both parties have signed, the PDF is a watermarked draft that stays fillable, so it can also be completed offline. Once both have signed, the PDF is locked and gets page 6: a signature certificate with who signed, when, how, and a SHA-256 fingerprint showing both parties signed identical terms. A blank template is also available.

Limitations: text uses the PDF's standard fonts, so characters outside Western European alphabets (for example Chinese or Arabic names) print as "?". Embedding a Unicode font would fix this. The e-signature flow records intent, consent and an audit trail, but check it meets the e-signature rules where you operate before relying on it.

## Tech

- React 19, TypeScript, Vite, Tailwind CSS v4
- Zustand for state, saved to `localStorage` so the demo keeps working without a backend
- `qrcode.react` for invite and check-in QR codes, `lucide-react` for icons

## Code map

```
src/
  types.ts              data model (Course, Role, Staff, EventItem, …)
  store.ts              all state + actions (progress, badges, rostering)
  lib/readiness.ts      the readiness engine: what each person still needs
  lib/badges.ts         badges + levels
  data/courses.ts       real training content + template library
  data/seed.ts          demo roles, docs, certs, crew, events
  pages/admin/*         manager portal
  pages/worker/*        crew mobile app
```

## Path to production

This is a working front-end prototype. Before real use it needs:

1. **Backend + auth.** Replace the Zustand store actions with API calls (Supabase, Firebase, or Postgres + a Node API). Add manager SSO and passwordless SMS or magic-link login for crew.
2. **Real notifications.** Nudges and invites are simulated. Connect Twilio (SMS), Resend or SendGrid (email), and web push.
3. **File storage.** Certificate uploads currently store only the file name. Use S3 or R2 with signed URLs.
4. **Legally robust e-sign.** Save a PDF of each signed document with an audit trail (IP, device, hash), or integrate DocuSign or Dropbox Sign.
5. **Payroll and tax.** Collect tax and bank details through Gusto, Deel or Rippling APIs rather than storing them yourself.
6. **AI upgrades.** Accept SOP PDF/Word uploads (not just pasted text), auto-translate whole courses into each crew member's language, and consider a paid model for safety-critical content.
7. **Translation.** Automatically translate courses into each crew member's preferred language.
8. **Camera QR scanning** for supervisor check-in, and **PWA/offline** support for venues with poor signal.
