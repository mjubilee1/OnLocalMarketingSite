/**
 * Policy acknowledgment templates. Written as plain-language starting points with company
 * placeholders; they are not legal advice and should be reviewed against local law.
 */
import type { Bundle, LibraryDoc } from './types';

const doc = (id: string, title: string, description: string, body: string) => ({ id, title, description, body });

export const LIBRARY_DOCS: LibraryDoc[] = [
  {
    doc: doc(
      'libdoc-harassment',
      'Anti-Harassment Policy Acknowledgment',
      'Confirms crew have received the harassment policy and know how to report.',
      `{{company}} is committed to a workplace free from harassment, discrimination and retaliation, on every site and at every event.

• Harassment based on sex, gender identity or expression, sexual orientation, race, religion, disability, age or any other protected characteristic is prohibited. This includes harassment by colleagues, supervisors, clients, performers and guests.
• You can report harassment to your supervisor, to {{manager}}, or by emailing {{company_email}}. You may also contact your state civil rights agency or the EEOC.
• Retaliation against anyone who reports, or who helps an investigation, is prohibited.
• Reports are handled promptly and as confidentially as possible.

By signing, I confirm that I have received and read the {{company}} Anti-Harassment Policy, and that I know how to report a concern.`,
    ),
    regions: ['US'],
    roles: ['all'],
    why: 'New York requires employers to give workers the written policy. Illinois bars and restaurants need one, and it underpins harassment training everywhere.',
    sources: [
      { label: 'New York State: minimum standards (model policy)', url: 'https://www.ny.gov/sites/default/files/atoms/files/MinimumStandardsforSexualHarassmentPreventionTraining.pdf' },
      { label: 'Illinois DHR: training FAQ', url: 'https://dhr.illinois.gov/content/dam/soi/en/web/dhr/training/documents/idhr-shp-faq01-frequently-asked-questions-ver-20200127.pdf' },
    ],
  },
  {
    doc: doc(
      'libdoc-alcohol',
      'Alcohol Service Policy Acknowledgment',
      'House rules for serving alcohol responsibly.',
      `When serving alcohol on behalf of {{company}}, I will:

• Check ID for anyone who appears under the age set in our policy, and accept only valid, approved forms of ID.
• Never serve anyone under the legal drinking age, or anyone who is obviously intoxicated.
• Never serve someone buying drinks for a person I have refused.
• Refuse service politely, offer water or food, and tell my supervisor.
• Hold any state or local server certification required for my role, and keep it valid.
• Not drink alcohol while working, including on breaks.
• Report incidents to my supervisor straight away.

I understand that breaking this policy may lead to removal from shifts, and that serving illegally can carry personal legal penalties.`,
    ),
    regions: ['US'],
    roles: ['r-bar', 'r-server'],
    why: 'In Texas, a signed alcohol policy is one of the conditions for "safe harbor" protection. Everywhere else, it supports the venue’s defense.',
    sources: [{ label: 'Texas TABC: certification & safe harbor FAQ', url: 'https://tabc.texas.gov/faqs/tabc-certification-faqs/' }],
  },
  {
    doc: doc(
      'libdoc-heat',
      'Heat Illness Prevention Plan Acknowledgment',
      'Confirms crew know the heat plan: water, shade, rest and emergency response.',
      `{{company}} has a written Heat Illness Prevention Plan for outdoor and hot indoor work.

• Free, fresh drinking water is provided. I will drink regularly, before I feel thirsty.
• Shade and cool-down areas are provided. I may take a cool-down rest whenever I need one.
• New and returning crew are watched closely while they get used to the heat.
• I will tell my supervisor straight away if I, or a crew-mate, show signs of heat illness.
• Signs of heat stroke (confusion, collapse, hot skin) are an emergency: I will call 911 and start cooling the person.

By signing, I confirm I have been told where to find the Heat Illness Prevention Plan and how it works on site.`,
    ),
    regions: ['US'],
    roles: ['all'],
    why: 'A written heat plan, explained to workers, is required under the California, Washington, Maryland and Nevada heat rules.',
    sources: [
      { label: 'Cal/OSHA 8 CCR 3395', url: 'https://www.dir.ca.gov/title8/3395.html' },
      { label: 'Washington L&I heat rule', url: 'https://lni.wa.gov/forms-publications/F417-300-000.pdf' },
    ],
  },
  {
    doc: doc(
      'libdoc-illness',
      'Food Safety & Illness Reporting Policy',
      'When food and bar staff must report illness and stay away from work.',
      `To protect guests, anyone handling food, drink or ice for {{company}} must:

• Tell their supervisor BEFORE a shift if they have vomiting, diarrhea, jaundice, a sore throat with fever, or an infected cut or wound on their hands or arms.
• Tell their supervisor if they have been diagnosed with a foodborne illness, such as norovirus, hepatitis A, Salmonella, Shigella or E. coli.
• Follow the supervisor's instructions to stay away from food work, or from work altogether, until cleared.
• Wash hands properly, use gloves or utensils for ready-to-eat food, and follow allergen procedures.

By signing, I confirm I understand when and how to report illness.`,
    ),
    regions: ['US'],
    roles: ['r-server', 'r-bar'],
    why: 'The 2026 FDA Food Code requires food businesses to have a written employee illness policy.',
    sources: [{ label: 'FDA: summary of changes, 2026 Food Code', url: 'https://www.fda.gov/food/fda-food-code/summary-changes-2026-fda-food-code' }],
  },
  {
    doc: doc(
      'libdoc-emergency',
      'Emergency & Evacuation Procedures Acknowledgment',
      'Confirms crew know their part in evacuation, shelter-in-place, lockdown and show stops.',
      `Before every event, {{company}} briefs crew on the site's emergency procedures. I agree to:

• Read the event briefing, including the exits, assembly points, shelter locations and radio codes.
• Keep every exit, fire lane and piece of fire equipment clear at all times.
• Report hazards, crowd pressure, suspicious items or behavior straight away, with my exact location.
• Follow instructions to evacuate, shelter in place, lock down or stop the show, and help guests to safety.
• Never leave my post in an emergency without telling my supervisor, and check in at the assembly point.

By signing, I confirm I understand my role in an emergency.`,
    ),
    regions: ['US'],
    roles: ['all'],
    why: 'NFPA 101 and the International Fire Code require crowd managers who know evacuation and shelter-in-place procedures. A signed acknowledgment records that every crew member was briefed.',
    sources: [
      { label: 'Mass.gov: crowd managers', url: 'https://www.mass.gov/info-details/crowd-managers' },
      { label: 'ICC: IFC crowd manager requirements', url: 'http://media.iccsafe.org/news/icc-enews/2017v14n41/17-14770.pdf' },
    ],
  },
  {
    doc: doc(
      'libdoc-cash',
      'Cash & Card Handling Policy',
      'Card data security and cash procedures for anyone taking payments.',
      `When taking payments for {{company}}, I will:

• Never write down, photograph or store card numbers, security codes (CVV) or PINs.
• Check my card terminal for signs of tampering at the start of each shift, and report anything unusual.
• Ask for ID, and check with my manager, before letting anyone service or swap a terminal.
• Count my starting cash and closing cash with a supervisor, and follow the refund approval process.
• Keep any suspected counterfeit note and report it, rather than handing it back.

By signing, I confirm I understand these payment security rules.`,
    ),
    regions: ['US'],
    roles: ['r-bar', 'r-server', 'r-ticket'],
    why: 'PCI DSS 4.x (mandatory since March 2025) requires training staff to spot tampered terminals. A signed policy records it.',
    sources: [
      { label: 'PCI SSC: data storage do’s and don’ts', url: 'https://listings.pcisecuritystandards.org/pdfs/pci_fs_data_storage.pdf' },
      { label: 'PCI SSC: PCI DSS v4.x future-dated requirements', url: 'https://blog.pcisecuritystandards.org/now-is-the-time-for-organizations-to-adopt-the-future-dated-requirements-of-pci-dss-v4-x' },
    ],
  },
  {
    doc: doc(
      'libdoc-equipment',
      'Equipment Authorization Agreement',
      'Records that only trained, authorized crew operate lifts, forklifts and power.',
      `{{company}} allows only trained and authorized people to operate powered access (MEWPs, boom and scissor lifts), forklifts, and temporary electrical systems.

• I will operate only the equipment my supervisor has authorized me to use, and only after I've been trained on it.
• I will do pre-use checks, wear the required PPE (including a harness in boom lifts), and never go over rated loads.
• I will not connect, disconnect or alter temporary power unless I am qualified and authorized to.
• I will stop work and report any defect or unsafe condition.

By signing, I confirm I understand these rules.`,
    ),
    regions: ['US'],
    roles: ['r-setup'],
    why: 'OSHA allows only trained, authorized people to run aerial lifts, and treats scissor lifts as scaffolds. This records who is allowed.',
    sources: [
      { label: '29 CFR 1910.67: aerial lifts', url: 'https://www.law.cornell.edu/cfr/text/29/1910.67' },
      { label: 'OSHA eTool: scissor lifts', url: 'https://www.osha.gov/etools/scaffolding/scissor-lifts' },
    ],
  },
  {
    doc: doc(
      'libdoc-privacy',
      'Data Protection & Confidentiality Agreement',
      'How crew handle guest data, lists and devices.',
      `While working for {{company}}, I may see personal data about guests, clients and colleagues. I agree to:

• Use it only for the task I'm doing, and never copy, photograph or share it.
• Keep guest lists, devices and screens secure, and log out whenever I step away.
• Report any lost list, device or data mistake to my supervisor IMMEDIATELY, so {{company}} can meet its legal reporting deadlines.
• Pass any guest questions about their data to {{company_email}}.
• Keep confidential information private, both during and after my work with {{company}}.

By signing, I agree to these data protection rules.`,
    ),
    regions: ['US'],
    roles: ['r-ticket', 'r-usher'],
    why: 'Every US state has a data breach notification law with deadlines the company can only meet if crew report straight away. California’s CCPA gives guests rights over their data.',
    sources: [
      { label: 'NCSL: security breach notification laws', url: 'https://www.ncsl.org/technology-and-communication/security-breach-notification-laws' },
      { label: 'California AG: CCPA', url: 'https://oag.ca.gov/privacy/ccpa' },
    ],
  },
];

export const BUNDLES: Bundle[] = [
  {
    id: 'pack-festival',
    name: 'Festival crew essentials',
    emoji: '🎪',
    description: 'The safety basics every outdoor festival crew member needs on day one.',
    courseIds: ['lib-crowd-crush', 'lib-weather', 'lib-welfare', 'lib-lost-child', 'lib-fire', 'lib-radio-methane'],
    docIds: ['libdoc-emergency'],
  },
  {
    id: 'pack-security',
    name: 'Security & crowd safety',
    emoji: '🛡️',
    description: 'For stewards, security and ushers: crowd density, de-escalation, safeguarding and incident reporting.',
    courseIds: ['lib-crowd-crush', 'lib-deescalation', 'lib-lost-child', 'lib-spiking', 'lib-radio-methane', 'lib-fire'],
    docIds: ['libdoc-emergency'],
  },
  {
    id: 'pack-bar',
    name: 'Bar & hospitality',
    emoji: '🍸',
    description: 'Serving safely and securely: spiking, cash and card fraud, conflict, ADA access and noise.',
    courseIds: ['lib-spiking', 'lib-cash-fraud', 'lib-deescalation', 'lib-us-ada', 'lib-noise-power', 'lib-vip'],
    docIds: ['libdoc-alcohol', 'libdoc-cash'],
  },
  {
    id: 'pack-front',
    name: 'Front of house & box office',
    emoji: '🎟️',
    description: 'Accessibility, guest data, payments and calm conflict handling at the gate.',
    courseIds: ['lib-us-ada', 'lib-privacy', 'lib-cash-fraud', 'lib-deescalation', 'lib-lost-child'],
    docIds: ['libdoc-privacy', 'libdoc-cash'],
  },
  {
    id: 'pack-production',
    name: 'Production crew safety',
    emoji: '🔧',
    description: 'Working at height, noise, temporary power, weather and fire for load-in and load-out.',
    courseIds: ['lib-work-height', 'lib-noise-power', 'lib-weather', 'lib-fire'],
    docIds: ['libdoc-equipment'],
  },
  {
    id: 'pack-us',
    name: 'US compliance pack',
    emoji: '🇺🇸',
    description: 'State alcohol and food handler rules, heat illness, crowd managers, harassment, ADA and OSHA.',
    courseIds: ['lib-us-alcohol-law', 'lib-us-food', 'lib-us-heat', 'lib-us-crowd-manager', 'lib-us-harassment', 'lib-us-ada', 'lib-us-osha-production'],
    docIds: ['libdoc-harassment', 'libdoc-alcohol', 'libdoc-heat', 'libdoc-illness'],
  },
];
