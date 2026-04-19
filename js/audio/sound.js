let audioContext = null;

function getContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function beep(freq, duration, volume = 0.03, type = "sine") {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  osc.start(now);
  osc.stop(now + duration);
}

export function unlockAudio() {
  const ctx = getContext();
  if (ctx.state === "suspended") {
    ctx.resume();
  }
}

export function playSpinSound(enabled) {
  if (!enabled) return;
  beep(180, 0.05, 0.02, "square");
  setTimeout(() => beep(200, 0.05, 0.02, "square"), 60);
  setTimeout(() => beep(220, 0.05, 0.02, "square"), 120);
}

export function playReelStop(enabled, reelIndex = 0) {
  if (!enabled) return;
  const base = 220 + reelIndex * 40;
  beep(base, 0.04, 0.03, "square");
  setTimeout(() => beep(base + 120, 0.02, 0.015, "triangle"), 20);
}

export function playAnticipation(enabled) {
  if (!enabled) return;
  beep(300, 0.08, 0.02, "sawtooth");
  setTimeout(() => beep(360, 0.08, 0.02, "sawtooth"), 90);
  setTimeout(() => beep(420, 0.1, 0.025, "sawtooth"), 180);
}

export function playWinSound(enabled) {
  if (!enabled) return;
  beep(520, 0.08, 0.03, "triangle");
  setTimeout(() => beep(660, 0.1, 0.03, "triangle"), 90);
}

export function playBigWinSound(enabled) {
  if (!enabled) return;
  beep(440, 0.12, 0.04, "sawtooth");
  setTimeout(() => beep(550, 0.12, 0.04, "sawtooth"), 110);
  setTimeout(() => beep(660, 0.16, 0.04, "sawtooth"), 220);
  setTimeout(() => beep(880, 0.2, 0.05, "triangle"), 360);
}

export function playFeatureSound(enabled) {
  if (!enabled) return;
  beep(700, 0.12, 0.04, "triangle");
  setTimeout(() => beep(880, 0.16, 0.04, "triangle"), 130);
  setTimeout(() => beep(1040, 0.2, 0.05, "triangle"), 260);
}