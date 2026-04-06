import React, { useState } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const ACTIVITY_TYPES = ["Running", "Walking", "Cycling", "Swimming", "Gym", "Yoga", "Other"];

export default function FitnessTracker() {
    const [logs, setLogs] = useLocalStorage("fitness-logs", []);
    const [form, setForm] = useState({ date: "", activity: "Running", duration: "", calories: "", notes: "" });
    const [bmi, setBmi] = useLocalStorage("fitness-bmi", { weight: "", height: "", unit: "metric" });
    const [bmiResult, setBmiResult] = useState(null);
    const [activeSection, setActiveSection] = useState("log");

    // --- Activity Log ---
    const handleAdd = () => {
        if (!form.date || !form.duration) return;
        setLogs((prev) => [...prev, { ...form, id: Date.now() }]);
        setForm({ date: "", activity: "Running", duration: "", calories: "", notes: "" });
    };

    const handleDelete = (id) => setLogs((prev) => prev.filter((l) => l.id !== id));

    // --- BMI Calculator ---
    const calcBmi = () => {
        const w = parseFloat(bmi.weight);
        const h = parseFloat(bmi.height);
        if (!w || !h) return;

        let value;
        if (bmi.unit === "metric") {
            value = w / ((h / 100) ** 2);
        } else {
            value = (703 * w) / (h ** 2);
        }

        value = parseFloat(value.toFixed(1));
        let category, color;
        if (value < 18.5) { category = "Underweight"; color = "#3b82f6"; }
        else if (value < 25) { category = "Normal weight"; color = "#10b981"; }
        else if (value < 30) { category = "Overweight"; color = "#f59e0b"; }
        else { category = "Obese"; color = "#ef4444"; }

        setBmiResult({ value, category, color });
    };

    // --- Stats ---
    const totalMinutes = logs.reduce((s, l) => s + Number(l.duration || 0), 0);
    const totalCalories = logs.reduce((s, l) => s + Number(l.calories || 0), 0);
    const thisWeek = logs.filter((l) => {
        const d = new Date(l.date);
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return d >= weekAgo;
    }).length;

    return (
        <div className="fitness-tracker">

            {/* Stats Row */}
            <div className="fitness-stats">
                <div className="fitness-stat-card">
                    <span className="stat-icon">🏃</span>
                    <div>
                        <div className="stat-value">{logs.length}</div>
                        <div className="stat-label">Total Sessions</div>
                    </div>
                </div>
                <div className="fitness-stat-card">
                    <span className="stat-icon">⏱️</span>
                    <div>
                        <div className="stat-value">{totalMinutes}</div>
                        <div className="stat-label">Total Minutes</div>
                    </div>
                </div>
                <div className="fitness-stat-card">
                    <span className="stat-icon">🔥</span>
                    <div>
                        <div className="stat-value">{totalCalories}</div>
                        <div className="stat-label">Calories Burned</div>
                    </div>
                </div>
                <div className="fitness-stat-card">
                    <span className="stat-icon">📅</span>
                    <div>
                        <div className="stat-value">{thisWeek}</div>
                        <div className="stat-label">This Week</div>
                    </div>
                </div>
            </div>

            {/* Section Tabs */}
            <div className="fitness-section-tabs">
                {[
                    { id: "log", label: "➕ Log Activity" },
                    { id: "bmi", label: "⚖️ BMI Checker" },
                    { id: "history", label: "📋 History" },
                ].map((s) => (
                    <button
                        key={s.id}
                        className={`fitness-tab-btn ${activeSection === s.id ? "active" : ""}`}
                        onClick={() => setActiveSection(s.id)}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {/* ── Log Activity ── */}
            {activeSection === "log" && (
                <div className="fitness-card">
                    <h3>Log a Workout</h3>
                    <div className="fitness-form-grid">
                        <div className="fitness-form-group">
                            <label>Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                        </div>
                        <div className="fitness-form-group">
                            <label>Activity</label>
                            <select
                                value={form.activity}
                                onChange={(e) => setForm({ ...form, activity: e.target.value })}
                            >
                                {ACTIVITY_TYPES.map((a) => <option key={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="fitness-form-group">
                            <label>Duration (mins)</label>
                            <input
                                type="number"
                                min="1"
                                placeholder="e.g. 30"
                                value={form.duration}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                            />
                        </div>
                        <div className="fitness-form-group">
                            <label>Calories Burned</label>
                            <input
                                type="number"
                                min="0"
                                placeholder="e.g. 250"
                                value={form.calories}
                                onChange={(e) => setForm({ ...form, calories: e.target.value })}
                            />
                        </div>
                        <div className="fitness-form-group fitness-full-width">
                            <label>Notes (optional)</label>
                            <input
                                type="text"
                                placeholder="e.g. Morning jog in the park"
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </div>
                    <button className="fitness-add-btn" onClick={handleAdd}>
                        Add Workout
                    </button>
                </div>
            )}

            {/* ── BMI Checker ── */}
            {activeSection === "bmi" && (
                <div className="fitness-card">
                    <h3>BMI Calculator</h3>
                    <div className="bmi-unit-toggle">
                        <button
                            className={`bmi-unit-btn ${bmi.unit === "metric" ? "active" : ""}`}
                            onClick={() => setBmi({ ...bmi, unit: "metric", weight: "", height: "" })}
                        >
                            Metric (kg / cm)
                        </button>
                        <button
                            className={`bmi-unit-btn ${bmi.unit === "imperial" ? "active" : ""}`}
                            onClick={() => setBmi({ ...bmi, unit: "imperial", weight: "", height: "" })}
                        >
                            Imperial (lbs / in)
                        </button>
                    </div>
                    <div className="bmi-form">
                        <div className="fitness-form-group">
                            <label>Weight ({bmi.unit === "metric" ? "kg" : "lbs"})</label>
                            <input
                                type="number"
                                placeholder={bmi.unit === "metric" ? "e.g. 65" : "e.g. 143"}
                                value={bmi.weight}
                                onChange={(e) => setBmi({ ...bmi, weight: e.target.value })}
                            />
                        </div>
                        <div className="fitness-form-group">
                            <label>Height ({bmi.unit === "metric" ? "cm" : "inches"})</label>
                            <input
                                type="number"
                                placeholder={bmi.unit === "metric" ? "e.g. 170" : "e.g. 67"}
                                value={bmi.height}
                                onChange={(e) => setBmi({ ...bmi, height: e.target.value })}
                            />
                        </div>
                    </div>
                    <button className="fitness-add-btn" onClick={calcBmi}>
                        Calculate BMI
                    </button>

                    {bmiResult && (
                        <div className="bmi-result">
                            <div className="bmi-value" style={{ color: bmiResult.color }}>
                                {bmiResult.value}
                            </div>
                            <div className="bmi-category" style={{ color: bmiResult.color }}>
                                {bmiResult.category}
                            </div>
                            <div className="bmi-scale">
                                <span style={{ color: "#3b82f6" }}>● Underweight &lt;18.5</span>
                                <span style={{ color: "#10b981" }}>● Normal 18.5–24.9</span>
                                <span style={{ color: "#f59e0b" }}>● Overweight 25–29.9</span>
                                <span style={{ color: "#ef4444" }}>● Obese ≥30</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── History ── */}
            {activeSection === "history" && (
                <div className="fitness-card">
                    <h3>Workout History</h3>
                    {logs.length === 0 ? (
                        <div className="fitness-empty">
                            No workouts logged yet. Start by adding one!
                        </div>
                    ) : (
                        <div className="fitness-log-list">
                            {[...logs].reverse().map((l) => (
                                <div key={l.id} className="fitness-log-item">
                                    <div className="log-left">
                                        <span className="log-activity">{l.activity}</span>
                                        <span className="log-date">{l.date}</span>
                                        {l.notes && <span className="log-notes">{l.notes}</span>}
                                    </div>
                                    <div className="log-right">
                                        <span className="log-stat">⏱ {l.duration} min</span>
                                        {l.calories && <span className="log-stat">🔥 {l.calories} cal</span>}
                                        <button className="btn-delete small" onClick={() => handleDelete(l.id)}>✕</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

        </div>
    );
}