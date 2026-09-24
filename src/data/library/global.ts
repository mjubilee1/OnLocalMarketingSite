/**
 * Event best-practice templates for US event crews.
 * Facts come from the linked sources (checked 2026-09-23). Where research flagged a figure as
 * single-source or unverified it has been left out rather than taught.
 */
import { card, q, quiz, template } from './build';
import type { LibraryCourse } from './types';

export const GLOBAL_COURSES: LibraryCourse[] = [
  template(
    {
      id: 'lib-crowd-crush',
      title: 'Crowd Crush: Spot It, Stop It',
      description: 'How dangerous crowd density builds, the warning signs, and why reporting early saves lives.',
      category: 'Health & Safety',
      emoji: '🫸',
      estMinutes: 7,
      lessons: [
        card(
          'Why crowds become deadly',
          `In a crowd crush, people rarely die from being trampled. They die from **compressive asphyxia**: the crowd presses on them so hard they can't breathe, even while standing up.

It builds quietly. By the time people are screaming, it may already be too late to move them. That's why **your early report matters more than anything else you do**.`,
        ),
        card(
          'The density numbers',
          `Crowd scientists measure risk in **people per square meter (m²)**:

- **2 per m²**: comfortable, people move freely
- **4 per m²**: normal for a slow-moving queue
- **5 per m²**: the upper limit for a standing crowd
- **About 6 per m² and up**: the crowd can start moving in waves, and people lose control of where they go

During the 2022 Itaewon crush in Seoul, the alley averaged about 7.5 people per m² and peaked near 10.`,
        ),
        card(
          'Warning signs to watch for',
          `- Two flows of people **meeting head-on** in a narrow space (Itaewon's alley was under 4 m wide)
- People being **lifted off their feet** or pulled out over the top of the crowd
- Screaming, calls for help, or people fainting
- The crowd **moving in waves** instead of standing still
- More and more guests telling staff it's too packed

At Itaewon, the first overcrowding call to police came about 3.5 hours before the crush.`,
        ),
        card(
          'Report early, stop the show',
          `At Astroworld (2021), calls to stop the show started minutes into the headline set, but it carried on for about an hour. Nobody was clearly in charge of stopping it. 10 people died.

## Your job
- Radio Control **the moment** you see warning signs. Give your **exact location**. Don't wait until you're sure.
- Use your event's show-stop code: **[your show-stop code]**
- Help relieve pressure: stop more people entering, open extra exits, redirect the flow
- **Never push back** against a dense crowd, and never tell people to push forward`,
        ),
        quiz('Crowd safety check', [
          q('What causes most deaths in a crowd crush?', ['Being trampled', 'Being unable to breathe because of pressure', 'Heat exhaustion'], 1, 'Compressive asphyxia: people are squeezed so hard they cannot breathe.'),
          q('Roughly what density is the upper limit for a standing crowd?', ['2 people per m²', '5 people per m²', '10 people per m²'], 1),
          q('You see people being lifted off their feet near the barrier. You should…', ['Wait to see if it gets worse', 'Radio Control immediately with your exact location', 'Tell the crowd to push back'], 1),
          q('What was a key lesson from Astroworld?', ['Crowds sort themselves out', 'Everyone needs a clear, fast way to stop the show', 'Security should stop reporting to avoid panic'], 1),
        ]),
      ],
    },
    {
      kind: 'safety',
      regions: ['US'],
      roles: ['r-security', 'r-usher', 'r-ticket'],
      legal: 'In the US, NFPA 101 (Life Safety Code), where adopted, requires trained crowd managers at large assembly occupancies, at a ratio of 1 per 250 people. This course is awareness training, not crowd manager certification.',
      customise: 'your show-stop code word and who is allowed to call it',
      sources: [
        { label: 'G. Keith Still: crowd density', url: 'https://www.gkstill.com/Support/crowd-density/CrowdDensity-1.html' },
        { label: 'G. Keith Still: crowd collapse & asphyxia', url: 'https://www.gkstill.com/CV/Modelling/CrowdCollapse.html' },
        { label: 'PLOS One: Itaewon crowd crush analysis', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11244771/' },
        { label: 'Texas Task Force on Concert Safety (2022)', url: 'https://gov.texas.gov/uploads/files/press/2022_Report_Texas_Task_Force_on_Concert_Safety.pdf' },
        { label: 'Houston Police Astroworld findings', url: 'https://www.houstonlanding.org/six-takeaways-from-the-houston-police-investigation-of-the-travis-scott-astroworld-concert/' },
      ],
    },
  ),

  template(
    {
      id: 'lib-weather',
      title: 'Lightning, Wind & Heat: Weather Stops',
      description: 'The 30-minute lightning rule, what counts as safe shelter, and your part in a weather stop.',
      category: 'Health & Safety',
      emoji: '⛈️',
      estMinutes: 6,
      lessons: [
        card(
          'When thunder roars, go indoors',
          `Lightning can strike **up to 10 miles** from a storm, often before it rains. If you can hear thunder, you're close enough to be struck.

- Stay sheltered until **30 minutes after the last thunder**
- Every new rumble **restarts the 30-minute clock**`,
        ),
        card(
          "What is (and isn't) safe shelter",
          `**Safe:** a substantial enclosed building, or a hard-topped vehicle with the windows up.

**Not safe:** tents, gazebos, large tents, open-sided shelters, stages, and trees.

When a lightning stop is called, guide guests to the shelters named in your briefing: **[your shelter locations]**.`,
        ),
        card(
          'Wind and temporary structures',
          `Stages, screens, large tents and banners each have a **wind limit** set by their engineers. The event's wind plan says when to clear the area around them.

In 2011, a gust of about 59 mph brought down the stage at the Indiana State Fair and 7 people died. Investigators found the structure could fail at much lower wind speeds.

If you're told to clear the area under or around a structure, **do it straight away**, even if the weather looks calm where you're standing.`,
        ),
        card(
          'Heat index',
          `The US National Weather Service warns by "heat index", which is how hot it feels once humidity is counted:

- **80–90°F:** caution
- **90–103°F:** extreme caution
- **103–124°F:** danger
- **125°F and above:** extreme danger

Full sun can make it feel up to 15°F hotter. Drink water, take your breaks in the shade, and watch your crew-mates for signs of heat illness.`,
        ),
        quiz('Weather check', [
          q('How long should you wait after the last thunder before going back outside?', ['5 minutes', '15 minutes', '30 minutes'], 2, 'And every new rumble of thunder restarts the clock.'),
          q('Which of these is safe shelter from lightning?', ['A large large tent', 'A hard-topped car with the windows up', 'Under a tree'], 1),
          q('Control tells you to clear the area in front of a stage, but it isn’t windy where you are. You…', ['Wait until you feel the wind', 'Clear the area straight away', 'Ask guests to decide'], 1),
        ]),
      ],
    },
    {
      kind: 'safety',
      regions: ['US'],
      roles: ['all'],
      customise: 'your weather shelter locations and your event’s lightning/wind stop triggers',
      sources: [
        { label: 'NWS: outdoor lightning safety', url: 'https://www.weather.gov/rnk/outdoorslightning' },
        { label: 'NWS JetStream: lightning distance', url: 'https://www.weather.gov/source/zhu/ZHU_Training_Page/lightning_stuff/lightning2/lightning_safety.html' },
        { label: 'IStructE: temporary demountable structures', url: 'https://www.istructe.org/resources/guidance/temporary-demountable-structures-design-use/' },
        { label: 'Thornton Tomasetti: Indiana State Fair collapse', url: 'https://www.thorntontomasetti.com/news/indiana-state-fair-collapse-incident-anatomy-failure' },
        { label: 'NWS heat index', url: 'https://www.weather.gov/safety/heat-tools' },
      ],
    },
  ),

  template(
    {
      id: 'lib-welfare',
      title: 'Festival Welfare & Harm Reduction',
      description: 'Recognize a guest in trouble, put someone in the recovery position, and respond without judgement.',
      category: 'Welfare',
      emoji: '💚',
      estMinutes: 6,
      lessons: [
        card(
          'Spot a guest in trouble',
          `Get medical help **immediately** if someone is:

- Confused, or not making sense
- Very hot, flushed, or has stopped sweating
- Agitated, panicking, or having a fit
- Vomiting or collapsing
- **Getting worse** rather than better

Never leave them alone, and don't let their friends "sleep it off" for them. Radio for medics: **[your medical call sign]**.`,
        ),
        card(
          'Overheating and water',
          `Dancing in heat, especially after stimulant drugs like MDMA, can make body temperature rise dangerously.

But **drinking huge amounts of water** can also be dangerous: it can dilute the salt in the blood.

- Point people to water, shade and the chill-out or welfare area
- Encourage **regular sips**, not downing bottles
- Anyone who seems overheated goes to medical`,
        ),
        card(
          'The recovery position',
          `For someone who is **unresponsive but breathing**:

- Put the arm nearest you out at a right angle
- Place the back of their other hand against their cheek
- Bend their far knee, and roll them towards you onto their side
- Tilt the head back to keep the airway open
- **Call for medics**, and stay with them. If you're waiting a long time, turn them to the other side after 30 minutes.`,
        ),
        card(
          'No judgement, just help',
          `Research at music festivals found that many people would go to welfare first, but **fear of getting in trouble** stopped some of them. Many only found out where welfare was once they were already on site.

- Be calm and kind; never lecture
- Focus on safety, not blame
- **Know where welfare is** so you can walk people there: [welfare location]`,
        ),
        quiz('Welfare check', [
          q('A guest is confused, very hot and getting worse. You should…', ['Give them lots of water to drink fast', 'Get medics immediately and stay with them', 'Let their friends look after them'], 1),
          q('The recovery position is for someone who is…', ['Unresponsive but breathing', 'Awake and talking', 'Not breathing'], 0, 'If someone is not breathing, call for medics and start CPR if you are trained.'),
          q('Why does being non-judgemental matter?', ['It doesn’t, rules are rules', 'People avoid asking for help if they fear trouble', 'It speeds up the queue'], 1),
        ]),
      ],
    },
    {
      kind: 'welfare',
      regions: ['US'],
      roles: ['all'],
      customise: 'your medical radio call sign and welfare tent location',
      sources: [
        { label: 'St John Ambulance: recovery position', url: 'https://www.sja.org.uk/first-aid-advice/recovery-position/' },
        { label: 'Harm Reduction Journal (2025): festival welfare study', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11929186/' },
        { label: 'Isle of Wight Council: preventing harm from drugs at festivals', url: 'https://www.iow.gov.uk/business-and-consumer/licensing-services/major-events/preventing-harm-from-drugs-at-festivals/' },
      ],
    },
  ),

  template(
    {
      id: 'lib-lost-child',
      title: 'Lost Children & Vulnerable People',
      description: 'The step-by-step procedure for a found child, a missing child report, and a safe handover.',
      category: 'Welfare',
      emoji: '🧒',
      estMinutes: 6,
      lessons: [
        card(
          'You find a child on their own',
          `- **Stay where you found them**. Parents usually come back to the last place they saw their child.
- Keep **two staff members** with the child at all times, never just one of you
- Wait about **10 minutes**, then take the child to the **welfare point**: [welfare / lost child point]
- **Never** take a child off site, or anywhere out of public view`,
        ),
        card(
          'Never say their name on the radio',
          `Open radio channels can be overheard. Anyone could claim to be the parent.

- Use your event's code: **[lost child code word]**
- Give a description (age, clothing), never the child's name
- Keep the child's details for the welfare team`,
        ),
        card(
          'A parent reports a missing child',
          `- Stay calm, and **keep the parent with you**: don't let them go searching alone
- Get a description: name, age, clothing, where they were last seen
- Radio Control straight away (again, no name on air)
- If the child isn't found in the first quick search, Control may close exits and call the police, as the event plan sets out`,
        ),
        card(
          'Handing a child back',
          `Only the welfare team hands children over, and only after checks:

- The adult shows **photo ID** and it matches what the child and records say
- The child clearly recognizes them
- **If in doubt, don't release the child.** Welfare will check further or call the police.

Everything gets written down: the description, the guardian's details, whether ID was checked, and the outcome. The same care applies to **vulnerable adults** who are lost or distressed.`,
        ),
        quiz('Safeguarding check', [
          q('You find a lost child. What do you do first?', ['Take them to the car park to look', 'Stay where you found them, with two staff', 'Announce their name over the radio'], 1),
          q('Why shouldn’t you say the child’s name on the radio?', ['It wastes airtime', 'Someone could overhear it and pretend to be the parent', 'Radios can’t say names'], 1),
          q('An adult comes to collect a child but has no ID and the child seems unsure. You…', ['Release the child to avoid a scene', 'Don’t release; welfare checks further or calls the police', 'Let the child decide'], 1),
        ]),
      ],
    },
    {
      kind: 'welfare',
      regions: ['US'],
      roles: ['all'],
      customise: 'your lost-child code word and the welfare/lost child point location',
      sources: [
        { label: 'Cambridge Safety Advisory Group: lost children & vulnerable persons procedure', url: 'https://www.cambridge.gov.uk/media/un5er05b/safety-advisory-group-lost-children-and-vulnerable-persons-procedure.pdf' },
        { label: 'The Purple Guide: safeguarding children & young people', url: 'https://www.thepurpleguide.co.uk/safeguarding-children-young-people' },
      ],
    },
  ),

  template(
    {
      id: 'lib-work-height',
      title: 'Working at Height & Load-in',
      description: 'Ladders, towers, MEWPs, exclusion zones and secondary safeties for production crew.',
      category: 'Health & Safety',
      emoji: '🪜',
      estMinutes: 6,
      lessons: [
        card(
          'Height is the last resort',
          `Before you climb, ask in this order:

- **Can it be done from the ground?** (lower the truss, use a pole tool)
- If not, use a **MEWP** (a powered access platform) or a **tower**
- Use a **ladder** only for short, low-risk jobs`,
        ),
        card(
          'Ladder rules',
          `- Set it at a **1-in-4 angle**: the base one foot out for every four feet of height (OSHA's rule for leaning ladders)
- Extend it **3 feet above** the landing if you're climbing onto a platform or roof
- Keep **three points of contact**: two feet and a hand, or two hands and a foot
- Never stand on the top step or top cap of a stepladder
- Don't overreach. Climb down and move the ladder instead.`,
        ),
        card(
          'Exclusion zones and secondary safeties',
          `- Set up an **exclusion zone** under any overhead work, and keep everyone out of it
- Every suspended light or piece of kit needs a **secondary safety** (a steel wire or chain) as well as its clamp
- In a **boom MEWP**, wear your harness clipped in: a jolt can throw you out (the "catapult effect")
- Only operate a MEWP if you're **trained and authorized** to`,
        ),
        quiz('Height check', [
          q('What should you consider first for a job at height?', ['A ladder', 'Whether it can be done from the ground', 'Standing on a flight case'], 1),
          q('Why wear a harness in a boom MEWP?', ['It’s optional', 'A jolt can catapult you out of the basket', 'To carry tools'], 1),
          q('What must every suspended light have?', ['A secondary safety wire or chain', 'Gaffer tape', 'A sticker'], 0),
        ]),
      ],
    },
    {
      kind: 'safety',
      regions: ['US'],
      roles: ['r-setup'],
      legal: 'OSHA requires ladders to be used safely (29 CFR 1926.1053) and only trained, authorized people to operate aerial lifts (1910.67 / 1926.453). Scissor lifts are treated as scaffolds (1926.454).',
      sources: [
        { label: '29 CFR 1926.1053: ladders', url: 'https://www.law.cornell.edu/cfr/text/29/1926.1053' },
        { label: '29 CFR 1910.67: aerial lifts', url: 'https://www.law.cornell.edu/cfr/text/29/1910.67' },
        { label: 'OSHA eTool: scissor lifts', url: 'https://www.osha.gov/etools/scaffolding/scissor-lifts' },
      ],
    },
  ),

  template(
    {
      id: 'lib-noise-power',
      title: 'Noise & Temporary Power',
      description: 'Protect your hearing near loud sound, and stay safe around generators, distros and cables.',
      category: 'Health & Safety',
      emoji: '🔊',
      estMinutes: 5,
      lessons: [
        card(
          'Loud music damages hearing',
          `Hearing damage is permanent, and it builds up over many shifts.

One study measured **86–98 dB(A)** behind bars at live-music venues, above the level where OSHA requires a hearing conservation program.

- **85 dB(A)** averaged over 8 hours: OSHA's **action level**. Your employer must provide hearing protection, hearing tests and training.
- **90 dB(A)** averaged over 8 hours: OSHA's **legal limit**
- Every **5 dB louder halves** the safe time, so 95 dB(A) is the limit for just 4 hours
- Wear the ear protection you're given, **especially** near speaker stacks and at bars by the stage`,
        ),
        card(
          'Temporary power: hands off',
          `Generators, distribution boards ("distros") and cable runs are installed and changed **only by competent electricians**.

- Never unplug, re-route or "fix" power cables yourself
- Keep drinks and water away from distros and cable joints
- Report damaged cables, scorching, buzzing or tripping straight away
- Cables across walkways must be covered with ramps: **report any trip hazards**`,
        ),
        quiz('Noise & power check', [
          q('At what 8-hour average must OSHA hearing protection and training be provided?', ['60 dB(A)', '85 dB(A)', '120 dB(A)'], 1, '85 dB(A) is the action level; 90 dB(A) is the legal limit.'),
          q('A cable joint by the bar is buzzing and warm. You…', ['Wrap it in tape', 'Keep people away and report it immediately', 'Unplug it'], 1),
        ]),
      ],
    },
    {
      kind: 'safety',
      regions: ['US'],
      roles: ['r-setup', 'r-bar', 'r-security'],
      legal: 'OSHA 29 CFR 1910.95 sets a 90 dB(A) 8-hour limit and requires a hearing conservation program (protection, testing and training) from 85 dB(A). OSHA 1910.332 requires electrical safety training scaled to the risk.',
      sources: [
        { label: 'OSHA: occupational noise exposure', url: 'https://www.osha.gov/noise' },
        { label: '29 CFR 1910.95: occupational noise exposure', url: 'https://www.law.cornell.edu/cfr/text/29/1910.95' },
        { label: '29 CFR 1910.332: electrical safety training', url: 'https://www.law.cornell.edu/cfr/text/29/1910.332' },
        { label: 'Chichester DC: hearing protection in entertainment venues', url: 'https://www.chichester.gov.uk/media/10057/Hearing-Protection-in-Entertainment-Venues-Project-2008/pdf/Hearing_Protection_in_Entertainment_Venues_01-05-08.pdf' },
      ],
    },
  ),

  template(
    {
      id: 'lib-radio-methane',
      title: 'Radio Discipline & Incident Reports',
      description: 'The phonetic alphabet, radio words, calling in a serious incident, and what goes in an incident report.',
      category: 'Operations',
      emoji: '📻',
      estMinutes: 6,
      lessons: [
        card(
          'Spell it out',
          `Use the phonetic alphabet for gates, zones and codes:

Alfa · Bravo · Charlie · Delta · Echo · Foxtrot · Golf · Hotel · India · Juliett · Kilo · Lima · Mike · November · Oscar · Papa · Quebec · Romeo · Sierra · Tango · Uniform · Victor · Whiskey · X-ray · Yankee · Zulu

"Gate **Bravo Two**" beats "Gate B… no, the other B".`,
        ),
        card(
          'Radio words',
          `- **Roger**: message received. It does **not** mean yes.
- **Wilco**: I will comply
- **Over**: I've finished, your turn
- **Out**: conversation ended. Never say "over and out".
- **Say again**: please repeat

Keep calls short. When the channel is busy, **urgent calls must be able to get through**.`,
        ),
        card(
          'Calling in a serious incident',
          `Give Control what responders need, in this order:

- **Where:** the exact location (gate, zone, landmark)
- **What:** what's happening, in a few words
- **Who:** how many people are hurt, and how badly
- **Hazards:** fire, crowd pressure, violence, electrical
- **Access:** the best way in for EMS, fire or police
- **Help:** what you need sent

Control calls **911** and runs the response. And **never give personal names on an open channel**.`,
        ),
        card(
          'Writing an incident report',
          `Write it **as soon as possible**, while you still remember clearly:

- Date, time and **exact location**
- What happened, in order: facts, not opinions
- People involved, and any injuries
- What you and others did
- Witnesses
- Who you told, and when`,
        ),
        quiz('Radio check', [
          q('What does "Roger" mean?', ['Yes', 'Message received', 'Emergency'], 1),
          q('What should you say first when calling in a serious incident?', ['Your name', 'The exact location', 'How you feel'], 1, 'Responders can’t help until they know where to go.'),
          q('How do you end a radio conversation?', ['"Over and out"', '"Out"', '"Bye"'], 1),
        ]),
      ],
    },
    {
      kind: 'operations',
      regions: ['US'],
      roles: ['r-security', 'r-usher', 'r-ticket', 'r-setup'],
      customise: 'your radio channels and call signs',
      sources: [
        { label: 'Procedure words (overview)', url: 'https://en.wikipedia.org/wiki/Procedure_word' },
      ],
    },
  ),

  template(
    {
      id: 'lib-privacy',
      title: 'Guest Data & Privacy at Check-in',
      description: 'Handling attendee lists, scanners and badge data under US privacy law without creating a breach.',
      category: 'Compliance',
      emoji: '🔐',
      estMinutes: 5,
      lessons: [
        card(
          'Only what’s needed',
          `Collect only the guest data the task actually needs, never "just in case". California's privacy law requires data collection to be **"reasonably necessary and proportionate"**.

- Don't write down guest details on scraps of paper
- **Never photograph** check-in screens, guest lists or badges
- Lock or log out of devices whenever you step away`,
        ),
        card(
          'Lost a list? Say so straight away',
          `A lost printed guest list, a phone photo of the check-in screen, or an email sent to the wrong person can all be a **personal data breach**.

**Every US state** has a data breach notification law, and many set strict deadlines for telling the people affected. The company can only meet them if you **tell your supervisor immediately**. You won't get in trouble for reporting honestly.`,
        ),
        card(
          'Scans and guest requests',
          `- Tell guests what a badge scan is for **before** you scan
- California (CCPA/CPRA) gives people rights to **know, delete, correct** and **opt out** of the sale or sharing of their data. A growing number of other states have similar laws.
- If a guest asks about their data, don't guess. Pass them to **[privacy contact]**.`,
        ),
        quiz('Privacy check', [
          q('Is it OK to photograph the check-in screen to remember a guest’s details?', ['Yes, if you delete it later', 'No, never', 'Only for VIPs'], 1),
          q('You realise you left a printed guest list on the bus. You…', ['Hope nobody finds it', 'Tell your supervisor immediately', 'Print another'], 1),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['r-ticket', 'r-usher'],
      legal: 'California’s CCPA/CPRA gives consumers rights over their data (it applies to businesses over $25M revenue, or handling data of 100k+ California residents, among other thresholds). All 50 states have data breach notification laws.',
      customise: 'who guests should contact about their data',
      sources: [
        { label: 'California Attorney General: CCPA', url: 'https://oag.ca.gov/privacy/ccpa' },
        { label: 'NCSL: security breach notification laws', url: 'https://www.ncsl.org/technology-and-communication/security-breach-notification-laws' },
      ],
    },
  ),

  template(
    {
      id: 'lib-fire',
      title: 'Fire Safety at Events',
      description: 'Raising the alarm, PASS, extinguisher types, pyro zones and why every exit is for everyone.',
      category: 'Health & Safety',
      emoji: '🧯',
      estMinutes: 6,
      lessons: [
        card(
          'Raise the alarm first',
          `- Raise the alarm and radio Control with the **exact location**
- Only tackle a fire if it's **small**, you're **trained**, and you have a clear way out behind you
- If in doubt, **get out** and help guide guests away`,
        ),
        card(
          'Using an extinguisher: PASS',
          `- **P**ull the pin
- **A**im at the base of the fire
- **S**queeze the handle
- **S**weep side to side

## Match the class to the fire
- **A:** ordinary materials (paper, wood, fabric)
- **B:** flammable liquids (fuel, haze fluid, alcohol)
- **C:** energized electrical equipment
- **D:** combustible metals
- **K:** cooking oils and fats (food trucks, fryers)

A multipurpose **"ABC"** extinguisher covers classes A, B and C, but **not K**. Check the label before you use one.`,
        ),
        card(
          'Every exit is for everyone',
          `At The Station nightclub (Rhode Island, 2003), stage pyrotechnics set the soundproofing foam on fire. Within about a minute, smoke had reached the exits. **100 people died.** The club held more people than its capacity allowed, and staff had kept one exit for the band.

- Keep **all exits, fire lanes and extinguishers clear**, all the time
- In an emergency, **every door is an exit**, including "staff only" doors
- Stay out of **pyrotechnic exclusion zones**`,
        ),
        quiz('Fire check', [
          q('What does the first "S" in PASS stand for?', ['Stop', 'Squeeze', 'Spray'], 1),
          q('A fryer fire starts in a food truck. Which extinguisher class is designed for it?', ['Class A', 'Class C', 'Class K'], 2, 'Class K is for cooking oils and fats. Water can make an oil fire explode.'),
          q('During an evacuation, a guest heads for a "staff only" exit. You…', ['Send them back to the main door', 'Let them use it; every exit is for everyone', 'Ask for their ticket'], 1),
        ]),
      ],
    },
    {
      kind: 'safety',
      regions: ['US'],
      roles: ['all'],
      sources: [
        { label: 'US Fire Administration: using extinguishers (PASS)', url: 'https://www.usfa.fema.gov/prevention/home-fires/prepare-for-fire/fire-extinguishers/' },
        { label: 'NFPA: fire extinguisher types', url: 'https://www.nfpa.org/news-blogs-and-articles/blogs/2023/08/01/fire-extinguisher-types' },
        { label: 'NIST: The Station nightclub fire investigation', url: 'https://www.nist.gov/publications/report-technical-investigation-station-nightclub-fire-nist-ncstar-2-volume-1' },
      ],
    },
  ),

  template(
    {
      id: 'lib-deescalation',
      title: 'De-escalating Conflict',
      description: 'How your behavior shapes theirs, calming body language, keeping safe, and reporting afterwards.',
      category: 'Customer Service',
      emoji: '🕊️',
      estMinutes: 6,
      lessons: [
        card(
          'Your behavior shapes theirs',
          `Conflict trainers use the **"attitude–behavior cycle"** (also called the Betari box): my attitude affects my behavior, which affects your attitude, which affects your behavior.

If you stay calm and respectful, you make it far easier for an angry guest to calm down too.`,
        ),
        card(
          'What sets it off, and what calms it',
          `**Triggers:** feeling ignored, embarrassed in front of friends, rushed, or treated unfairly. Also alcohol, heat and long queues.

**Calmers:**
- Use their name, listen, and **acknowledge** how they feel
- Explain **why**, not just "no"
- Offer choices: "I can't let you in here, but I can walk you to the box office"`,
        ),
        card(
          'Keep yourself safe',
          `- Stand at an angle, **outside arm's reach**
- Open hands, relaxed voice, no pointing
- Always keep **an exit route open**, for you and for them
- Keep **checking the risk**. If it's escalating, step back and **call for back-up**, and don't try to handle it alone
- Afterwards, **report it**, even if it ended calmly`,
        ),
        quiz('De-escalation check', [
          q('A guest is shouting at you about the queue. Best first move?', ['Shout back so they hear you', 'Stay calm and acknowledge their frustration', 'Walk away without a word'], 1),
          q('Why keep an exit route open?', ['So you or they can leave if it escalates', 'For ventilation', 'It’s not important'], 0),
        ]),
      ],
    },
    {
      kind: 'service',
      regions: ['US'],
      roles: ['r-security', 'r-bar', 'r-usher', 'r-ticket'],
      sources: [{ label: 'SIA: conflict management specification', url: 'https://assets.publishing.service.gov.uk/media/60c24534d3bf7f4bcfe764e1/sia-conflict-management-specification-2014.pdf' }],
    },
  ),

  template(
    {
      id: 'lib-spiking',
      title: 'Drink Spiking & Ask for Angela',
      description: 'How to respond to a suspected spiking, prevent it at the bar, and help guests who ask for Angela.',
      category: 'Welfare',
      emoji: '🥤',
      estMinutes: 5,
      lessons: [
        card(
          'If someone may have been spiked',
          `- Move them somewhere **safe and quiet**, and **stay with them** or keep a trusted friend with them
- Get **medical help**, especially if they're very drowsy, confused or getting worse
- **Believe them.** Never blame them or suggest they "just drank too much".
- Report it to your supervisor and security so it can be passed to the police`,
        ),
        card(
          '"Ask for Angela"',
          `Many venues display posters saying anyone who feels unsafe can go to the bar and **"ask for Angela"**.

If a guest asks for Angela:
- Stay calm and discreet, and don't make a scene
- Take them somewhere safe, away from the person worrying them
- Get your supervisor or security to help them get home safely or contact the police`,
        ),
        card(
          'Preventing it at the bar',
          `- Never leave drinks you've poured unattended
- Watch for people hovering over other guests' drinks
- Offer drink covers or stoppers if your venue has them
- Secretly drugging someone's drink is a **serious crime**. Keep anything that may be evidence (the glass, the drink) and hand it to security.`,
        ),
        quiz('Spiking check', [
          q('A guest says they think their drink was spiked. You…', ['Tell them they probably drank too much', 'Keep them safe, get medical help and report it', 'Refuse to serve them'], 1),
          q('Someone at the bar asks "Is Angela working tonight?" You…', ['Say there’s no Angela', 'Discreetly take them somewhere safe and get help', 'Laugh it off'], 1),
        ]),
      ],
    },
    {
      kind: 'welfare',
      regions: ['US'],
      roles: ['r-bar', 'r-security', 'r-server', 'r-usher'],
      customise: 'whether your venues run Ask for Angela, and who handles it',
      sources: [],
    },
  ),

  template(
    {
      id: 'lib-cash-fraud',
      title: 'Counterfeit Notes & Card Fraud',
      description: 'Check banknotes, handle a suspect note safely, and protect card payments at pop-up bars.',
      category: 'Operations',
      emoji: '💵',
      estMinutes: 5,
      lessons: [
        card(
          'Check the note',
          `US notes: **Look, Feel, Tilt**

- **Look** for the portrait watermark and the embedded security thread when you hold the note up to light
- **Feel** the raised printing: genuine notes feel slightly rough
- **Tilt** to see the color-shifting number and, on a $100, the moving blue ribbon

Check more than one feature: fakes often copy just one.`,
        ),
        card(
          'You’re handed a fake',
          `- Stay polite: the guest may not know it's fake
- **Don't hand it back**
- Call your supervisor, who will contact local police or the **US Secret Service**, which handles counterfeits
- A counterfeit note is worthless, so it can't go in the till`,
        ),
        card(
          'Protect card payments',
          `- **Never** write down a card number or security code (CVV)
- Check your card terminal at the start of each shift for **tampering**: loose parts, extra devices, or a terminal you don't recognize
- Someone arrives to "service" or swap the terminal? **Ask for ID and check with your manager first**
- Refunds only with **supervisor approval**
- Report anything odd straight away`,
        ),
        quiz('Cash check', [
          q('What should you see when you tilt a genuine $100 note?', ['Nothing changes', 'Color-shifting ink and the moving blue ribbon', 'The ink rubs off'], 1),
          q('You suspect a note is fake. You…', ['Hand it back and ask for another', 'Keep it, stay polite and call your supervisor', 'Put it in the till'], 1),
          q('Can you write down a guest’s card number to process later?', ['Yes, if you shred it', 'No, never'], 1),
        ]),
      ],
    },
    {
      kind: 'operations',
      regions: ['US'],
      roles: ['r-bar', 'r-server', 'r-ticket'],
      sources: [
        { label: 'US Secret Service: spotting fake money', url: 'https://www.secretservice.gov/newsroom/behind-the-shades/2025/11/learn-how-spot-fake-money-it-reaches-your-wallet' },
        { label: 'US Currency Education Program: security features', url: 'https://www.uscurrency.gov/denominations' },
        { label: 'PCI SSC: skimming prevention for merchants', url: 'https://www.pcisecuritystandards.org/about_us/press_releases/pci-security-standards-council-publishes-merchant-guidance-on-skimming-prevention/' },
      ],
    },
  ),

  template(
    {
      id: 'lib-iso20121',
      title: 'Sustainable Events (ISO 20121)',
      description: 'What the event sustainability standard means for crew: waste streams, reuse and speaking up.',
      category: 'Operations',
      emoji: '♻️',
      estMinutes: 4,
      lessons: [
        card(
          'What ISO 20121 is',
          `**ISO 20121** is the international standard for running events sustainably. The latest edition was published in **2024**.

It certifies the **organizer's management system**, not individual crew. But it only works if everyone on site follows the plan. It now covers people too: wellbeing, human rights and diversity, not just waste and energy.`,
        ),
        card(
          'Your part on shift',
          `- Sort waste into the right streams: **[your bin colors and what goes in each]**
- Run reusable-cup and deposit schemes properly
- Switch off equipment and lights you don't need
- **Report problems** (overflowing bins, wrong bins, leaks) so the organizer can fix them and track progress`,
        ),
        quiz('Sustainability check', [
          q('Who does ISO 20121 certify?', ['Each crew member', 'The event organizer’s management system', 'The venue’s bins'], 1),
        ]),
      ],
    },
    {
      kind: 'operations',
      regions: ['US'],
      roles: ['all'],
      customise: 'your waste streams and bin colors',
      sources: [
        { label: 'ISO: ISO 20121:2024', url: 'https://www.iso.org/standard/86389.html' },
        { label: 'SGS: what’s new in ISO 20121:2024', url: 'https://www.sgs.com/en/news/2024/05/whats-new-with-iso-20121-2024-and-why-is-it-important' },
      ],
    },
  ),
];
