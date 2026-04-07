import React, { useState, useRef, useEffect } from "react";

export default function Navbar({ darkMode, setDarkMode, activeTab, setActiveTab, user, onLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const tabs = [
    { id: "assignments", label: "Assignments" },
    { id: "grades", label: "Grade Tracker" },
    { id: "pomodoro", label: "Pomodoro" },
    { id: "expenses", label: "Expenses" },
    { id: "fitness", label: "💪 Fitness" },
  ];

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Initials from name
  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

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

      <div className="navbar-right">
        {/* Dark mode toggle */}
        <button
          className="theme-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* User avatar + dropdown */}
        {user && (
          <div className="user-menu-wrap" ref={menuRef}>
            <button
              className="user-avatar-btn"
              onClick={() => setMenuOpen((o) => !o)}
              title={user.name}
            >
              <span className="user-initials">{initials}</span>
            </button>

            {menuOpen && (
              <div className="user-dropdown">
                <div className="user-dropdown-info">
                  <span className="user-dropdown-name">{user.name}</span>
                  <span className="user-dropdown-email">{user.email}</span>
                </div>
                <div className="user-dropdown-divider" />
                <button
                  className="user-dropdown-logout"
                  onClick={() => { setMenuOpen(false); onLogout(); }}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}