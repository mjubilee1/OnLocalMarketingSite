import { practiceFromVideo, type VideoWorkstation } from '../../training/fromVideo';

/**
 * First workstation: the front desk agent in Generated Videos/welcome.mp4.
 * One job — acknowledge an arrival — taken from the film’s own beats.
 * The film’s quiz frame (about 2:40) is not played here; that scenario is the check.
 */
const frontDeskArrival: VideoWorkstation = {
  id: 'front-desk-arrival',
  role: 'Front desk agent',
  department: 'front desk',
  title: 'Front desk — guest arrival',
  job: 'Acknowledge a guest the moment they arrive, even if you are already with someone.',
  video: '/videos/welcome.mp4',
  holdBefore: 145,
  updatedAt: '2026-10-18',
  beats: [
    {
      id: 'look-up',
      label: 'Look up',
      at: 33,
      until: 37,
      caption: 'Look up, smile, and greet within seconds.',
    },
    {
      id: 'greet',
      label: 'Right with you',
      at: 41,
      until: 46,
      caption: "Busy already? Nod, and say you'll be right with them.",
    },
    {
      id: 'name',
      label: 'Their name',
      at: 50,
      until: 54,
      caption: 'Use their name once you have it.',
    },
    {
      id: 'eyes',
      label: 'Eyes on the guest',
      at: 112,
      until: 116,
      caption: 'Eyes on the guest, then the screen, then the guest.',
    },
  ],
  check: {
    id: 'arrival-move',
    prompt: 'A family walks in while you are with another guest. Dad has two bags and a sleeping child. What do you do first?',
    choices: [
      {
        id: 'ignore',
        label: 'Finish with your guest and say nothing.',
        miss: 'Look up first. Nod, say you’ll be right with them, and call the bell team.',
      },
      {
        id: 'acknowledge',
        label: 'Nod and smile, say you’ll be right with them, and call the bell team for the bags.',
        correct: true,
      },
    ],
  },
};

export const frontDesk = practiceFromVideo(frontDeskArrival);
