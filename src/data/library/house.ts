/** House best-practice templates with no external standard. */
import { card, q, quiz, template } from './build';
import type { LibraryCourse } from './types';

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
- Wristband colors control access: **check every one, every time**, politely`,
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
    { kind: 'service', regions: ['US'], roles: ['r-bar', 'r-server', 'r-usher'], sources: [] },
  ),
];
