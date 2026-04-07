import React, { useState } from "react";

export default function LoginPage({ onLogin }) {
    const [mode, setMode] = useState("login"); // "login" | "signup"
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const handleSubmit = () => {
        setError("");
        if (mode === "signup" && !form.name.trim()) {
            setError("Name is required.");
            return;
        }
        if (!form.email.trim() || !form.email.includes("@")) {
            setError("Enter a valid email.");
            return;
        }
        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        // Simulate async auth — replace with real auth later
        setTimeout(() => {
            const users = JSON.parse(localStorage.getItem("studyos-users") || "[]");

            if (mode === "signup") {
                if (users.find((u) => u.email === form.email)) {
                    setError("An account with this email already exists.");
                    setLoading(false);
                    return;
                }
                const newUser = { name: form.name.trim(), email: form.email.trim(), password: form.password };
                localStorage.setItem("studyos-users", JSON.stringify([...users, newUser]));
                localStorage.setItem("studyos-session", JSON.stringify({ name: newUser.name, email: newUser.email }));
                onLogin({ name: newUser.name, email: newUser.email });
            } else {
                const user = users.find((u) => u.email === form.email && u.password === form.password);
                if (!user) {
                    setError("Invalid email or password.");
                    setLoading(false);
                    return;
                }
                localStorage.setItem("studyos-session", JSON.stringify({ name: user.name, email: user.email }));
                onLogin({ name: user.name, email: user.email });
            }
            setLoading(false);
        }, 600);
    };

    const handleKey = (e) => {
        if (e.key === "Enter") handleSubmit();
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Brand */}
                <div className="login-brand">
                    <span className="login-brand-icon">📚</span>
                    <span className="login-brand-name">StudyOS</span>
                </div>

                <h1 className="login-heading">
                    {mode === "login" ? "Welcome back" : "Create account"}
                </h1>
                <p className="login-sub">
                    {mode === "login"
                        ? "Sign in to continue to your dashboard."
                        : "Start tracking your studies, grades & focus."}
                </p>

                {/* Mode toggle */}
                <div className="login-mode-toggle">
                    <button
                        className={`login-mode-btn ${mode === "login" ? "active" : ""}`}
                        onClick={() => { setMode("login"); setError(""); }}
                    >
                        Sign in
                    </button>
                    <button
                        className={`login-mode-btn ${mode === "signup" ? "active" : ""}`}
                        onClick={() => { setMode("signup"); setError(""); }}
                    >
                        Sign up
                    </button>
                </div>

                {/* Fields */}
                <div className="login-fields">
                    {mode === "signup" && (
                        <div className="login-field">
                            <label className="login-label">Name</label>
                            <input
                                className="login-input"
                                type="text"
                                placeholder="Your name"
                                value={form.name}
                                onChange={(e) => update("name", e.target.value)}
                                onKeyDown={handleKey}
                                autoFocus={mode === "signup"}
                            />
                        </div>
                    )}
                    <div className="login-field">
                        <label className="login-label">Email</label>
                        <input
                            className="login-input"
                            type="email"
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={(e) => update("email", e.target.value)}
                            onKeyDown={handleKey}
                            autoFocus={mode === "login"}
                        />
                    </div>
                    <div className="login-field">
                        <label className="login-label">Password</label>
                        <input
                            className="login-input"
                            type="password"
                            placeholder="••••••••"
                            value={form.password}
                            onChange={(e) => update("password", e.target.value)}
                            onKeyDown={handleKey}
                        />
                    </div>
                </div>

                {error && <div className="login-error">{error}</div>}

                <button
                    className={`login-submit ${loading ? "loading" : ""}`}
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
                </button>

                <p className="login-footer-note">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        className="login-switch-link"
                        onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
                    >
                        {mode === "login" ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}