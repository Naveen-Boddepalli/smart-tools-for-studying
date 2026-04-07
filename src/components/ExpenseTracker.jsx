import React, { useState, useEffect, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

const CATEGORIES = [
    { id: "food", label: "Food & Dining", icon: "🍜", color: "#f97316", bg: "#fff7ed" },
    { id: "transport", label: "Transport", icon: "🚌", color: "#0ea5e9", bg: "#e0f2fe" },
    { id: "books", label: "Books & Supplies", icon: "📚", color: "#8b5cf6", bg: "#f5f3ff" },
    { id: "rent", label: "Rent & Housing", icon: "🏠", color: "#10b981", bg: "#ecfdf5" },
    { id: "health", label: "Health", icon: "💊", color: "#ec4899", bg: "#fdf2f8" },
    { id: "fun", label: "Entertainment", icon: "🎮", color: "#f59e0b", bg: "#fffbeb" },
    { id: "tech", label: "Tech & Subscriptions", icon: "💻", color: "#6366f1", bg: "#eef2ff" },
    { id: "other", label: "Other", icon: "📦", color: "#6b7280", bg: "#f9fafb" },
];

const EMPTY = { description: "", amount: "", category: "food", type: "expense" };

const getCat = (id) => CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

export default function ExpenseTracker({ darkMode }) {
    const [entries, setEntries] = useLocalStorage("expense-entries", []);
    const [budget, setBudget] = useLocalStorage("expense-budget", 5000);
    const [form, setForm] = useState(EMPTY);
    const [adding, setAdding] = useState(false);
    const [editingBudget, setEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(budget);
    const [filterCat, setFilterCat] = useState("all");
    const [filterType, setFilterType] = useState("all");
    const canvasRef = useRef(null);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    // Totals
    const totalExpenses = entries
        .filter((e) => e.type === "expense")
        .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const totalIncome = entries
        .filter((e) => e.type === "income")
        .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const balance = totalIncome - totalExpenses;
    const budgetUsed = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;

    // Category breakdown
    const catBreakdown = CATEGORIES.map((cat) => {
        const total = entries
            .filter((e) => e.type === "expense" && e.category === cat.id)
            .reduce((s, e) => s + parseFloat(e.amount || 0), 0);
        return { ...cat, total };
    }).filter((c) => c.total > 0)
        .sort((a, b) => b.total - a.total);

    // Donut chart
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || catBreakdown.length === 0) return;
        const dpr = window.devicePixelRatio || 1;
        const size = canvas.offsetWidth;
        canvas.width = size * dpr;
        canvas.height = size * dpr;
        const ctx = canvas.getContext("2d");
        ctx.scale(dpr, dpr);
        ctx.clearRect(0, 0, size, size);

        const cx = size / 2, cy = size / 2;
        const outerR = size / 2 - 8;
        const innerR = outerR * 0.62;
        let startAngle = -Math.PI / 2;

        catBreakdown.forEach((cat) => {
            const slice = (cat.total / totalExpenses) * 2 * Math.PI;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.arc(cx, cy, outerR, startAngle, startAngle + slice);
            ctx.closePath();
            ctx.fillStyle = cat.color;
            ctx.fill();
            startAngle += slice;
        });

        // Inner hole
        ctx.beginPath();
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
        ctx.fillStyle = darkMode ? "#1c1c1a" : "#ffffff";
        ctx.fill();

        // Center text
        ctx.fillStyle = darkMode ? "#f5f4f1" : "#1a1917";
        ctx.font = `600 ${size * 0.13}px DM Sans, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`₹${totalExpenses.toLocaleString("en-IN")}`, cx, cy - size * 0.04);
        ctx.fillStyle = darkMode ? "#6b7280" : "#9ca3af";
        ctx.font = `400 ${size * 0.08}px DM Sans, sans-serif`;
        ctx.fillText("spent", cx, cy + size * 0.09);
    }, [catBreakdown, totalExpenses, darkMode]);

    const addEntry = () => {
        if (!form.description.trim() || !form.amount || isNaN(parseFloat(form.amount))) return;
        setEntries([
            ...entries,
            {
                ...form,
                amount: parseFloat(form.amount).toFixed(2),
                id: Date.now(),
                date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
                timestamp: Date.now(),
            },
        ]);
        setForm(EMPTY);
        setAdding(false);
    };

    const deleteEntry = (id) => setEntries(entries.filter((e) => e.id !== id));

    const saveBudget = () => {
        const val = parseFloat(budgetInput);
        if (!isNaN(val) && val > 0) setBudget(val);
        setEditingBudget(false);
    };

    const filtered = entries
        .filter((e) => filterCat === "all" || e.category === filterCat)
        .filter((e) => filterType === "all" || e.type === filterType)
        .sort((a, b) => b.timestamp - a.timestamp);

    const exportCSV = () => {
        const headers = ["Date", "Description", "Category", "Type", "Amount"];
        const rows = entries.map((e) => [
            e.date,
            e.description,
            getCat(e.category).label,
            e.type,
            e.amount,
        ]);
        const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "expenses.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="expense-tracker">

            {/* ── Summary Cards ── */}
            <div className="expense-summary-grid">
                <div className="expense-stat-card">
                    <div className="expense-stat-label">Total Spent</div>
                    <div className="expense-stat-value red">
                        ₹{totalExpenses.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="expense-stat-card">
                    <div className="expense-stat-label">Total Income</div>
                    <div className="expense-stat-value green">
                        ₹{totalIncome.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="expense-stat-card">
                    <div className="expense-stat-label">Balance</div>
                    <div className={`expense-stat-value ${balance >= 0 ? "green" : "red"}`}>
                        ₹{Math.abs(balance).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        <span className="balance-sign">{balance >= 0 ? " surplus" : " deficit"}</span>
                    </div>
                </div>
                <div className="expense-stat-card budget-card">
                    <div className="expense-stat-label">
                        Monthly Budget
                        <button className="edit-budget-btn" onClick={() => { setEditingBudget(true); setBudgetInput(budget); }}>
                            ✎
                        </button>
                    </div>
                    {editingBudget ? (
                        <div className="budget-edit-row">
                            <input
                                className="form-input budget-input"
                                type="number"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === "Enter" && saveBudget()}
                            />
                            <button className="btn-add" style={{ padding: "6px 12px", fontSize: "13px" }} onClick={saveBudget}>Save</button>
                        </div>
                    ) : (
                        <>
                            <div className="expense-stat-value">
                                ₹{budget.toLocaleString("en-IN")}
                            </div>
                            <div className="budget-bar-wrap">
                                <div
                                    className="budget-bar-fill"
                                    style={{
                                        width: `${budgetUsed}%`,
                                        background: budgetUsed > 90 ? "#ef4444" : budgetUsed > 70 ? "#f59e0b" : "#10b981",
                                    }}
                                />
                            </div>
                            <div className="budget-bar-label">
                                {budgetUsed.toFixed(0)}% used · ₹{Math.max(budget - totalExpenses, 0).toLocaleString("en-IN")} left
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* ── Main grid: chart + list ── */}
            <div className="expense-main-grid">

                {/* Left: donut + category breakdown */}
                <div className="expense-left">
                    <div className="expense-card">
                        <div className="chart-header">
                            <span>🍩</span><span>Spending Breakdown</span>
                        </div>
                        {catBreakdown.length === 0 ? (
                            <div className="empty-state small">No expenses yet.</div>
                        ) : (
                            <>
                                <canvas
                                    ref={canvasRef}
                                    style={{ width: "180px", height: "180px", display: "block", margin: "0 auto 1rem" }}
                                />
                                <div className="cat-legend">
                                    {catBreakdown.map((cat) => (
                                        <div key={cat.id} className="cat-legend-row">
                                            <span className="cat-legend-dot" style={{ background: cat.color }} />
                                            <span className="cat-legend-label">{cat.icon} {cat.label}</span>
                                            <span className="cat-legend-pct" style={{ color: cat.color }}>
                                                {((cat.total / totalExpenses) * 100).toFixed(0)}%
                                            </span>
                                            <span className="cat-legend-amt">
                                                ₹{cat.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right: add + list */}
                <div className="expense-right">

                    {/* Toolbar */}
                    <div className="expense-toolbar">
                        <div className="expense-filters">
                            <select
                                className="form-select"
                                style={{ width: "auto", fontSize: "13px", padding: "5px 10px" }}
                                value={filterCat}
                                onChange={(e) => setFilterCat(e.target.value)}
                            >
                                <option value="all">All categories</option>
                                {CATEGORIES.map((c) => (
                                    <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                                ))}
                            </select>
                            <select
                                className="form-select"
                                style={{ width: "auto", fontSize: "13px", padding: "5px 10px" }}
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="all">All types</option>
                                <option value="expense">Expenses</option>
                                <option value="income">Income</option>
                            </select>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button className="export-btn" onClick={exportCSV}>↓ CSV</button>
                            <button className="add-trigger-btn small" onClick={() => setAdding(!adding)}>
                                + Add
                            </button>
                        </div>
                    </div>

                    {/* Add form */}
                    {adding && (
                        <div className="add-form-card" style={{ marginBottom: "1rem" }}>
                            <div className="form-row">
                                <input
                                    className="form-input"
                                    placeholder="Description (e.g. Lunch at canteen)…"
                                    value={form.description}
                                    onChange={(e) => set("description", e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="form-row form-row-3">
                                <input
                                    className="form-input"
                                    type="number"
                                    placeholder="Amount ₹"
                                    min="0"
                                    step="0.01"
                                    value={form.amount}
                                    onChange={(e) => set("amount", e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addEntry()}
                                />
                                <select
                                    className="form-select"
                                    value={form.category}
                                    onChange={(e) => set("category", e.target.value)}
                                >
                                    {CATEGORIES.map((c) => (
                                        <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
                                    ))}
                                </select>
                                <select
                                    className="form-select"
                                    value={form.type}
                                    onChange={(e) => set("type", e.target.value)}
                                >
                                    <option value="expense">💸 Expense</option>
                                    <option value="income">💰 Income</option>
                                </select>
                            </div>
                            <div className="form-actions">
                                <button className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
                                <button className="btn-add" onClick={addEntry}>Save Entry</button>
                            </div>
                        </div>
                    )}

                    {/* Entries list */}
                    {filtered.length === 0 ? (
                        <div className="empty-state">No entries yet — add your first expense!</div>
                    ) : (
                        <div className="expense-entries">
                            {filtered.map((e) => {
                                const cat = getCat(e.category);
                                return (
                                    <div key={e.id} className="expense-entry-row">
                                        <div
                                            className="expense-cat-icon"
                                            style={{ background: cat.bg, color: cat.color }}
                                        >
                                            {cat.icon}
                                        </div>
                                        <div className="expense-entry-body">
                                            <div className="expense-entry-name">{e.description}</div>
                                            <div className="expense-entry-meta">
                                                <span className="expense-tag" style={{ background: cat.bg, color: cat.color }}>
                                                    {cat.label}
                                                </span>
                                                <span className="expense-date">{e.date}</span>
                                            </div>
                                        </div>
                                        <div className={`expense-amount ${e.type === "income" ? "income-amt" : "expense-amt"}`}>
                                            {e.type === "income" ? "+" : "-"}₹{parseFloat(e.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </div>
                                        <button className="btn-delete small" onClick={() => deleteEntry(e.id)}>✕</button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
