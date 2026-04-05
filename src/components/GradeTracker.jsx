import React, { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  SUBJECTS,
  getSubject,
  GRADE_POINTS,
  LETTER_GRADES,
  percentToLetter,
  gpaColor,
} from "../utils/subjectColors";

const EMPTY_ENTRY = { name: "", subject: "cs", grade: "", gradeType: "letter", credits: "3" };

export default function GradeTracker({ darkMode }) {
  const [entries, setEntries] = useLocalStorage("grade-entries", []);
  const [form, setForm] = useState(EMPTY_ENTRY);
  const [adding, setAdding] = useState(false);
  const canvasRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const resolvePoints = (entry) => {
    if (entry.gradeType === "letter") return GRADE_POINTS[entry.grade] ?? null;
    const pct = parseFloat(entry.grade);
    if (isNaN(pct)) return null;
    return GRADE_POINTS[percentToLetter(pct)] ?? 0;
  };

  const gpa = (() => {
    const valid = entries.filter((e) => resolvePoints(e) !== null);
    if (!valid.length) return null;
    const totalCredits = valid.reduce((s, e) => s + (parseFloat(e.credits) || 3), 0);
    const weightedSum = valid.reduce(
      (s, e) => s + resolvePoints(e) * (parseFloat(e.credits) || 3),
      0
    );
    return totalCredits > 0 ? weightedSum / totalCredits : null;
  })();

  const addEntry = () => {
    if (!form.name.trim() || !form.grade) return;
    setEntries([...entries, { ...form, id: Date.now() }]);
    setForm(EMPTY_ENTRY);
    setAdding(false);
  };

  const deleteEntry = (id) => setEntries(entries.filter((e) => e.id !== id));

  // Canvas trend chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || entries.length < 2) return;

    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const points = entries
      .map((e) => resolvePoints(e))
      .filter((p) => p !== null);

    if (points.length < 2) return;

    const padL = 40, padR = 20, padT = 20, padB = 30;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const minY = 0, maxY = 4.0;

    const toX = (i) => padL + (i / (points.length - 1)) * chartW;
    const toY = (v) => padT + chartH - ((v - minY) / (maxY - minY)) * chartH;

    const gridColor = darkMode ? "#374151" : "#f3f4f6";
    const textColor = darkMode ? "#9ca3af" : "#6b7280";

    // Grid
    [0, 1, 2, 3, 4].forEach((g) => {
      const y = toY(g);
      ctx.beginPath();
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.font = "11px DM Sans, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(g.toFixed(1), padL - 4, y + 4);
    });

    // Area fill
    const grad = ctx.createLinearGradient(0, padT, 0, padT + chartH);
    grad.addColorStop(0, "rgba(99,102,241,0.25)");
    grad.addColorStop(1, "rgba(99,102,241,0.0)");
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(points[0]));
    points.forEach((p, i) => ctx.lineTo(toX(i), toY(p)));
    ctx.lineTo(toX(points.length - 1), toY(minY));
    ctx.lineTo(toX(0), toY(minY));
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    points.forEach((p, i) => {
      i === 0 ? ctx.moveTo(toX(i), toY(p)) : ctx.lineTo(toX(i), toY(p));
    });
    ctx.stroke();

    // Dots + labels
    points.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(toX(i), toY(p), 5, 0, Math.PI * 2);
      ctx.fillStyle = "#6366f1";
      ctx.fill();
      ctx.strokeStyle = darkMode ? "#1f2937" : "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();

      // X label (truncated course name)
      const label = entries.filter((e) => resolvePoints(e) !== null)[i]?.name.slice(0, 6) || "";
      ctx.fillStyle = textColor;
      ctx.font = "10px DM Sans, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, toX(i), H - 8);
    });
  }, [entries, darkMode]);

  // By-subject GPA breakdown
  const subjectBreakdown = SUBJECTS.map((sub) => {
    const subEntries = entries.filter((e) => e.subject === sub.id && resolvePoints(e) !== null);
    if (!subEntries.length) return null;
    const totalC = subEntries.reduce((s, e) => s + (parseFloat(e.credits) || 3), 0);
    const ws = subEntries.reduce((s, e) => s + resolvePoints(e) * (parseFloat(e.credits) || 3), 0);
    return { ...sub, gpa: ws / totalC, count: subEntries.length };
  }).filter(Boolean);

  return (
    <div className="grade-tracker">
      {/* GPA Hero */}
      <div className="gpa-hero">
        <div className="gpa-circle" style={{ borderColor: gpa ? gpaColor(gpa) : "#e5e7eb" }}>
          <div className="gpa-number" style={{ color: gpa ? gpaColor(gpa) : "#9ca3af" }}>
            {gpa !== null ? gpa.toFixed(2) : "—"}
          </div>
          <div className="gpa-sub">Cumulative GPA</div>
        </div>
        <div className="gpa-breakdown">
          {subjectBreakdown.length === 0 && (
            <div className="empty-state small">Add grades to see your breakdown</div>
          )}
          {subjectBreakdown.map((s) => (
            <div key={s.id} className="breakdown-row">
              <span className="breakdown-dot" style={{ background: s.color }} />
              <span className="breakdown-label">{s.label}</span>
              <div className="breakdown-bar-wrap">
                <div
                  className="breakdown-bar"
                  style={{
                    width: `${(s.gpa / 4) * 100}%`,
                    background: s.color,
                  }}
                />
              </div>
              <span className="breakdown-val" style={{ color: s.color }}>
                {s.gpa.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Chart */}
      {entries.filter((e) => resolvePoints(e) !== null).length >= 2 && (
        <div className="chart-card" style={{ marginBottom: "1.5rem" }}>
          <div className="chart-header">
            <span>📈</span>
            <span>GPA Trend</span>
          </div>
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "180px", display: "block" }}
          />
        </div>
      )}

      {/* Grade Entries Table */}
      <div className="grades-section">
        <div className="section-header-row">
          <h3 className="section-title">Grade Entries</h3>
          <button className="add-trigger-btn small" onClick={() => setAdding(!adding)}>
            + Add Grade
          </button>
        </div>

        {adding && (
          <div className="add-form-card" style={{ marginBottom: "1rem" }}>
            <div className="form-row">
              <input
                className="form-input"
                placeholder="Course / assignment name…"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-row form-row-4">
              <select
                className="form-select"
                value={form.subject}
                onChange={(e) => set("subject", e.target.value)}
              >
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <select
                className="form-select"
                value={form.gradeType}
                onChange={(e) => set("gradeType", e.target.value)}
              >
                <option value="letter">Letter grade</option>
                <option value="percent">Percentage</option>
              </select>
              {form.gradeType === "letter" ? (
                <select
                  className="form-select"
                  value={form.grade}
                  onChange={(e) => set("grade", e.target.value)}
                >
                  <option value="">Grade…</option>
                  {LETTER_GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="%"
                  value={form.grade}
                  onChange={(e) => set("grade", e.target.value)}
                />
              )}
              <input
                className="form-input"
                type="number"
                min="1"
                max="6"
                placeholder="Credits"
                value={form.credits}
                onChange={(e) => set("credits", e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
              <button className="btn-add" onClick={addEntry}>Save Grade</button>
            </div>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="empty-state">No grades logged yet.</div>
        ) : (
          <div className="grades-table-wrap">
            <table className="grades-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Subject</th>
                  <th>Grade</th>
                  <th>GPA Pts</th>
                  <th>Credits</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const sub = getSubject(e.subject);
                  const pts = resolvePoints(e);
                  const displayGrade =
                    e.gradeType === "percent"
                      ? `${e.grade}% (${percentToLetter(parseFloat(e.grade))})`
                      : e.grade;
                  return (
                    <tr key={e.id}>
                      <td className="grade-name">{e.name}</td>
                      <td>
                        <span
                          className="subject-tag"
                          style={{ background: sub.bg, color: sub.color }}
                        >
                          {sub.label}
                        </span>
                      </td>
                      <td className="grade-val">{displayGrade}</td>
                      <td>
                        <span
                          className="gpa-pts"
                          style={{ color: pts !== null ? gpaColor(pts) : "#9ca3af" }}
                        >
                          {pts !== null ? pts.toFixed(1) : "—"}
                        </span>
                      </td>
                      <td className="credits-val">{e.credits}</td>
                      <td>
                        <button
                          className="btn-delete small"
                          onClick={() => deleteEntry(e.id)}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
