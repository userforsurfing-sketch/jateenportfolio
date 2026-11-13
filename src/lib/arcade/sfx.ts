/** Tiny synthesized sound effects (Web Audio) — no audio files needed. */

export type SfxName =
  | "jump"
  | "score"
  | "hit"
  | "eat"
  | "bonus"
  | "flip"
  | "match"
  | "miss"
  | "win"
  | "trap"
  | "checkpoint"
  | "level"
  | "start";

export interface Sfx {
  play: (name: SfxName) => void;
  setEnabled: (on: boolean) => void;
}

type Tone = { f: number; to?: number; d: number; type?: OscillatorType; v?: number; delay?: number };

const SOUNDS: Record<SfxName, Tone[]> = {
  jump: [{ f: 420, to: 820, d: 0.12, type: "square", v: 0.05 }],
  score: [{ f: 880, d: 0.06, type: "square", v: 0.04 }, { f: 1320, d: 0.08, type: "square", v: 0.04, delay: 0.06 }],
  hit: [{ f: 220, to: 40, d: 0.4, type: "sawtooth", v: 0.08 }],
  eat: [{ f: 600, to: 900, d: 0.07, type: "triangle", v: 0.08 }],
  bonus: [
    { f: 660, d: 0.07, type: "triangle", v: 0.08 },
    { f: 990, d: 0.07, type: "triangle", v: 0.08, delay: 0.07 },
    { f: 1320, d: 0.1, type: "triangle", v: 0.08, delay: 0.14 },
  ],
  flip: [{ f: 520, to: 680, d: 0.05, type: "triangle", v: 0.05 }],
  match: [{ f: 700, d: 0.08, type: "sine", v: 0.1 }, { f: 1050, d: 0.12, type: "sine", v: 0.1, delay: 0.08 }],
  miss: [{ f: 300, to: 220, d: 0.12, type: "triangle", v: 0.06 }],
  win: [
    { f: 523, d: 0.12, type: "square", v: 0.05 },
    { f: 659, d: 0.12, type: "square", v: 0.05, delay: 0.12 },
    { f: 784, d: 0.12, type: "square", v: 0.05, delay: 0.24 },
    { f: 1047, d: 0.3, type: "square", v: 0.05, delay: 0.36 },
  ],
  trap: [{ f: 1200, to: 300, d: 0.1, type: "sawtooth", v: 0.05 }],
  checkpoint: [{ f: 600, d: 0.08, type: "sine", v: 0.09 }, { f: 900, d: 0.15, type: "sine", v: 0.09, delay: 0.08 }],
  level: [
    { f: 440, d: 0.1, type: "triangle", v: 0.09 },
    { f: 660, d: 0.1, type: "triangle", v: 0.09, delay: 0.1 },
    { f: 880, d: 0.2, type: "triangle", v: 0.09, delay: 0.2 },
  ],
  start: [{ f: 330, to: 660, d: 0.15, type: "triangle", v: 0.07 }],
};

export function createSfx(initiallyEnabled = true): Sfx {
  let enabled = initiallyEnabled;
  let ctx: AudioContext | null = null;

  const audio = () => {
    if (typeof window === "undefined") return null;
    if (!ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctx = new Ctor();
    }
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  };

  return {
    setEnabled(on) {
      enabled = on;
    },
    play(name) {
      if (!enabled) return;
      const ac = audio();
      if (!ac) return;
      const now = ac.currentTime;
      for (const tone of SOUNDS[name]) {
        const start = now + (tone.delay ?? 0);
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.type = tone.type ?? "sine";
        osc.frequency.setValueAtTime(tone.f, start);
        if (tone.to) osc.frequency.exponentialRampToValueAtTime(tone.to, start + tone.d);
        gain.gain.setValueAtTime(tone.v ?? 0.06, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.d);
        osc.connect(gain).connect(ac.destination);
        osc.start(start);
        osc.stop(start + tone.d + 0.02);
      }
    },
  };
}
