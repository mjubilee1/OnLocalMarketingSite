import type { Course, Lesson, Question } from '../types';

let n = 0;
const lid = () => `l${++n}`;
const qid = () => `q${++n}`;

const card = (title: string, body: string): Lesson => ({ id: lid(), title, kind: 'card', body });
const quiz = (title: string, questions: Omit<Question, 'id'>[]): Lesson => ({
  id: lid(),
  title,
  kind: 'quiz',
  questions: questions.map((q) => ({ ...q, id: qid() })),
});
const q = (prompt: string, options: string[], correct: number, explanation?: string): Omit<Question, 'id'> => ({
  prompt,
  options,
  correct,
  explanation,
});

const course = (c: Omit<Course, 'published' | 'passingScore'> & Partial<Pick<Course, 'published' | 'passingScore'>>): Course => ({
  published: true,
  passingScore: 80,
  ...c,
});

export const COURSES: Course[] = [
  course({
    id: 'c-welcome',
    title: 'Welcome to the Crew',
    description: 'Who we are, how shifts work, how you get paid, and what great looks like on event day.',
    category: 'Onboarding',
    emoji: '👋',
    estMinutes: 5,
    points: 50,
    lessons: [
      card(
        'Welcome aboard!',
        `We run the events people remember — festivals, conferences, sports and private functions.

You are the face of every one of them. Guests won't remember the stage design, but they will remember the person who helped them find their seat.

## What you'll get from us
- Flexible shifts you pick in the app
- Pay every week, straight to your account
- Training that takes minutes, not days
- A crew that has your back`,
      ),
      card(
        'How a shift works',
        `- **Before:** read your event briefing in the app — venue, call time, dress code and your supervisor.
- **Arrive:** be at the crew entrance at your call time (not your shift start). Show your check-in pass.
- **Briefing:** your supervisor runs a 10-minute team huddle. Ask questions!
- **During:** stay in your zone, keep your radio or phone on, take breaks when rostered.
- **After:** sign out with your supervisor before you leave.`,
      ),
      card(
        'Our 3 golden rules',
        `## 1. Safety first, always
If something looks unsafe, stop and tell a supervisor. No task is worth an injury.

## 2. Guests are our guests
Smile, make eye contact, and never say "that's not my job" — walk them to someone who can help.

## 3. Show up, or speak up
If you can't make a shift, tell us **at least 24 hours** before in the app. No-shows affect the whole crew.`,
      ),
      quiz('Quick check', [
        q('What time should you arrive at the venue?', ['Your shift start time', 'Your call time', '15 minutes after doors open'], 1, 'Call time is always earlier than shift start so there is time for check-in and the team briefing.'),
        q("You can't make a shift. What should you do?", ['Just not turn up', 'Message a friend on the crew', 'Release the shift in the app at least 24h before'], 2),
        q('A guest asks you something outside your role. You should…', ['Say "not my job"', 'Walk them to someone who can help', 'Ignore them politely'], 1),
      ]),
    ],
  }),
  course({
    id: 'c-safety',
    title: 'Crowd Safety & Emergencies',
    description: 'Spot the warning signs, know the evacuation plan, and respond calmly when things go wrong.',
    category: 'Health & Safety',
    emoji: '🚨',
    estMinutes: 8,
    points: 80,
    lessons: [
      card(
        'Reading a crowd',
        `Most incidents give warning signs first. Keep scanning your zone for:

- **Density:** people can't move freely, or are being pushed
- **Pinch points:** gates, stairs and bar queues backing up
- **Distress:** someone pale, unsteady, or being carried by friends
- **Hazards:** spilled drinks, trailing cables, blocked exits

If you see it, **report it immediately** on the radio or to your supervisor. Early reports prevent emergencies.`,
      ),
      card(
        'Emergency codes',
        `We use calm, coded language on radio so guests are not alarmed.

- **Code Red** — fire or smoke
- **Code Blue** — medical emergency
- **Code Yellow** — lost child or vulnerable person
- **Code Black** — security threat
- **Code Green** — all clear

When you call a code, always give your **exact location** ("Code Blue, Gate 3, left side of the bar").`,
      ),
      card(
        'Evacuations',
        `If an evacuation is announced:

- Stay calm and use a **clear, loud, confident** voice
- Direct guests to the **nearest safe exit** — not the one they came in
- Never use lifts
- Help anyone with reduced mobility or ask a colleague to
- Go to your **assembly point** and report to your supervisor so we can account for every crew member

Your event briefing always shows the exits and assembly point for your zone.`,
      ),
      quiz('Safety check', [
        q('Which radio code means a medical emergency?', ['Code Red', 'Code Blue', 'Code Yellow', 'Code Green'], 1),
        q('What must you always include when calling a code?', ['Your name', 'Your exact location', 'The time'], 1, 'Responders need to know exactly where to go.'),
        q('During an evacuation, guests should use…', ['The entrance they came in', 'The nearest safe exit', 'The lifts, to be quick'], 1),
        q('A bar queue is starting to crush against a barrier. You should…', ['Wait and see', 'Report it immediately', 'Close the bar without telling anyone'], 1),
      ]),
    ],
  }),
  course({
    id: 'c-alcohol',
    title: 'Responsible Alcohol Service',
    description: 'Checking ID, spotting intoxication, and refusing service politely and legally.',
    category: 'Compliance',
    emoji: '🍹',
    estMinutes: 10,
    points: 100,
    lessons: [
      card(
        'Your legal responsibility',
        `When you serve alcohol, **you** are personally responsible for who you serve. Serving a minor or an intoxicated guest can mean fines for you and the venue losing its licence.

## The rule
- **Check ID** for anyone who looks under 25
- **Refuse service** to anyone who is intoxicated
- **Never** serve someone buying for a person you've refused`,
      ),
      card(
        'Checking ID',
        `Accepted ID: driver's licence, passport, or government photo ID card.

- Hold it — don't let them wave it
- Check the **photo** matches the face
- Check the **date of birth** and the **expiry date**
- Feel for raised edges, peeling or lamination bubbles

If in doubt, **refuse politely** and call your bar supervisor.`,
      ),
      card(
        'Signs of intoxication',
        `Look for a combination of signs:

- Slurred or loud speech, repeating themselves
- Unsteady on their feet, bumping into things
- Glassy eyes, difficulty focusing
- Fumbling money or their phone
- Aggressive or overly friendly behaviour`,
      ),
      card(
        'Refusing service — the right way',
        `Refusing can feel awkward. Keep it **short, friendly, firm**:

"I'm sorry, I'm not able to serve you any more alcohol tonight. Can I get you a water or a soft drink?"

- Don't argue or lecture
- Don't blame the rules or your manager — own it
- Offer water or food
- Tell your supervisor so the whole bar team knows`,
      ),
      quiz('Alcohol service check', [
        q('You should check ID for anyone who looks under…', ['18', '21', '25'], 2),
        q('Which of these is NOT a sign of intoxication?', ['Slurred speech', 'Asking for the menu', 'Unsteady on feet', 'Fumbling with money'], 1),
        q('A guest you refused sends a friend to buy them a drink. You…', ['Serve the friend', 'Refuse the friend too', 'Serve a smaller drink'], 1, 'Secondary supply to an intoxicated person is also an offence.'),
        q('The best way to refuse service is to…', ['Blame your manager', 'Be short, friendly and firm, and offer water', 'Ignore them until they leave'], 1),
      ]),
    ],
  }),
  course({
    id: 'c-food',
    title: 'Food Safety Basics',
    description: 'Hygiene, temperatures and allergens — everything you need to handle food safely.',
    category: 'Compliance',
    emoji: '🥗',
    estMinutes: 7,
    points: 70,
    lessons: [
      card(
        'Personal hygiene',
        `- Wash hands for **20 seconds** before starting, after breaks, after the bathroom, and after touching your face or phone
- Hair tied back, no jewellery except a plain band
- Cover cuts with a **blue** waterproof plaster
- Feeling sick? **Don't come in** — tell us in the app`,
      ),
      card(
        'Temperature danger zone',
        `Bacteria grow fastest between **5°C and 60°C** (41°F–140°F).

- Keep cold food **cold** (below 5°C)
- Keep hot food **hot** (above 60°C)
- Food left in the danger zone for **over 2 hours** must be thrown away`,
      ),
      card(
        'Allergens',
        `Allergic reactions can be fatal. When a guest mentions an allergy:

- Take it seriously — **always**
- Check the allergen sheet or ask the chef. **Never guess.**
- Use clean utensils and plates
- If unsure, say so and find someone who knows

Common allergens: peanuts, tree nuts, milk, eggs, fish, shellfish, soy, wheat/gluten, sesame.`,
      ),
      quiz('Food safety check', [
        q('The temperature danger zone is…', ['0–5°C', '5–60°C', '60–100°C'], 1),
        q('A guest asks if a dish contains nuts and you are not sure. You…', ['Say probably not', 'Check the allergen sheet or ask the chef', 'Suggest they pick it off'], 1),
        q('How long should you wash your hands?', ['5 seconds', '20 seconds', '2 minutes'], 1),
      ]),
    ],
  }),
  course({
    id: 'c-guest',
    title: 'Guest Service Excellence',
    description: 'The small habits that turn a good event into a great one.',
    category: 'Customer Service',
    emoji: '🤝',
    estMinutes: 6,
    points: 60,
    lessons: [
      card(
        'The 10-5 rule',
        `- At **10 feet**: make eye contact and smile
- At **5 feet**: say hello

It sounds simple, but it's the single biggest thing guests notice.`,
      ),
      card(
        'Handling complaints — LAST',
        `- **L**isten — let them finish, don't interrupt
- **A**pologise — "I'm sorry that happened"
- **S**olve — fix it, or find someone who can
- **T**hank — "Thanks for letting us know"

Never take it personally. If a guest becomes abusive, step away and call a supervisor.`,
      ),
      card(
        'Know your venue',
        `Before doors open, find out:

- Nearest toilets, first aid and water points
- Exits and the accessible routes
- Where lost property and the info desk are
- Set times or session times for the day

Your event briefing has most of this — read it on the way in.`,
      ),
      quiz('Service check', [
        q('In the 10-5 rule, what do you do at 5 feet?', ['Smile', 'Say hello', 'Wave'], 1),
        q('What does the "S" in LAST stand for?', ['Smile', 'Solve', 'Stop'], 1),
      ]),
    ],
  }),
  course({
    id: 'c-ticket',
    title: 'Ticket Scanning & Entry',
    description: 'Run a fast, friendly and secure entry gate.',
    category: 'Operations',
    emoji: '🎟️',
    estMinutes: 5,
    points: 50,
    lessons: [
      card(
        'Using the scanner',
        `- Open the scanner app and log in with your **gate code** from the briefing
- Ask guests to have tickets ready **and screen brightness up**
- **Green** = let them in. **Red** = don't argue — send them to the box office
- **Amber (already scanned)** = call a supervisor; it may be a duplicate ticket`,
      ),
      card(
        'Keeping the queue moving',
        `- Walk the queue before doors: "Tickets ready, bags open please!"
- One scanner per lane, one person for wristbands
- If the line stops moving, radio for help **early**`,
      ),
      quiz('Entry check', [
        q('The scanner shows red. You should…', ['Let them in anyway', 'Send them to the box office', 'Scan it five more times'], 1),
        q('The scanner says "already scanned". You…', ['Call a supervisor', 'Refuse entry and walk away', 'Let them in'], 0),
      ]),
    ],
  }),
  course({
    id: 'c-manual',
    title: 'Manual Handling & Load-in',
    description: 'Lift, carry and build safely during set-up and pack-down.',
    category: 'Health & Safety',
    emoji: '📦',
    estMinutes: 6,
    points: 60,
    lessons: [
      card(
        'Safe lifting',
        `- **Plan:** is it too heavy? Can you use a trolley? Do you need a partner?
- **Position:** feet shoulder-width, bend your knees not your back
- **Grip:** hold the load close to your body
- **Lift:** smooth, no twisting — turn with your feet`,
      ),
      card(
        'PPE on site',
        `During load-in and load-out you must wear:

- **Hi-vis vest**
- **Steel-toe boots**
- **Gloves** when handling staging, barriers or cables
- **Hard hat** anywhere there is overhead work`,
      ),
      quiz('Load-in check', [
        q('When lifting, you should bend your…', ['Back', 'Knees', 'Neck'], 1),
        q('Which PPE is required during load-in?', ['Hi-vis and steel-toe boots', 'Just a smile', 'Sunglasses'], 0),
      ]),
    ],
  }),
  course({
    id: 'c-security',
    title: 'Security Steward Essentials',
    description: 'Bag checks, conflict de-escalation and working with police and medics.',
    category: 'Compliance',
    emoji: '🛡️',
    estMinutes: 9,
    points: 90,
    lessons: [
      card(
        'Bag searches',
        `- Always **ask permission**: "Can I check your bag please?"
- Guest opens the bag, not you
- Use a torch — don't put your hands in blind
- Prohibited items go in the **amnesty bin**; log anything serious`,
      ),
      card(
        'De-escalation',
        `- Keep a **calm, low voice** and open body language
- Stand at an angle, outside arm's reach
- Use their name, acknowledge their feelings
- Give choices, not ultimatums
- **Never** get physical unless you're in immediate danger — call for back-up`,
      ),
      quiz('Security check', [
        q('During a bag search, who opens the bag?', ['You', 'The guest', 'The police'], 1),
        q('A guest is getting angry. The best first step is…', ['Raise your voice to take control', 'Stay calm and acknowledge how they feel', 'Physically remove them'], 1),
      ]),
    ],
  }),
  course({
    id: 'c-access',
    title: 'Accessibility & Inclusive Service',
    description: 'Welcome every guest — visible and invisible disabilities, assistance animals and accessible routes.',
    category: 'Customer Service',
    emoji: '♿',
    estMinutes: 5,
    points: 50,
    lessons: [
      card(
        'Ask, don’t assume',
        `- Offer help, then **wait** for the answer — "Can I help you find anything?"
- Speak directly to the guest, not their companion
- Not all disabilities are visible. A **sunflower lanyard** means someone may need extra time or support.
- Assistance animals are always allowed — don't pet them, they're working.`,
      ),
      quiz('Inclusion check', [
        q('A guest wears a sunflower lanyard. This means…', ['They are VIP', 'They may have a hidden disability', 'They are crew'], 1),
        q('When should you pet an assistance dog?', ['Always, they love it', 'Never while it is working', 'Only if it looks friendly'], 1),
      ]),
    ],
  }),
];
