// Web Audio API music synthesizer - generates real audio for each instrument track

type Genre = "rock" | "jazz" | "classical" | "pop" | "electronic" | "rnb";
type Tempo = "slow" | "medium" | "fast";

const BPM_MAP: Record<Tempo, number> = { slow: 72, medium: 110, fast: 150 };

// Musical scales per genre (MIDI note numbers)
const SCALES: Record<Genre, number[]> = {
  rock:       [40, 43, 45, 47, 48, 50, 52, 55, 57, 59, 60, 62, 64],
  jazz:       [41, 43, 45, 47, 48, 50, 52, 53, 55, 57, 58, 60, 62],
  classical:  [40, 42, 44, 45, 47, 49, 50, 52, 54, 56, 57, 59, 61],
  pop:        [40, 42, 44, 45, 47, 49, 51, 52, 54, 56, 57, 59, 61],
  electronic: [40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 60],
  rnb:        [40, 42, 43, 45, 47, 48, 50, 52, 54, 55, 57, 59, 60],
};

// Chord progressions (scale degree indices)
const CHORD_PROGRESSIONS: Record<Genre, number[][]> = {
  rock:       [[0,2,4], [3,5,7], [4,6,8], [3,5,7]],
  jazz:       [[0,2,4,6], [1,3,5,7], [4,6,8,10], [0,2,4,6]],
  classical:  [[0,2,4], [3,5,7], [4,6,8], [0,2,4]],
  pop:        [[0,2,4], [5,7,9], [3,5,7], [4,6,8]],
  electronic: [[0,2,4], [3,5,7], [5,7,9], [4,6,8]],
  rnb:        [[0,2,4,6], [3,5,7,9], [1,3,5,7], [4,6,8,10]],
};

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export interface MusicPlayer {
  play: () => void;
  pause: () => void;
  stop: () => void;
  isPlaying: () => boolean;
  getTrackLevels: () => { vocals: number; guitar: number; piano: number; bass: number };
}

export function createMusicPlayer(
  genre: Genre,
  tempo: Tempo,
  seed: number = Date.now()
): MusicPlayer {
  let ctx: AudioContext | null = null;
  let masterGain: GainNode | null = null;
  let playing = false;
  let intervalIds: number[] = [];
  let oscillators: OscillatorNode[] = [];
  let gains: Record<string, GainNode> = {};
  let analyserNodes: Record<string, AnalyserNode> = {};

  const bpm = BPM_MAP[tempo];
  const beatDur = 60 / bpm;
  const scale = SCALES[genre] || SCALES.pop;
  const chords = CHORD_PROGRESSIONS[genre] || CHORD_PROGRESSIONS.pop;
  const rand = seededRandom(seed);

  function init() {
    ctx = new AudioContext();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(ctx.destination);

    // Create per-track gain + analyser
    for (const track of ["vocals", "guitar", "piano", "bass"]) {
      const g = ctx.createGain();
      g.gain.value = track === "bass" ? 0.5 : track === "vocals" ? 0.4 : 0.3;
      const a = ctx.createAnalyser();
      a.fftSize = 256;
      g.connect(a);
      a.connect(masterGain!);
      gains[track] = g;
      analyserNodes[track] = a;
    }
  }

  function playNote(
    track: string,
    freq: number,
    startTime: number,
    duration: number,
    type: OscillatorType = "sine",
    vibrato = false
  ) {
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;

    if (vibrato) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5 + rand() * 3;
      lfoGain.gain.value = freq * 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(startTime + duration);
    }

    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(1, startTime + 0.05);
    env.gain.setValueAtTime(1, startTime + duration * 0.7);
    env.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(env);
    env.connect(gains[track]);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    oscillators.push(osc);
  }

  function scheduleLoop() {
    if (!ctx || !playing) return;

    const now = ctx.currentTime;
    const loopLen = beatDur * 16; // 4 bars of 4/4

    // Schedule 4 bars ahead
    for (let bar = 0; bar < 4; bar++) {
      const chord = chords[bar % chords.length];
      const barStart = now + bar * beatDur * 4;

      // BASS: root note on beats 1 and 3
      const bassNote = scale[chord[0]];
      playNote("bass", midiToFreq(bassNote), barStart, beatDur * 1.8, "triangle");
      playNote("bass", midiToFreq(bassNote), barStart + beatDur * 2, beatDur * 1.8, "triangle");

      // GUITAR: chord strums
      const guitarType: OscillatorType = genre === "rock" ? "sawtooth" : genre === "jazz" ? "triangle" : "square";
      for (let beat = 0; beat < 4; beat++) {
        const t = barStart + beat * beatDur;
        for (const idx of chord) {
          if (idx < scale.length) {
            const gNote = scale[idx] + 12;
            playNote("guitar", midiToFreq(gNote), t + rand() * 0.02, beatDur * 0.7, guitarType);
          }
        }
      }

      // PIANO: arpeggiated chords
      for (let beat = 0; beat < (genre === "classical" ? 8 : 4); beat++) {
        const t = barStart + beat * (genre === "classical" ? beatDur / 2 : beatDur);
        const noteIdx = chord[beat % chord.length];
        if (noteIdx < scale.length) {
          const pNote = scale[noteIdx] + 24;
          playNote("piano", midiToFreq(pNote), t, beatDur * (genre === "classical" ? 0.4 : 0.6), "sine");
        }
      }

      // VOCALS: melody line
      for (let step = 0; step < 8; step++) {
        if (rand() > 0.3) {
          const t = barStart + step * (beatDur / 2);
          const melodyIdx = Math.floor(rand() * 5) + 4; // upper scale range
          if (melodyIdx < scale.length) {
            const vNote = scale[melodyIdx] + 24;
            playNote("vocals", midiToFreq(vNote), t, beatDur * (0.3 + rand() * 0.5), "sine", true);
          }
        }
      }
    }

    // Schedule next loop
    const id = window.setTimeout(scheduleLoop, loopLen * 800) as unknown as number;
    intervalIds.push(id);
  }

  return {
    play() {
      if (playing) return;
      if (!ctx) init();
      if (ctx?.state === "suspended") ctx.resume();
      playing = true;
      scheduleLoop();
    },
    pause() {
      playing = false;
      intervalIds.forEach(clearTimeout);
      intervalIds = [];
      ctx?.suspend();
    },
    stop() {
      playing = false;
      intervalIds.forEach(clearTimeout);
      intervalIds = [];
      oscillators.forEach((o) => { try { o.stop(); } catch {} });
      oscillators = [];
      if (ctx) {
        ctx.close();
        ctx = null;
        masterGain = null;
        gains = {};
        analyserNodes = {};
      }
    },
    isPlaying: () => playing,
    getTrackLevels() {
      const levels: Record<string, number> = {};
      for (const track of ["vocals", "guitar", "piano", "bass"]) {
        const a = analyserNodes[track];
        if (a) {
          const data = new Uint8Array(a.frequencyBinCount);
          a.getByteFrequencyData(data);
          const avg = data.reduce((s, v) => s + v, 0) / data.length;
          levels[track] = avg / 255;
        } else {
          levels[track] = 0;
        }
      }
      return levels as any;
    },
  };
}
