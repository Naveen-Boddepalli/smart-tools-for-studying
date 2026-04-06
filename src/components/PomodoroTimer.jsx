import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const PRESETS = {
  default: { work: 25 * 60, break: 5 * 60 },
};

// ── Web Audio helpers ──────────────────────────────────────────────
function createAudioCtx() {
  return new (window.AudioContext || window.webkitAudioContext)();
}

function playTick(ctx) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  gain.gain.setValueAtTime(0.04, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.06);
}

function playChime(ctx, isBreakEnd) {
  // Focus end → ascending warm chime; Break end → single clean bell
  const notes = isBreakEnd ? [523] : [523, 659, 784];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);
    gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
    gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + i * 0.18 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.18 + 0.9);
    osc.start(ctx.currentTime + i * 0.18);
    osc.stop(ctx.currentTime + i * 0.18 + 1);
  });
}

// ──────────────────────────────────────────────────────────────────
export default function PomodoroTimer() {
  const WORK = PRESETS.default.work;
  const BREAK = PRESETS.default.break;

  const [timeLeft, setTimeLeft] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useLocalStorage("pomodoro-sessions", []);
  const [taskLabel, setTaskLabel] = useState("");
  const [autoStart, setAutoStart] = useLocalStorage("pomodoro-autostart", false);

  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const audioCtxRef = useRef(null);
  const tickCountRef = useRef(0);

  const total = isBreak ? BREAK : WORK;
  const progress = (total - timeLeft) / total;

  // ── Get or create AudioContext (lazy, after user gesture) ──
  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = createAudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  // ── Canvas draw ───────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.offsetWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const cx = size / 2, cy = size / 2, r = size / 2 - 12;

    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = isBreak ? "#d1fae5" : "#e0e7ff";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Progress arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
    ctx.strokeStyle = isBreak ? "#10b981" : "#6366f1";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [progress, isBreak]);

  useEffect(() => { draw(); }, [draw]);

  // ── Keyboard shortcuts ────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e) => {
      // Don't fire when typing in the task input
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        handleStartPause();
      }
      if (e.code === "KeyR") reset();
      if (e.code === "KeyS") skip();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [running, isBreak]); // eslint-disable-line

  // ── Timer interval ────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          // Tick every second
          tickCountRef.current += 1;
          if (tickCountRef.current % 1 === 0) {
            try { playTick(getAudioCtx()); } catch (_) { }
          }

          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);

            const endingBreak = isBreak;

            // Chime
            try { playChime(getAudioCtx(), endingBreak); } catch (_) { }

            // Browser notification
            if (!endingBreak) {
              setSessions((s) => [
                ...s,
                {
                  id: Date.now(),
                  at: new Date().toLocaleTimeString(),
                  duration: 25,
                  label: taskLabel.trim() || null,
                },
              ]);
              if (Notification.permission === "granted") {
                new Notification("Pomodoro done! 🎉", { body: "Time for a break." });
              }
            } else {
              if (Notification.permission === "granted") {
                new Notification("Break over!", { body: "Ready to focus again?" });
              }
            }

            setIsBreak((b) => !b);
            const next = endingBreak ? WORK : BREAK;

            if (autoStart) {
              // slight delay so state settles, then re-start
              setTimeout(() => setRunning(true), 300);
            }

            return next;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isBreak, autoStart, taskLabel]); // eslint-disable-line

  // ── Browser tab title ─────────────────────────────────────────
  useEffect(() => {
    const orig = document.title;
    if (running) {
      const m = String(Math.floor(timeLeft / 60)).padStart(2, "0");
      const s = String(timeLeft % 60).padStart(2, "0");
      document.title = `${isBreak ? "☕" : "🎯"} ${m}:${s} — StudyOS`;
    } else {
      document.title = orig;
    }
    return () => { document.title = orig; };
  }, [timeLeft, running, isBreak]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  function handleStartPause() {
    getAudioCtx(); // unlock audio on first gesture
    if (!running && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setRunning((r) => !r);
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK);
    tickCountRef.current = 0;
  }

  function skip() {
    clearInterval(intervalRef.current);
    setRunning(false);
    const next = !isBreak;
    setIsBreak(next);
    setTimeLeft(next ? BREAK : WORK);
    tickCountRef.current = 0;
  }

  return (
    <div className="pomodoro-wrap">
      <div className="pomodoro-card">
        <div className="pomo-mode">{isBreak ? "☕ Break Time" : "🎯 Focus Mode"}</div>

        {/* Task label input */}
        <div className="pomo-task-row">
          <input
            className="pomo-task-input"
            type="text"
            placeholder="What are you working on?"
            value={taskLabel}
            onChange={(e) => setTaskLabel(e.target.value)}
            maxLength={60}
          />
        </div>

        <div className="canvas-wrap">
          <canvas
            ref={canvasRef}
            style={{ width: "200px", height: "200px", display: "block" }}
          />
          <div className="pomo-time">
            <span className="pomo-digits">{mins}:{secs}</span>
            <span className="pomo-label">{isBreak ? "break" : "focus"}</span>
          </div>
        </div>

        <div className="pomo-controls">
          <button className="pomo-btn" onClick={reset} title="Reset (R)">↺ Reset</button>
          <button
            className={`pomo-btn primary ${running ? "pause" : ""}`}
            onClick={handleStartPause}
            title="Start / Pause (Space)"
          >
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
          <button className="pomo-btn" onClick={skip} title="Skip phase (S)">⏭ Skip</button>
        </div>

        {/* Auto-start toggle */}
        <div className="pomo-autostart-row">
          <label className="pomo-toggle-label">
            <span className="pomo-toggle-switch">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
              />
              <span className="pomo-toggle-track" />
            </span>
            Auto-start next phase
          </label>
        </div>

        {/* Keyboard hint */}
        <div className="pomo-shortcuts">
          <span>Space · start/pause</span>
          <span>R · reset</span>
          <span>S · skip</span>
        </div>
      </div>

      {/* Session log */}
      <div className="sessions-log">
        <h3 className="section-title">Session Log</h3>
        {sessions.length === 0 ? (
          <div className="empty-state small">Complete a session to log it here.</div>
        ) : (
          <div className="sessions-list">
            {[...sessions].reverse().map((s) => (
              <div key={s.id} className="session-row">
                <span className="session-icon">✅</span>
                <span className="session-time">{s.at}</span>
                <span className="session-dur">{s.duration} min focus</span>
                {s.label && <span className="session-label">{s.label}</span>}
              </div>
            ))}
          </div>
        )}
        {sessions.length > 0 && (
          <div className="sessions-total">
            {sessions.length} sessions · {sessions.reduce((a, x) => a + x.duration, 0)} min total
          </div>
        )}
      </div>
    </div>
  );
}