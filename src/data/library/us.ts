/**
 * United States compliance templates. Rules vary by state and change often; every course links
 * the regulator pages it was built from (checked 2026-09-23). These teach the essentials — they
 * do not replace state-approved certification where one is required.
 */
import { card, q, quiz, template } from './build';
import type { LibraryCourse } from './types';

export const US_COURSES: LibraryCourse[] = [
  template(
    {
      id: 'lib-us-alcohol-law',
      title: 'Alcohol Service Law & Your State Card (US)',
      description: 'Dram-shop liability, which states require a server card, and the deadlines after you start.',
      category: 'Compliance',
      emoji: '🍺',
      estMinutes: 7,
      lessons: [
        card(
          'You can be held responsible',
          `Serving a minor or someone who is **obviously intoxicated** can bring:

- **Criminal** charges against you
- **Administrative** penalties against the venue's licence
- **Civil** ("dram-shop") lawsuits if that guest goes on to hurt someone

That's why many states require a **state-approved server card**, and why events take it so seriously.`,
        ),
        card(
          'States that require a card',
          `Each of these states requires a card, with a deadline after you start:

- **California (RBS):** within **60 days** of your first shift. It covers anyone who checks ID, takes orders, pours or delivers alcohol. The exam must be passed within 30 days of training. The card lasts **3 years**.
- **Washington (MAST):** within **60 days**, valid **5 years**
- **Oregon (OLCC):** since March 2025 you must **pass the course and test before you pour**
- **Utah:** servers must be trained **before starting**
- **New Mexico:** within **30 days**, valid 3 years
- **Nevada:** within **30 days**, valid 4 years (in counties over 100,000 people)
- **Illinois (BASSET):** required for servers and ID checkers; check the ILCC site for deadlines

Rules change, so always check your state's regulator.`,
        ),
        card(
          'Texas and "voluntary" states',
          `**Texas** doesn't legally require the TABC card. But a venue only gets "safe harbor" protection if **all** alcohol staff and their managers are certified within **30 days** of hire and have signed its written alcohol policies. So most Texas employers require it.

In states where training is **voluntary**, programs like TIPS or ServSafe Alcohol can still help protect you and the venue in a lawsuit.`,
        ),
        card(
          'Events have stricter rules',
          `In **California**, an event on a **one-day licence** must have **at least one RBS-certified person on duty the whole time**, and the 60-day grace period doesn't apply. Caterers' staff must be certified **before** they serve.

**Upload your card** in the app under Profile → Certificates as soon as you have it.`,
        ),
        quiz('Alcohol law check', [
          q('In California, how long do you have to get your RBS certification after starting?', ['7 days', '60 days', '1 year'], 1),
          q('What is "dram-shop" liability?', ['A licence for bars', 'Being sued if a guest you over-served injures someone', 'A type of drink'], 1),
          q('In Oregon, since March 2025, when can a new server start pouring?', ['On day one with a pending permit', 'Only after passing the course and test', 'After 30 days'], 1),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['r-bar', 'r-server', 'r-security'],
      legal: 'Server/seller training is mandatory in CA, WA, OR, UT, NM, IL and NV (counties over 100k), with deadlines from before the first shift to 120 days. Texas requires it for safe-harbor protection. Crew still need the state-approved course: this template explains the rules.',
      sources: [
        { label: 'California ABC: RBS training', url: 'https://www.abc.ca.gov/education/rbs/' },
        { label: 'California ABC: RBS FAQ (events, one-day licences)', url: 'https://www.abc.ca.gov/education/rbs/frequently-asked-questions/' },
        { label: 'Washington LCB: MAST FAQ', url: 'https://lcb.wa.gov/mastrvp/mast_faqs' },
        { label: 'Oregon OLCC: alcohol service permits', url: 'https://www.oregon.gov/olcc/pages/alcohol-service-permits.aspx' },
        { label: 'Utah DABS: training', url: 'https://abs.utah.gov/licenses-permits/training/' },
        { label: 'Nevada NRS 369', url: 'https://www.leg.state.nv.us/NRS/NRS-369.html' },
        { label: 'Illinois LCC: BASSET', url: 'https://ilcc.illinois.gov/divisions/education/programs/basset.html' },
        { label: 'Texas TABC: certification FAQ', url: 'https://tabc.texas.gov/faqs/tabc-certification-faqs/' },
      ],
    },
  ),

  template(
    {
      id: 'lib-us-food',
      title: 'Food Handler Essentials (FDA Food Code)',
      description: 'Temperatures, handwashing, the 9 major allergens, illness reporting, and which states need a card.',
      category: 'Compliance',
      emoji: '🌡️',
      estMinutes: 7,
      lessons: [
        card(
          'Keep it out of the danger zone',
          `Under the FDA Food Code, food that needs temperature control must be kept:

- **Cold:** at **41°F or below**
- **Hot:** at **135°F or above**

Bacteria multiply quickly in between. Use the thermometer and log temperatures when you're asked to.`,
        ),
        card(
          'Hands and cross-contamination',
          `- Wash your hands for **at least 20 seconds**: before starting, after the restroom, after touching raw food, your face or your phone, and after breaks
- Use gloves or utensils for ready-to-eat food; **don't touch it with bare hands**
- Keep raw and ready-to-eat food, and their boards and utensils, **separate**
- Cleaning removes dirt; **sanitizing** kills germs. You need both.`,
        ),
        card(
          'The 9 major allergens',
          `**Milk · Eggs · Fish · Shellfish · Tree nuts · Peanuts · Wheat · Soybeans · Sesame** (sesame was added in 2023)

When a guest asks about allergens, **check the ingredient list or ask the chef. Never guess.** Use clean utensils and surfaces for allergy orders.`,
        ),
        card(
          'Sick? Tell us before your shift',
          `Tell your supervisor **before** you work if you have vomiting, diarrhea, jaundice, a sore throat with fever, or an infected cut on your hands, or if you've been diagnosed with foodborne illnesses such as norovirus, hepatitis A, Salmonella, Shigella or E. coli.

The **2026 FDA Food Code** requires food businesses to have a **written illness policy**. You'll sign ours.`,
        ),
        card(
          'Do you need a food handler card?',
          `Several states require one:

- **California:** within **30 days** of hire, valid 3 years. Since 2024 your **employer pays** for it, and the training time is paid.
- **Texas:** an accredited food handler course (check DSHS for the deadline)
- **Illinois:** required for food handlers, valid 3 years
- **Washington:** you can work up to **14 days** while you get your card
- **Oregon:** within **30 days**, valid 3 years

Upload your card in the app under Profile → Certificates.`,
        ),
        quiz('Food safety check', [
          q('Cold food must be kept at or below…', ['50°F', '41°F', '32°F'], 1),
          q('Which is one of the 9 major allergens added in 2023?', ['Sesame', 'Corn', 'Mustard'], 0),
          q('You wake up with vomiting before a catering shift. You…', ['Work but wear gloves', 'Tell your supervisor before the shift', 'Say nothing'], 1),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['r-server', 'r-bar'],
      legal: 'Food handler cards are mandatory in CA, TX, IL, WA and OR (and some counties elsewhere). In California since 2024 the employer must pay for the card and the training time (SB 476).',
      sources: [
        { label: 'FDA: summary of changes, 2026 Food Code', url: 'https://www.fda.gov/food/fda-food-code/summary-changes-2026-fda-food-code' },
        { label: 'FDA: summary of changes, 2022 Food Code (sesame)', url: 'https://www.fda.gov/food/fda-food-code/summary-changes-2022-fda-food-code' },
        { label: 'California SB 476 (employer pays)', url: 'https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=202320240SB476' },
        { label: 'Texas DSHS: food handler FAQ', url: 'https://www.dshs.texas.gov/licensing-food-handler-training-programs/frequently-asked-questions-food-handler-education-or-training-programs' },
        { label: 'Illinois IDPH: food handler FAQ', url: 'https://dph.illinois.gov/topics-services/food-safety/food-handler-training/food-handler-faq.html' },
        { label: 'Washington DOH: food worker card', url: 'https://doh.wa.gov/community-and-environment/food/food-worker-and-industry/food-worker-card' },
        { label: 'Oregon OHA: food handler cards', url: 'https://www.oregon.gov/oha/ph/healthyenvironments/foodsafety/pages/cert.aspx' },
      ],
    },
  ),

  template(
    {
      id: 'lib-us-heat',
      title: 'Heat Illness Prevention (US)',
      description: 'Water, shade, rest and acclimatization under Cal/OSHA and other state heat rules, plus when to call 911.',
      category: 'Health & Safety',
      emoji: '🥵',
      estMinutes: 6,
      lessons: [
        card(
          'Exhaustion vs. stroke',
          `**Heat exhaustion:** heavy sweating, weakness, headache, dizziness, nausea, cramps. Move the person to shade, cool them down, and report it.

**Heat stroke is a 911 emergency:** confusion, slurred speech, collapse, seizures, or hot skin. Call **911**, start cooling them straight away, and never leave them alone.`,
        ),
        card(
          'Water, shade and rest',
          `Under California's outdoor heat rule:

- **Water:** free, fresh and close by, enough for **1 quart (4 cups) per hour** for every worker. Drink before you're thirsty.
- **Shade:** provided once it's **over 80°F**
- **Cool-down rest:** at least **5 minutes** whenever you ask for it. You won't be penalised for asking.
- **High-heat procedures** start at **95°F**: extra observation, check-ins and reminders`,
        ),
        card(
          'New to the heat? Take it easy',
          `Your body takes about **two weeks** to get used to working in heat.

- New workers are **watched closely for their first 14 days**
- Use the **buddy system**: check on each other at every break
- Costumes, PPE, some medicines and a lack of sleep all raise your risk. Tell your supervisor.`,
        ),
        card(
          'It’s the law in several states',
          `- **California:** outdoor rule (8 CCR 3395), plus an **indoor** rule from July 2024 that applies at **82°F**
- **Washington:** applies year-round. At **90°F** there's a paid 10-minute cool-down every 2 hours; at **100°F**, 15 minutes every hour.
- **Oregon, Maryland, Nevada, Colorado, Minnesota:** have their own state heat rules
- **Federal:** OSHA's national heat rule is **not final** yet. OSHA can still act under the General Duty Clause.`,
        ),
        quiz('Heat check', [
          q('A crew-mate is confused and their skin is hot. You…', ['Give them a sports drink and carry on', 'Call 911 and start cooling them now', 'Tell them to sit in the car'], 1),
          q('Under Cal/OSHA, how much water must be available per worker?', ['1 cup per hour', '1 quart per hour', '1 gallon per shift'], 1),
          q('How long are new workers closely observed?', ['1 day', '14 days', '3 months'], 1),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['all'],
      legal: 'Heat illness training is required under state rules in CA (outdoor and, since July 2024, indoor), WA, OR, MD and NV, among others. The federal OSHA heat rule is proposed but not final as of September 2026.',
      customise: 'where water, shade and cool-down areas are at your events',
      sources: [
        { label: 'Cal/OSHA: 8 CCR 3395 outdoor heat', url: 'https://www.dir.ca.gov/title8/3395.html' },
        { label: 'Cal/OSHA: 8 CCR 3396 indoor heat', url: 'https://www.dir.ca.gov/title8/3396.html' },
        { label: 'Washington L&I heat rule (2023)', url: 'https://lni.wa.gov/forms-publications/F417-300-000.pdf' },
        { label: 'Oregon OSHA: heat stress', url: 'https://osha.oregon.gov/pages/topics/heat-stress.aspx' },
        { label: 'Maryland MOSH: heat stress', url: 'https://labor.maryland.gov/labor/mosh/moshheatstress.shtml' },
        { label: 'OSHA: heat rule hearing notice', url: 'https://www.osha.gov/news/newsreleases/osha-trade-release/20250416' },
      ],
    },
  ),

  template(
    {
      id: 'lib-us-crowd-manager',
      title: 'Crowd Manager Awareness (NFPA 101 / IFC)',
      description: 'What a crowd manager does, the 1-per-250 rule, and keeping exits and occupant loads safe.',
      category: 'Health & Safety',
      emoji: '🚪',
      estMinutes: 6,
      lessons: [
        card(
          'What the fire code requires',
          `Most US jurisdictions adopt fire codes that require trained **crowd managers** at assembly venues:

- **NFPA 101 (Life Safety Code):** at least one crowd manager, plus **one for every 250 people**
- **International Fire Code:** at gatherings of **more than 500 people**, at least **two** crowd managers, plus one for every 250

Your local fire authority decides which code applies and which training is approved.`,
        ),
        card(
          'What a crowd manager watches',
          `- **Occupant load:** counts must stay under the posted capacity
- **Exits and paths:** clear, marked and lit, with nothing stacked in front of them
- **Crowd flow:** density, surges and bottlenecks at entry and exit
- **Hazards:** blocked sprinklers, open flames, trip hazards`,
        ),
        card(
          'When something goes wrong',
          `- Know where the **fire alarm pull stations** and **extinguishers** are
- Know the difference between **evacuate** (everyone out) and **shelter in place** (everyone stays put)
- Report emergencies to Control with your **exact location**
- Direct people to the **nearest safe exit**, not the one they came in through`,
        ),
        quiz('Crowd manager check', [
          q('Under NFPA 101, how many crowd managers does a venue of 1,000 people need?', ['1', '4', '10'], 1, '1 per 250 occupants: 1,000 ÷ 250 = 4.'),
          q('Boxes are stacked in front of an exit door. You…', ['Leave them, the event is busy', 'Clear them and report it', 'Put a sign on them'], 1),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['r-usher', 'r-security', 'r-ticket'],
      legal: 'Required wherever NFPA 101, NFPA 1 or the IFC is adopted (most US jurisdictions). Ratios and approved certification vary locally, e.g. Massachusetts requires certified crowd managers in nightclubs and bars with 100+ occupants, renewed every 3 years. This is awareness training, not crowd manager certification.',
      sources: [
        { label: 'ICC: IFC 2018 significant changes (crowd managers)', url: 'http://media.iccsafe.org/news/icc-enews/2017v14n41/17-14770.pdf' },
        { label: 'Mass.gov: crowd managers', url: 'https://www.mass.gov/info-details/crowd-managers' },
        { label: 'Ocean City, MD: crowd manager training', url: 'https://oceancitymd.gov/oc/departments/fire/fire-marshal-office/crowd-mgmt-training/' },
        { label: 'NASFM: crowd manager training', url: 'https://www.firemarshals.org/Crowd-Manager-Training' },
      ],
    },
  ),

  template(
    {
      id: 'lib-us-harassment',
      title: 'Preventing Harassment at Work (US)',
      description: 'Recognise harassment (including by guests), report it, stop retaliation, and step in as a bystander.',
      category: 'Compliance',
      emoji: '🤚',
      estMinutes: 8,
      lessons: [
        card(
          'What counts as harassment',
          `Harassment is unwelcome conduct based on a **protected characteristic**, including sex, gender identity or expression, sexual orientation, race, religion, disability and age.

Examples: unwanted touching, sexual comments or jokes, requests for dates after a "no", slurs, and offensive images or messages. It includes **abusive conduct** too.`,
        ),
        card(
          'Guests can harass you too',
          `At events, harassment often comes from **guests, clients or performers**, not just colleagues. The company still has a duty to protect you.

- You never have to put up with it to "keep the guest happy"
- Step away, and tell your supervisor straight away
- Supervisors will move you, remove the guest, or call security`,
        ),
        card(
          'Reporting and retaliation',
          `- Report to **[who to report to]**, or to any supervisor
- You can also contact your state civil rights agency or the federal **EEOC**
- **Retaliation is illegal.** Nobody can cut your shifts, move you or treat you worse for reporting or for helping an investigation.`,
        ),
        card(
          'Step in as a bystander',
          `If you see harassment and it's safe to act:

- **Interrupt:** change the subject, or ask the person to help you with something
- **Get help:** a supervisor or security
- **Check in** with the person afterwards
- **Report** what you saw`,
        ),
        card(
          'State training rules',
          `- **California:** 1 hour for non-supervisors (2 for supervisors). **Seasonal and temporary workers must be trained within 30 days or 100 hours, whichever comes first.**
- **New York State:** every year, and **interactive**, with a written policy
- **New York City:** employers with 15+ employees; includes bystander training
- **Illinois:** every year, with **extra training for restaurants and bars**
- **Connecticut, Delaware, Maine:** have their own rules

This course is one part of that training. Your employer may add live sessions to meet all the rules.`,
        ),
        quiz('Harassment check', [
          q('A VIP guest keeps making sexual comments to you. You…', ['Put up with it, they’re important', 'Step away and tell your supervisor', 'Ignore it until the shift ends'], 1),
          q('After you report harassment, your shifts are cut. This is…', ['Normal scheduling', 'Illegal retaliation', 'Your fault'], 1),
          q('In California, seasonal workers must be trained within…', ['30 days or 100 hours', '1 year', 'It isn’t required'], 0),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['all'],
      legal: 'Required in CA (5+ employees; seasonal/temporary workers within 30 days or 100 hours), NY State (annual, interactive), NYC (15+ employees), IL (annual; extra for restaurants and bars), CT (3+), DE (50+; exempts workers employed under 6 months) and ME (15+). Formats and lengths differ: check yours meets your state’s standard.',
      customise: 'who crew should report harassment to',
      sources: [
        { label: 'California Gov. Code §12950.1', url: 'https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=12950.1' },
        { label: 'New York State: minimum training standards', url: 'https://www.ny.gov/sites/default/files/atoms/files/MinimumStandardsforSexualHarassmentPreventionTraining.pdf' },
        { label: 'NYC Commission on Human Rights: training FAQ', url: 'https://www.nyc.gov/site/cchr/law/sexual-harassment-training-faqs.page' },
        { label: 'Illinois DHR: training FAQ', url: 'https://dhr.illinois.gov/content/dam/soi/en/web/dhr/training/documents/idhr-shp-faq01-frequently-asked-questions-ver-20200127.pdf' },
        { label: 'Connecticut CHRO: FAQ', url: 'https://portal.ct.gov/-/media/CHRO/Sexual-Harassment-Prevention-Training/Sexual-Harassment-FAQs-English.pdf' },
        { label: 'Delaware 19 Del. C. §711A', url: 'https://delcode.delaware.gov/title19/c007/sc02/index.html' },
        { label: 'Maine 26 MRSA §807', url: 'https://legislature.maine.gov/statutes/26/title26sec807.html' },
      ],
    },
  ),

  template(
    {
      id: 'lib-us-ada',
      title: 'ADA: Service Animals & Accessible Service',
      description: 'The only two questions you may ask about a service dog, accessible routes, and effective communication.',
      category: 'Customer Service',
      emoji: '🦮',
      estMinutes: 5,
      lessons: [
        card(
          'The two questions',
          `Under the ADA, a service animal is a **dog trained to do work or tasks** for a person with a disability. Emotional-support animals don't count.

If it isn't obvious what the dog does, you may ask **only**:

- "Is the dog a service animal required because of a disability?"
- "What work or task has it been trained to perform?"

**You may not** ask about the person's disability, ask for paperwork or ID, or ask the dog to demonstrate.`,
        ),
        card(
          'When a dog can be asked to leave',
          `Allergies or fear of dogs are **not** reasons to refuse a service dog.

A dog may be asked to leave **only** if:
- it's **out of control** and the handler doesn't bring it back under control, or
- it **isn't housebroken**

Even then, the guest may stay without the dog. Always involve your supervisor.`,
        ),
        card(
          'Routes and communication',
          `- **Wheelchairs and mobility devices** may go anywhere people on foot can go
- Keep accessible routes, ramps and seating **clear**
- Offer help, and **ask before you help**
- Deaf or disabled guests are entitled to **effective communication**, such as an interpreter, captions or large print. Never ask them to bring their own interpreter. Know who to ask: **[access contact]**.`,
        ),
        quiz('ADA check', [
          q('Which question may you ask about a service dog?', ['What is your disability?', 'What work or task has it been trained to perform?', 'Can I see its certificate?'], 1),
          q('A guest near a service dog says they’re allergic. You…', ['Ask the dog to leave', 'Offer the allergic guest another seat, since the dog may stay', 'Refuse both entry'], 1),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['r-usher', 'r-ticket', 'r-security', 'r-bar', 'r-server'],
      legal: 'The ADA requires venues and events to comply; it does not itself mandate staff training, but staff actions determine compliance.',
      customise: 'who handles access and interpreter requests',
      sources: [
        { label: 'ADA.gov: service animals', url: 'https://www.ada.gov/resources/service-animals-2010-requirements/' },
        { label: 'ADA.gov: effective communication', url: 'https://www.ada.gov/resources/effective-communication/' },
        { label: 'ADA Title III regulation highlights', url: 'https://archive.ada.gov/regs2010/factsheets/title3_factsheet.html' },
      ],
    },
  ),

  template(
    {
      id: 'lib-us-osha-production',
      title: 'OSHA Essentials for Production Crew',
      description: 'Your right to a safe site, chemical labels and SDS, aerial and scissor lifts, electrical and lifting.',
      category: 'Health & Safety',
      emoji: '🦺',
      estMinutes: 7,
      lessons: [
        card(
          'Your right to a safe workplace',
          `OSHA's **General Duty Clause** requires employers to keep the workplace free of recognised serious hazards.

If something looks unsafe, **stop and report it**. You won't be penalised for raising a safety concern.`,
        ),
        card(
          'Chemicals: labels and SDS',
          `Haze fluid, cleaning products, fuels, adhesives and paints all come under OSHA **Hazard Communication**:

- Read the **label** and pictograms before you use a product
- Every chemical has a **Safety Data Sheet (SDS)**: know where they're kept, **[SDS location]**
- Never decant chemicals into unmarked bottles`,
        ),
        card(
          'Aerial and scissor lifts',
          `- **Only trained and authorised people** may operate aerial lifts
- Test the controls **every day** before use
- In a boom lift: stand on the basket floor and **tie off** to the boom or basket
- OSHA treats **scissor lifts as scaffolds**: guardrails must be in place, and don't climb on them
- Never go over the rated load`,
        ),
        card(
          'Electrical and lifting',
          `- **Don't touch** live or temporary power unless you're qualified and authorised
- Run cables so they don't create **trip hazards**, and report any damage
- For lifting, the NIOSH guideline limit is **51 lb**, and that's under ideal conditions. Heavy, awkward or repeated lifts need a **team lift** or a trolley.`,
        ),
        quiz('OSHA check', [
          q('Who may operate an aerial lift?', ['Anyone on the crew', 'Only trained and authorised people', 'Whoever is closest'], 1),
          q('How does OSHA treat scissor lifts?', ['As scaffolds, needing guardrails', 'As ladders', 'As vehicles'], 0),
          q('Where do you find the hazards of a haze fluid?', ['Its Safety Data Sheet (SDS) and label', 'The event poster', 'Nowhere'], 0),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['US'],
      roles: ['r-setup'],
      legal: 'Federal OSHA duties (General Duty Clause; Hazard Communication 1910.1200, updated July 2024; aerial lifts 1910.67 / 1926.453; scissor lifts as scaffolds 1926.454; electrical training 1910.332) plus state-plan equivalents.',
      customise: 'where Safety Data Sheets are kept on your sites',
      sources: [
        { label: 'OSH Act §5: General Duty Clause', url: 'https://www.osha.gov/laws-regs/oshact/section5-duties' },
        { label: 'OSHA: Hazard Communication 2024 final rule', url: 'https://www.osha.gov/laws-regs/federalregister/2024-05-20' },
        { label: '29 CFR 1910.67: aerial lifts', url: 'https://www.law.cornell.edu/cfr/text/29/1910.67' },
        { label: '29 CFR 1926.453: aerial lifts (construction)', url: 'https://www.law.cornell.edu/cfr/text/29/1926.453' },
        { label: 'OSHA eTool: scissor lifts', url: 'https://www.osha.gov/etools/scaffolding/scissor-lifts' },
        { label: '29 CFR 1910.332: electrical training', url: 'https://www.law.cornell.edu/cfr/text/29/1910.332' },
        { label: 'NIOSH: manual material handling', url: 'https://www.cdc.gov/niosh/docs/2007-131/pdfs/2007-131.pdf' },
      ],
    },
  ),
];
