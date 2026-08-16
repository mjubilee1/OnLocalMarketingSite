# Product Marketing Context

**Document version:** v1
**Last updated:** 2026-08-16

> Foundational positioning for OnLocalAI. Every marketing skill (cold-email, ai-seo, launch, cro, copywriting, social, etc.) reads this file first. Keep it current — it is the single source of truth for product, audience, and voice.

## Product Overview
**One-liner:** Private, on-premises AI for your whole team — knowledge, training, helpdesk, onboarding, and timesheets, running entirely on your own computer.
**What it does:** OnLocalAI is a native desktop app (Windows & macOS) that gives a company a full AI workspace without sending a single byte to the cloud. It answers questions grounded in your own policies and docs (with citations), turns documents into interactive training, runs an AI helpdesk with SLAs, tracks onboarding milestones, and logs timesheets — all powered by customized open-source models running locally.
**Product category:** On-premises / private AI workspace for teams (the "shelf": local AI, private AI assistant, self-hosted AI, on-prem knowledge base + helpdesk).
**Product type:** Desktop software (self-hosted). Bundled engine — no external accounts, API keys, or telemetry.
**Business model:** TBD — early access, invite-only, code-gated download. Likely per-company / per-seat license or flat on-prem license. **Open decision — see marketing plan §Revenue.**

## Target Audience
**Target companies:** (1) **Privacy-regulated SMBs** — legal, healthcare, accounting/finance, and similar firms that legally or contractually cannot put client data into cloud AI. (2) **SMBs generally** — 10–200 employees that want AI for knowledge/onboarding/support but are wary of cloud data leakage and per-seat cloud-AI bills.
**Decision-makers:** Owner / founder / managing partner (SMB), Operations lead / COO, IT manager or MSP (technical gatekeeper), Compliance / office manager (regulated firms).
**Primary use case:** "Give our team AI for company knowledge, onboarding, training, and support — without our data ever leaving our machines."
**Jobs to be done:**
- Answer employee questions from our own policies/SOPs without exposing them to the cloud
- Onboard and train new hires faster without senior staff being interrupted
- Run internal support (IT/HR helpdesk) with AI drafting grounded replies
**Use cases:**
- A law/accounting firm that can't use ChatGPT on client matters but wants AI on its internal knowledge
- A clinic/practice needing HIPAA-safe internal Q&A and staff onboarding
- An SMB replacing a stack of SaaS tools (wiki + LMS + helpdesk + timesheets) with one private app
- An MSP deploying a private AI assistant for clients in regulated verticals

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Owner / Managing Partner (Decision Maker + Financial Buyer) | Risk, cost, staff productivity | "We can't use cloud AI, but we're falling behind" | AI advantage with zero data-leaving-the-building risk |
| Operations / Office Manager (Champion + User) | Onboarding speed, fewer repetitive questions | Tribal knowledge, slow ramp, constant interruptions | Self-serve knowledge, training, and onboarding in one app |
| IT Manager / MSP (Technical Influencer) | Security, control, no telemetry | Shadow AI, compliance exposure | Runs 100% local, offline-capable, nothing phones home |
| Compliance / Legal (Gatekeeper) | Data residency, auditability | Cloud AI = unacceptable data exposure | On-prem by architecture, department-scoped access |

## Problems & Pain Points
**Core problem:** Teams want AI for internal knowledge, training, and support — but cloud AI tools (ChatGPT, Copilot, Glean, Notion AI) require sending sensitive company and client data off-site, which is a compliance, confidentiality, or trust dealbreaker.
**Why alternatives fall short:**
- Cloud AI assistants leak data off-premises and add per-seat cloud costs
- Point tools (wiki + LMS + helpdesk + timesheets) are fragmented and none are AI-native
- "Just don't use AI" leaves the team slower than competitors and invites shadow-AI risk
**What it costs them:** Slow onboarding, senior staff constantly answering repeat questions, compliance exposure, tool sprawl and subscriptions, and the strategic cost of falling behind on AI.
**Emotional tension:** Fear of a data breach or compliance violation; frustration at being locked out of the AI wave; anxiety that employees are already pasting confidential data into ChatGPT.

## Competitive Landscape
**Direct:** Local LLM runners (LM Studio, Jan, GPT4All, Msty, Private LLM) — falls short because they're single-user chat apps, not a team workspace with knowledge access-control, training, helpdesk, onboarding, and timesheets.
**Secondary:** Cloud "enterprise-private" AI (ChatGPT Enterprise, Microsoft 365 Copilot, Glean, Guru, Notion AI) — falls short because data still leaves the building; per-seat cloud pricing; not truly air-gappable; overkill/expensive for SMBs.
**Indirect:** The stitched-together status quo (SharePoint/Confluence + an LMS + Zendesk + Harvest) or "let people quietly use ChatGPT" — falls short because it's fragmented, not AI-native, and the shadow-AI path is a compliance landmine.

## Differentiation
**Key differentiators:**
- 100% on-premises — model, vector index, and files never leave the machine; works offline/air-gapped
- All-in-one — knowledge Q&A, advanced document workspace + reports, training, AI helpdesk, onboarding, timesheets in one install
- No cloud accounts, no API keys, no telemetry, no per-token bills
- Department-scoped retrieval enforced at the engine, not just requested in a prompt
- Runs on customized open-source models — no vendor lock-in
**How we do it differently:** A self-contained desktop app bundles the whole engine; nothing is a cloud service.
**Why that's better:** You get the AI productivity win with none of the data-exposure risk or recurring cloud cost.
**Why customers choose us:** They *can't* use cloud AI (compliance/confidentiality) but still need the capability — OnLocalAI is the only all-in-one team option that keeps everything local.

## Objections
| Objection | Response |
|-----------|----------|
| "Local models aren't as good as GPT-4." | For grounded Q&A over *your* documents, the model matters less than retrieval quality — and you trade a bit of raw capability for total privacy you can't get from cloud AI. You can also swap in stronger open models as they ship. |
| "Do we need powerful/expensive hardware?" | It runs on modern business machines; you choose the model size to fit your hardware. No GPU cluster required for core Q&A. |
| "How do we trust it's really private?" | Nothing leaves the machine and there's no telemetry — you can literally unplug the network and it keeps working. Verifiable, not a promise. |
| "Is this hard to set up/maintain?" | It's a single desktop install — no servers to stand up, no DevOps. If you can install an app, you can run it. |
| "We already pay for [Confluence/Zendesk/etc.]." | OnLocalAI consolidates several of those into one private app, and adds the AI layer none of them have natively. |

**Anti-persona:** Consumers/hobbyists wanting a ChatGPT replacement for creative work; cloud-native orgs with no privacy constraints who only want maximum model quality; teams unwilling to run anything locally.

## Switching Dynamics
**Push:** Compliance won't allow cloud AI; fear employees are already pasting confidential data into ChatGPT; onboarding/knowledge is painfully manual.
**Pull:** Finally get AI for the team with zero data-exposure risk, in one app, at a fixed local cost.
**Habit:** They're used to their current wiki/helpdesk/LMS stack and to "we just don't use AI."
**Anxiety:** "Will local models be good enough?" "Is setup a hassle?" "Can I trust an early-stage product with our workflow?" (→ address with design-partner support, offline verifiability, and clear early-access framing.)

## Customer Language
**How they describe the problem:**
- "We can't put client data into ChatGPT."
- "Compliance won't let us use cloud AI."
- "Onboarding takes forever / it's all tribal knowledge."
- "I'm worried our people are already using AI with our data."
**How they describe us:**
- "AI that runs on our own computers."
- "Private ChatGPT for our firm that doesn't send anything out."
**Words to use:** private, on-premises, local, offline, your machine, nothing leaves, no cloud, grounded, citations, department-scoped, air-gapped, self-contained.
**Words to avoid:** "send to the cloud," "upload your data," raw model brand names (say "customized open-source models"), hype ("revolutionary," "next-gen"), jargon for its own sake.
**Glossary:**
| Term | Meaning |
|------|---------|
| On-premises / on-prem | Runs on the customer's own hardware, not a vendor's cloud |
| Grounded answer | AI answer restricted to the company's own documents, with citations |
| Department-scoped retrieval | Access control enforced so people only see docs they're allowed to |
| Air-gapped | Works with no internet connection at all |

## Brand Voice
**Tone:** Professional, trustworthy, plainspoken. Confident without hype.
**Style:** Direct and concrete; technically credible; privacy-first; explains tradeoffs honestly.
**Personality:** Private · Grounded · Practical · Trustworthy · No-nonsense.

## Proof Points
**Metrics:** *None public yet (early access). Open decision — collect design-partner results ASAP: onboarding time saved, tickets deflected, questions answered locally.*
**Customers:** Early-access / design partners TBD. **Do not fabricate logos or testimonials.**
**Testimonials:** TBD from design partners.
**Value themes:**
| Theme | Proof (to build) |
|-------|------|
| Total privacy | Runs offline; no telemetry; verifiable by unplugging the network |
| All-in-one | 8 modules in one desktop install |
| Fast onboarding | Design-partner before/after ramp time (to capture) |
| Lower cost | No per-seat cloud-AI fees / consolidates tools (to quantify) |

## Goals
**Business goal:** Grow early-access adoption and land design partners in privacy-regulated SMBs; validate positioning and pricing.
**Conversion action (90-day focus = visibility/audience):** Grow an owned audience (email/waitlist + founder following) and drive qualified early-access downloads; secondary: booked design-partner conversations.
**Current metrics:** Pre-revenue, early access, invite-only. Website live with GA4 (G-5R4PQNJ3FC). CAC unknown (organic/founder-led). Team = 2 founders (Montrell, Subash), no marketing hire, ~<$500/mo budget.

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 (2026-08-16) — Initial context, auto-drafted from the product README and website; ICP set to privacy-regulated SMBs + general SMBs, bootstrapped/organic stage.
