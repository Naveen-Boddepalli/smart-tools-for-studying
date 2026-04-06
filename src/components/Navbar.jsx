import React from "react";

export default function Navbar({ darkMode, setDarkMode, activeTab, setActiveTab }) {
  const tabs = [
    { id: "assignments", label: "Assignments" },
    { id: "grades", label: "Grade Tracker" },
    { id: "pomodoro", label: "Pomodoro" },
    { id: "expenses", label: "Expenses" },
    { id: "fitness", label: "💪 Fitness" },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">📚</span>
        <span className="brand-name">StudyOS</span>
      </div>
      <div className="navbar-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`nav-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        className="theme-toggle"
        onClick={() => setDarkMode(!darkMode)}
        title="Toggle dark mode"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>
    </nav>
  );
}