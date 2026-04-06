import React, { useState } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import AddAssignmentForm from "./components/AddAssignmentForm";
import AssignmentList from "./components/AssignmentList";
import PomodoroTimer from "./components/PomodoroTimer";
import SmartTip from "./components/SmartTip";
import WorkloadChart from "./components/WorkloadChart";
import GradeTracker from "./components/GradeTracker";
import ExpenseTracker from "./components/ExpenseTracker";
import FitnessTracker from "./components/FitnessTracker"; // ← NEW
import { useLocalStorage } from "./hooks/useLocalStorage";

export default function App() {
  const [darkMode, setDarkMode] = useLocalStorage("dark-mode", false);
  const [activeTab, setActiveTab] = useState("assignments");
  const [assignments, setAssignments] = useLocalStorage("assignments", []);

  React.useEffect(() => {
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);

  const addAssignment = (a) => setAssignments((prev) => [...prev, a]);
  const completeAssignment = (id) =>
    setAssignments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  const deleteAssignment = (id) =>
    setAssignments((prev) => prev.filter((a) => a.id !== id));

  return (
    <div className="app">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <main className="main-content">
        {activeTab === "assignments" && (
          <div className="assignments-tab">
            <div className="assignments-main">
              <AddAssignmentForm onAdd={addAssignment} />
              <AssignmentList
                assignments={assignments}
                onComplete={completeAssignment}
                onDelete={deleteAssignment}
              />
            </div>
            <div className="assignments-sidebar">
              <WorkloadChart assignments={assignments} darkMode={darkMode} />
              <SmartTip />
            </div>
          </div>
        )}
        {activeTab === "grades" && <GradeTracker darkMode={darkMode} />}
        {activeTab === "pomodoro" && <PomodoroTimer />}
        {activeTab === "expenses" && <ExpenseTracker darkMode={darkMode} />}
        {activeTab === "fitness" && <FitnessTracker />} {/* ← NEW */}
      </main>
    </div>
  );
}