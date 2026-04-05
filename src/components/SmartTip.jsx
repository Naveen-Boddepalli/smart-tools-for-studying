import React, { useState } from "react";

const TIPS = [
  "Break large tasks into 25-minute Pomodoro chunks to stay focused.",
  "Review your notes within 24 hours of a lecture — retention jumps 60%.",
  "Teach the concept to an imaginary student. If you can't, study it again.",
  "Sleep is when your brain consolidates memory. Don't skip it before exams.",
  "Use active recall instead of rereading — close the book and write what you remember.",
  "Interleave subjects instead of blocking — it feels harder but sticks better.",
  "Start with the hardest subject when your energy is highest.",
  "A 10-minute walk before studying boosts focus and creativity.",
  "Write summaries by hand — the motor memory helps encoding.",
  "Set a specific finish time so your brain knows the session is bounded.",
];

export default function SmartTip() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * TIPS.length));

  const next = () => setIdx((i) => (i + 1) % TIPS.length);

  return (
    <div className="smart-tip">
      <div className="tip-header">
        <span className="tip-icon">💡</span>
        <span className="tip-label">Study Tip</span>
      </div>
      <p className="tip-text">{TIPS[idx]}</p>
      <button className="tip-btn" onClick={next}>Next tip →</button>
    </div>
  );
}
