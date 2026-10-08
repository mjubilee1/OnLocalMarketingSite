type Recog = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((ev: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
};

const RecogCtor =
  typeof window !== 'undefined'
    ? ((window as unknown as { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => Recog }).webkitSpeechRecognition)
    : undefined;

export const canListen = () => !!RecogCtor;
export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

let unlocked = false;
export function unlockAudio() {
  if (unlocked || !canSpeak()) return;
  unlocked = true;
  const u = new SpeechSynthesisUtterance(' ');
  u.volume = 0;
  window.speechSynthesis.speak(u);
  window.speechSynthesis.cancel();
}

function pickVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => /en[-_]US/i.test(v.lang) && /female|samantha|google us/i.test(v.name)) ??
    voices.find((v) => /en[-_]US/i.test(v.lang)) ??
    voices.find((v) => /^en/i.test(v.lang)) ??
    voices[0] ??
    null
  );
}

export function speak(text: string, onStart?: () => void, onEnd?: () => void) {
  if (!canSpeak() || !text.trim()) {
    onEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text.trim());
  u.rate = 1.04;
  u.pitch = 1.04;
  u.lang = 'en-US';
  const voice = pickVoice();
  if (voice) u.voice = voice;
  u.onstart = () => onStart?.();
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  window.speechSynthesis.speak(u);
}

export function hush() {
  if (canSpeak()) window.speechSynthesis.cancel();
}

export function listen(opts: { onPartial?: (t: string) => void; onFinal: (t: string) => void; onError?: (m: string) => void }): { stop: () => void } {
  if (!RecogCtor) {
    opts.onError?.('Voice isn’t available in this browser. Type instead.');
    return { stop: () => {} };
  }
  const rec = new RecogCtor();
  rec.lang = 'en-US';
  rec.continuous = false;
  rec.interimResults = true;
  let final = '';
  rec.onresult = (ev) => {
    let bits = '';
    for (let i = 0; i < ev.results.length; i++) {
      const row = ev.results[i];
      bits += row[0].transcript;
      if (row.isFinal) final = bits;
    }
    opts.onPartial?.(bits.trim());
  };
  rec.onerror = (ev) => {
    if (ev.error !== 'aborted' && ev.error !== 'no-speech') opts.onError?.(ev.error);
  };
  rec.onend = () => {
    const t = final.trim();
    if (t) opts.onFinal(t);
  };
  rec.start();
  return {
    stop: () => {
      try {
        rec.stop();
      } catch {
        rec.abort();
      }
    },
  };
}
