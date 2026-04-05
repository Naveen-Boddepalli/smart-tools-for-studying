import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const WORK = 25 * 60;
const BREAK = 5 * 60;

export default function PomodoroTimer() {
  const [timeLeft, setTimeLeft] = useState(WORK);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useLocalStorage("pomodoro-sessions", []);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const total = isBreak ? BREAK : WORK;
  const progress = (total - timeLeft) / total;

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

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (!isBreak) {
              setSessions((s) => [
                ...s,
                { id: Date.now(), at: new Date().toLocaleTimeString(), duration: 25 },
              ]);
              if (Notification.permission === "granted") {
                new Notification("Pomodoro done! 🎉", { body: "Time for a break." });
              }
            }
            setIsBreak((b) => !b);
            return isBreak ? WORK : BREAK;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, isBreak]);

  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");

  const reset = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
    setIsBreak(false);
    setTimeLeft(WORK);
  };

  const requestNotif = () => {
    if (Notification.permission === "default") Notification.requestPermission();
  };

  return (
    <div className="pomodoro-wrap">
      <div className="pomodoro-card">
        <div className="pomo-mode">{isBreak ? "☕ Break Time" : "🎯 Focus Mode"}</div>
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
          <button className="pomo-btn" onClick={reset}>↺ Reset</button>
          <button
            className={`pomo-btn primary ${running ? "pause" : ""}`}
            onClick={() => { setRunning(!running); requestNotif(); }}
          >
            {running ? "⏸ Pause" : "▶ Start"}
          </button>
        </div>
      </div>

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
              </div>
            ))}
          </div>
        )}
        {sessions.length > 0 && (
          <div className="sessions-total">
            {sessions.length} sessions · {sessions.reduce((s, x) => s + x.duration, 0)} min total
          </div>
        )}
      </div>
    </div>
  );
}
