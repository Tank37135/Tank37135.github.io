const $ = (id) => document.getElementById(id);

const startBtn = $("startBtn");
const pauseBtn = $("pauseBtn");
const stopBtn = $("stopBtn");
const micToggle = $("micToggle");
const audioToggle = $("audioToggle");
const preview = $("preview");
const placeholder = $("placeholder");
const badge = $("badge");
const badgeText = $("badgeText");
const status = $("status");
const timer = $("timer");
const result = $("result");
const playback = $("playback");
const downloadBtn = $("downloadBtn");
const fileMeta = $("fileMeta");

const MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4",
];

let state = "idle";
let displayStream = null;
let micStream = null;
let recorder = null;
let chunks = [];
let audioContext = null;
let timerId = 0;
let startedAt = 0;
let pausedTotal = 0;
let pauseStarted = null;
let recordedDuration = 0;
let playbackUrl = null;

const supported = Boolean(
  navigator.mediaDevices &&
    navigator.mediaDevices.getDisplayMedia &&
    window.MediaRecorder
);

function setStatus(message, tone = "") {
  status.textContent = message;
  status.classList.toggle("is-error", tone === "error");
  status.classList.toggle("is-warning", tone === "warn");
}

function formatDuration(milliseconds) {
  const total = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (value) => String(value).padStart(2, "0");

  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}

function formatBytes(bytes) {
  if (!bytes) return "0 MB";

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    units.length - 1,
    Math.floor(Math.log(bytes) / Math.log(1024))
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function timestamp() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

function extension(type) {
  return type.startsWith("video/mp4") ? "mp4" : "webm";
}

function pickMime() {
  return (
    MIME_TYPES.find((type) => {
      try {
        return MediaRecorder.isTypeSupported(type);
      } catch {
        return false;
      }
    }) || ""
  );
}

function elapsed() {
  if (!startedAt) return 0;

  const now = performance.now();
  const paused = pausedTotal + (pauseStarted ? now - pauseStarted : 0);

  return Math.max(0, now - startedAt - paused);
}

function updateTimer() {
  timer.textContent = formatDuration(elapsed());
}

function startTimer() {
  startedAt = performance.now();
  pausedTotal = 0;
  pauseStarted = null;
  timer.textContent = "00:00";
  window.clearInterval(timerId);
  timerId = window.setInterval(updateTimer, 250);
}

function stopTimer() {
  window.clearInterval(timerId);
  timerId = 0;
}

function setState(next) {
  state = next;

  const active = next === "recording" || next === "paused";
  const busy = active || next === "stopping";

  startBtn.hidden = busy;
  pauseBtn.hidden = !active;
  stopBtn.hidden = !active;
  badge.hidden = !active;
  micToggle.disabled = active;
  audioToggle.disabled = active;
}

function mixAudio(screenStream, microphoneStream) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioCtx();

  const destination = audioContext.createMediaStreamDestination();
  const screenAudio = screenStream.getAudioTracks();

  if (screenAudio.length) {
    audioContext
      .createMediaStreamSource(new MediaStream(screenAudio))
      .connect(destination);
  }

  audioContext
    .createMediaStreamSource(microphoneStream)
    .connect(destination);

  return new MediaStream([
    ...screenStream.getVideoTracks(),
    ...destination.stream.getAudioTracks(),
  ]);
}

function cleanupStreams() {
  if (displayStream) {
    displayStream.getTracks().forEach((track) => track.stop());
    displayStream = null;
  }

  if (micStream) {
    micStream.getTracks().forEach((track) => track.stop());
    micStream = null;
  }

  if (audioContext) {
    audioContext.close().catch(() => {});
    audioContext = null;
  }

  preview.srcObject = null;
  preview.hidden = true;
  placeholder.hidden = false;
}

function resetForNewRecording() {
  result.hidden = true;
  playback.hidden = true;
  playback.pause();
  playback.removeAttribute("src");
  playback.load();

  if (playbackUrl) {
    URL.revokeObjectURL(playbackUrl);
    playbackUrl = null;
  }

  preview.hidden = false;
  placeholder.hidden = false;
  timer.textContent = "00:00";
  badgeText.textContent = "录制中";
  pauseBtn.lastElementChild.textContent = "暂停";
  pauseBtn.querySelector(".icon").className = "icon icon--pause";
  setState("idle");
}

function finalize() {
  const type = recorder.mimeType || "video/webm";
  const blob = new Blob(chunks, { type });
  chunks = [];
  recorder = null;

  if (!blob.size) {
    setState("idle");
    setStatus("没有录到内容，请重试。", "error");
    return;
  }

  if (playbackUrl) {
    URL.revokeObjectURL(playbackUrl);
  }

  playbackUrl = URL.createObjectURL(blob);
  playback.src = playbackUrl;
  playback.hidden = false;
  placeholder.hidden = true;
  preview.hidden = true;
  downloadBtn.href = playbackUrl;
  downloadBtn.download = `tank-recording-${timestamp()}.${extension(type)}`;
  fileMeta.textContent = `${formatBytes(blob.size)} · ${formatDuration(
    recordedDuration
  )}`;
  result.hidden = false;

  startBtn.lastElementChild.textContent = "重新录制";
  setState("ready");
  setStatus("录制完成，可以预览或下载。");
}

async function start() {
  if (!supported) return;

  resetForNewRecording();
  startBtn.disabled = true;
  setStatus("正在请求屏幕权限…");

  let warning = "";

  try {
    displayStream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: { ideal: 30, max: 60 } },
      audio: audioToggle.checked,
    });

    const [videoTrack] = displayStream.getVideoTracks();
    if (!videoTrack) {
      throw new Error("没有获得视频轨道");
    }

    videoTrack.addEventListener("ended", () => {
      if (state === "recording" || state === "paused") {
        stop("user");
      }
    });

    if (micToggle.checked) {
      try {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      } catch {
        warning = "麦克风不可用，将只录制屏幕声音。";
      }
    }

    let stream = displayStream;

    if (micStream) {
      try {
        stream = mixAudio(displayStream, micStream);
      } catch {
        stream = displayStream;
        warning = "音频混合失败，将只使用屏幕声音。";
      }
    }

    const mimeType = pickMime();
    const options = { videoBitsPerSecond: 6_000_000 };
    if (mimeType) options.mimeType = mimeType;

    recorder = new MediaRecorder(stream, options);
    chunks = [];

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size) {
        chunks.push(event.data);
      }
    });

    recorder.addEventListener("stop", finalize);
    recorder.start(1000);

    preview.srcObject = displayStream;
    preview.hidden = false;
    placeholder.hidden = true;
    preview.play().catch(() => {});

    startTimer();
    setState("recording");
    setStatus(
      warning
        ? `${warning} 正在录制。`
        : "正在录制。点击「停止」结束，或使用浏览器的停止共享按钮。",
      warning ? "warn" : ""
    );
  } catch (error) {
    cleanupStreams();
    setState("idle");
    startBtn.disabled = false;

    if (error.name === "NotAllowedError") {
      setStatus("你取消了共享，或浏览器拒绝了屏幕权限。", "error");
    } else if (error.name === "NotFoundError") {
      setStatus("没有找到可录制的屏幕或音频设备。", "error");
    } else {
      setStatus(`无法开始录制：${error.message || error.name}`, "error");
    }
  } finally {
    startBtn.disabled = false;
  }
}

function stop(reason = "button") {
  if (!recorder || (state !== "recording" && state !== "paused")) return;

  recordedDuration = elapsed();
  stopTimer();

  setStatus(
    reason === "user" ? "共享已停止，正在处理录像…" : "正在处理录像…"
  );

  if (recorder.state !== "inactive") {
    recorder.stop();
  }

  setState("stopping");
  cleanupStreams();
}

function togglePause() {
  if (!recorder) return;

  if (state === "recording") {
    recorder.pause();
    pauseStarted = performance.now();
    setState("paused");
    pauseBtn.lastElementChild.textContent = "继续";
    pauseBtn.querySelector(".icon").className = "icon icon--play";
    badgeText.textContent = "已暂停";
    setStatus("已暂停。点击「继续」恢复录制。");
  } else if (state === "paused") {
    recorder.resume();

    if (pauseStarted) {
      pausedTotal += performance.now() - pauseStarted;
      pauseStarted = null;
    }

    setState("recording");
    pauseBtn.lastElementChild.textContent = "暂停";
    pauseBtn.querySelector(".icon").className = "icon icon--pause";
    badgeText.textContent = "录制中";
    setStatus("正在录制。");
  }
}

startBtn.addEventListener("click", start);
pauseBtn.addEventListener("click", togglePause);
stopBtn.addEventListener("click", () => stop("button"));

window.addEventListener("beforeunload", (event) => {
  if (state === "recording" || state === "paused") {
    event.preventDefault();
    event.returnValue = "";
  }
});

if (!supported) {
  startBtn.disabled = true;
  setStatus(
    "当前浏览器不支持屏幕录制。请使用最新版 Chrome、Edge 或 Firefox。",
    "error"
  );
} else if (!window.isSecureContext) {
  startBtn.disabled = true;
  setStatus("屏幕录制需要在 HTTPS 或 localhost 下运行。", "error");
} else {
  setStatus("准备就绪。录制的文件只保存在本地。");
}
