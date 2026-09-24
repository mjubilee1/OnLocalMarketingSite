/**
 * United Kingdom templates. Coverage is narrower than the US set: the dedicated UK/Australia legal
 * research pass was stopped, so only topics confirmed by the industry research are included.
 */
import { card, q, quiz, template } from './build';
import type { LibraryCourse } from './types';

export const UK_COURSES: LibraryCourse[] = [
  template(
    {
      id: 'lib-uk-martyns-law',
      title: "Martyn's Law & Counter-Terrorism Awareness",
      description: 'What the Terrorism (Protection of Premises) Act 2025 means for event staff, and how to spot and report suspicious activity.',
      category: 'Compliance',
      emoji: '🛡️',
      estMinutes: 6,
      lessons: [
        card(
          "What is Martyn's Law?",
          `The **Terrorism (Protection of Premises) Act 2025** is named after Martyn Hett, who was killed in the Manchester Arena attack in 2017. It became law on **3 April 2025**. There's an implementation period, so it isn't expected to be enforced before about **2027**.

- **Standard tier:** premises and events for **200–799** people
- **Enhanced tier:** **800 or more** people
- Venues must have procedures for **evacuation, invacuation** (bringing people inside to safety), **lockdown** and **communication**, and staff must know their part in them`,
        ),
        card(
          'Spot hostile reconnaissance',
          `Attackers often visit a site beforehand to plan. The Manchester Arena Inquiry found chances to spot the attacker's reconnaissance were missed.

Watch for someone who:
- Takes an unusual interest in **security, CCTV, exits or staff routines**
- Films or photographs security measures rather than the event
- Loiters without a clear reason, or keeps coming back
- Asks unusual questions about capacity or where security is posted

**If something feels wrong, report it.** You don't need to be sure.`,
        ),
        card(
          'Unattended items: HOT',
          `Most unattended bags are just lost property. Use **HOT** to decide:

- **H**idden: deliberately concealed?
- **O**bviously suspicious: wires, liquids, smells, or an unusual container?
- **T**ypical: is it something you'd normally expect to see here?

If it's hidden, obviously suspicious or not typical: **don't touch it**, move people away, and radio Control using **[your code]**.`,
        ),
        card(
          'If an attack happens: Run, Hide, Tell',
          `- **Run:** to a safe place, if there's a safe route. Leave your belongings behind, and take guests with you if you can.
- **Hide:** if you can't run, get out of sight, lock or barricade yourself in, and put your phone on silent
- **Tell:** call **999** when it's safe, and give the location and a description

Follow your venue's **lockdown and invacuation** instructions.`,
        ),
        quiz('Counter-terrorism check', [
          q("Under Martyn's Law, which tier covers an event for 1,000 people?", ['Standard tier', 'Enhanced tier', 'Not covered'], 1, 'The enhanced tier applies from 800 people.'),
          q('A bag has been hidden behind a bin with wires showing. You…', ['Pick it up and take it to lost property', "Don't touch it, move people away and radio Control", 'Open it to check'], 1),
          q('Someone keeps filming the security search area rather than the stage. You…', ['Ignore it; lots of people film', 'Report it', 'Confiscate their phone'], 1),
        ]),
      ],
    },
    {
      kind: 'legal',
      regions: ['UK'],
      roles: ['all'],
      legal:
        "Terrorism (Protection of Premises) Act 2025 (Royal Assent 3 April 2025) sets duties for premises and events: standard tier for 200–799 people and enhanced tier for 800+, regulated by the SIA. Enforcement follows an implementation period, expected no earlier than 2027.",
      customise: 'your suspicious-item radio code and your venue’s lockdown procedure',
      sources: [
        { label: "ProtectUK: Martyn's Law overview", url: 'https://www.protectuk.police.uk/martyns-law/martyns-law-overview-and-what-you-need-know' },
        { label: 'Manchester Arena Inquiry: hostile reconnaissance', url: 'https://manchesterarenainquiry.org.uk/report-volume-one/part-1-missed-opportunities/hostile-reconnaissance/' },
        { label: 'ProtectUK', url: 'https://www.protectuk.police.uk/' },
      ],
    },
  ),
];

/** Carried over from the original library: internal best practice, no external standard. */
export const HOUSE_COURSES: LibraryCourse[] = [
  template(
    {
      id: 'lib-vip',
      title: 'VIP & Hospitality Etiquette',
      description: 'Discreet, polished service for artist, sponsor and VIP areas.',
      category: 'Customer Service',
      emoji: '🥂',
      estMinutes: 4,
      lessons: [
        card(
          'Discretion first',
          `- **No photos, autographs or social posts** of artists or VIP guests
- Don't talk about who you've seen, whether on shift or online
- Wristband colours control access: **check every one, every time**, politely`,
        ),
        card(
          'Anticipate, don’t hover',
          `- Learn guests' names and preferences from the briefing
- Clear glasses and plates promptly and quietly
- If you can't do something, find someone who can. Never just say "no".`,
        ),
        quiz('VIP check', [q('A famous artist walks past the bar. You…', ['Ask for a selfie', 'Carry on working discreetly', 'Post about it'], 1)]),
      ],
    },
    { kind: 'service', regions: ['Global'], roles: ['r-bar', 'r-server', 'r-usher'], sources: [] },
  ),
];
