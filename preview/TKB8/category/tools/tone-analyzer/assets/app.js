const $ = (id) => document.getElementById(id);

const canvas = $("spectrum");
const ctx = canvas.getContext("2d");
const noteValue = $("noteValue");
const freqValue = $("freqValue");
const centsValue = $("centsValue");
const levelValue = $("levelValue");
const levelBar = $("levelBar");
const status = $("status");
const startBtn = $("startBtn");
const stopBtn = $("stopBtn");

const MIN_HZ = 40;
const MAX_HZ = 4000;
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FONT = '12px Manrope, "Microsoft YaHei", sans-serif';
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

let stream = null;
let audioContext = null;
let analyser = null;
let source = null;
let timeData = null;
let freqData = null;
let raf = 0;
let running = false;
let width = 0;
let height = 0;
let lastFrame = 0;
let lastReadout = 0;
let palette = readPalette();

function readPalette() {
  const styles = window.getComputedStyle(document.documentElement);
  const read = (name, fallback) => styles.getPropertyValue(name).trim() || fallback;

  return {
    accent: read("--color-brand", "#3a6a96"),
    surface: read("--color-surface-raised", "#ffffff"),
    grid: read("--color-border", "#c6d8e8"),
    text: read("--color-text-subtle", "#6a8094"),
  };
}

function setStatus(message, tone = "") {
  status.textContent = message;
  status.classList.toggle("is-error", tone === "error");
}

function xForHz(hz) {
  const t =
    (Math.log(hz) - Math.log(MIN_HZ)) /
    (Math.log(MAX_HZ) - Math.log(MIN_HZ));
  return t * width;
}

function resize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  width = Math.max(1, Math.round(rect.width));
  height = Math.max(1, Math.round(rect.height));

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  if (!running) {
    drawIdle();
  }
}

function drawGrid() {
  const plotBottom = height - 28;

  ctx.strokeStyle = palette.grid;
  ctx.lineWidth = 1;

  [0.25, 0.5, 0.75].forEach((ratio) => {
    const y = Math.round(plotBottom * ratio) + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  });

  ctx.fillStyle = palette.text;
  ctx.font = FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  [
    { hz: 100, label: "100 Hz" },
    { hz: 1000, label: "1 kHz" },
    { hz: 4000, label: "4 kHz" },
  ].forEach(({ hz, label }) => {
    const x = xForHz(hz);

    if (x < 24 || x > width - 24) return;

    ctx.beginPath();
    ctx.moveTo(Math.round(x) + 0.5, 8);
    ctx.lineTo(Math.round(x) + 0.5, plotBottom);
    ctx.stroke();

    ctx.fillText(label, x, height - 20);
  });
}

function clearCanvas() {
  ctx.fillStyle = palette.surface;
  ctx.fillRect(0, 0, width, height);
}

function drawIdle() {
  clearCanvas();
  drawGrid();

  ctx.fillStyle = palette.text;
  ctx.font = FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("等待输入", width / 2, height / 2 - 10);
  ctx.fillText("点击「开始监听」并允许麦克风权限", width / 2, height / 2 + 12);
}

function drawSpectrum() {
  clearCanvas();
  drawGrid();

  const plotTop = 8;
  const plotBottom = height - 28;
  const plotHeight = plotBottom - plotTop;
  const barCount = Math.max(24, Math.floor(width / 14));
  const gap = 2;
  const barWidth = (width - gap * (barCount - 1)) / barCount;
  const binHz = audioContext.sampleRate / analyser.fftSize;

  let loudest = 0;

  for (let i = 0; i < barCount; i += 1) {
    const hz1 = MIN_HZ * (MAX_HZ / MIN_HZ) ** (i / barCount);
    const hz2 = MIN_HZ * (MAX_HZ / MIN_HZ) ** ((i + 1) / barCount);
    const bin1 = Math.max(1, Math.floor(hz1 / binHz));
    const bin2 = Math.max(bin1, Math.floor(hz2 / binHz));

    let value = 0;

    for (let bin = bin1; bin <= bin2 && bin < freqData.length; bin += 1) {
      value = Math.max(value, freqData[bin]);
    }

    loudest = Math.max(loudest, value);

    if (value < 3) continue;

    const barHeight = Math.max(2, (value / 255) * plotHeight);
    const x = i * (barWidth + gap);
    const y = plotBottom - barHeight;

    ctx.fillStyle = palette.accent;

    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }

  if (loudest < 6) {
    ctx.fillStyle = palette.text;
    ctx.font = FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("等待声音", width / 2, (plotTop + plotBottom) / 2);
  }
}

function dominantFrequency() {
  const binHz = audioContext.sampleRate / analyser.fftSize;
  const minBin = Math.max(1, Math.ceil(50 / binHz));
  const maxBin = Math.min(
    freqData.length - 2,
    Math.floor(MAX_HZ / binHz)
  );

  let maxValue = 0;
  let maxIndex = -1;

  for (let bin = minBin; bin <= maxBin; bin += 1) {
    if (freqData[bin] > maxValue) {
      maxValue = freqData[bin];
      maxIndex = bin;
    }
  }

  if (maxIndex < 0 || maxValue < 45) return 0;

  const y0 = freqData[maxIndex - 1] || 0;
  const y1 = freqData[maxIndex];
  const y2 = freqData[maxIndex + 1] || 0;
  const denominator = y0 - 2 * y1 + y2;
  const shift = denominator ? (0.5 * (y0 - y2)) / denominator : 0;

  return (maxIndex + shift) * binHz;
}

function levelDb() {
  let sum = 0;

  for (let i = 0; i < timeData.length; i += 1) {
    const value = (timeData[i] - 128) / 128;
    sum += value * value;
  }

  const rms = Math.sqrt(sum / timeData.length);
  return rms > 0 ? 20 * Math.log10(rms) : Number.NEGATIVE_INFINITY;
}

function updateReadouts() {
  const frequency = dominantFrequency();
  const db = levelDb();

  if (frequency > 0) {
    const midi = 69 + 12 * Math.log2(frequency / 440);
    const nearest = Math.round(midi);
    const name = NOTE_NAMES[((nearest % 12) + 12) % 12];
    const octave = Math.floor(nearest / 12) - 1;
    const cents = Math.round((midi - nearest) * 100);

    noteValue.textContent = `${name}${octave}`;
    noteValue.classList.remove("is-empty");
    freqValue.textContent = String(Math.round(frequency));
    centsValue.textContent = `${cents > 0 ? "+" : ""}${cents}`;
  } else {
    noteValue.textContent = "· · ·";
    noteValue.classList.add("is-empty");
    freqValue.textContent = "—";
    centsValue.textContent = "—";
  }

  if (Number.isFinite(db) && db > -70) {
    levelValue.textContent = db.toFixed(0);
  } else {
    levelValue.textContent = "—";
  }

  const ratio = Number.isFinite(db)
    ? Math.min(1, Math.max(0, (db + 60) / 60))
    : 0;

  levelBar.style.transform = `scaleX(${ratio.toFixed(3)})`;
}

function loop(now) {
  if (!running) return;

  raf = window.requestAnimationFrame(loop);

  if (reduced.matches && now - lastFrame < 100) {
    return;
  }

  lastFrame = now;

  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(timeData);

  drawSpectrum();

  if (now - lastReadout > 150) {
    lastReadout = now;
    updateReadouts();
  }
}

async function start() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setStatus("当前浏览器不支持麦克风输入。", "error");
    return;
  }

  if (!window.isSecureContext) {
    setStatus("麦克风需要在 HTTPS 或 localhost 下运行。", "error");
    return;
  }

  startBtn.disabled = true;
  setStatus("正在请求麦克风权限…");

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl: false,
      },
    });

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioCtx();
    await audioContext.resume();

    source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    timeData = new Uint8Array(analyser.fftSize);
    freqData = new Uint8Array(analyser.frequencyBinCount);
    palette = readPalette();

    running = true;
    startBtn.hidden = true;
    stopBtn.hidden = false;
    startBtn.disabled = false;
    setStatus("正在监听。对着麦克风发出持续的声音。");

    resize();
    raf = window.requestAnimationFrame(loop);
  } catch (error) {
    startBtn.disabled = false;

    if (error.name === "NotAllowedError") {
      setStatus("麦克风权限被拒绝。允许权限后再试一次。", "error");
    } else if (error.name === "NotFoundError") {
      setStatus("没有找到可用的麦克风。", "error");
    } else {
      setStatus(`无法打开麦克风：${error.message || error.name}`, "error");
    }
  }
}

function stop() {
  running = false;
  window.cancelAnimationFrame(raf);
  raf = 0;

  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }

  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }

  analyser = null;
  source = null;

  startBtn.hidden = false;
  stopBtn.hidden = true;
  startBtn.disabled = false;

  noteValue.textContent = "· · ·";
  noteValue.classList.add("is-empty");
  freqValue.textContent = "—";
  centsValue.textContent = "—";
  levelValue.textContent = "—";
  levelBar.style.transform = "scaleX(0)";

  palette = readPalette();
  drawIdle();
  setStatus("已停止。");
}

startBtn.addEventListener("click", start);
stopBtn.addEventListener("click", stop);

document.addEventListener("themechange", () => {
  palette = readPalette();
  if (!running) drawIdle();
});

if (typeof ResizeObserver === "function") {
  new ResizeObserver(resize).observe(canvas.parentElement);
} else {
  window.addEventListener("resize", resize);
}

resize();

if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !(window.AudioContext || window.webkitAudioContext)) {
  startBtn.disabled = true;
  setStatus("当前浏览器不支持音频分析。", "error");
} else if (!window.isSecureContext) {
  startBtn.disabled = true;
  setStatus("麦克风需要在 HTTPS 或 localhost 下运行。", "error");
} else {
  setStatus("麦克风未开启。点击「开始监听」授权后开始分析。");
}
