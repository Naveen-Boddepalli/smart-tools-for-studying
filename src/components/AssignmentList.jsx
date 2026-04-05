import React, { useState } from "react";
import AssignmentCard from "./AssignmentCard";
import { SUBJECTS } from "../utils/subjectColors";

export default function AssignmentList({ assignments, onComplete, onDelete }) {
  const [filterSubject, setFilterSubject] = useState("all");
  const [showArchive, setShowArchive] = useState(false);

  const active = assignments.filter((a) => !a.completed);
  const archived = assignments.filter((a) => a.completed);

  const filtered = (list) =>
    filterSubject === "all"
      ? list
      : list.filter((a) => a.subject === filterSubject);

  const sorted = (list) =>
    [...list].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  const usedSubjects = ["all", ...new Set(assignments.map((a) => a.subject))];

  const exportCSV = () => {
    const headers = ["Name", "Subject", "Priority", "Due Date", "Status"];
    const rows = assignments.map((a) => [
      a.name,
      SUBJECTS.find((s) => s.id === a.subject)?.label || a.subject,
      a.priority,
      a.dueDate,
      a.completed ? "Completed" : "Active",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "assignments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="assignment-list">
      <div className="list-toolbar">
        <div className="subject-filters">
          {usedSubjects.map((sid) => {
            const sub = sid === "all" ? null : SUBJECTS.find((s) => s.id === sid);
            return (
              <button
                key={sid}
                className={`subject-filter-btn ${filterSubject === sid ? "active" : ""}`}
                style={
                  filterSubject === sid && sub
                    ? { background: sub.bg, color: sub.color, borderColor: sub.color }
                    : {}
                }
                onClick={() => setFilterSubject(sid)}
              >
                {sid === "all" ? "All" : sub?.label}
              </button>
            );
          })}
        </div>
        <button className="export-btn" onClick={exportCSV}>
          ↓ Export CSV
        </button>
      </div>

      {filtered(sorted(active)).length === 0 && (
        <div className="empty-state">
          {active.length === 0
            ? "No assignments yet — add one above! 🎉"
            : "No assignments for this subject."}
        </div>
      )}

      <div className="cards-list">
        {filtered(sorted(active)).map((a) => (
          <AssignmentCard
            key={a.id}
            assignment={a}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>

      {archived.length > 0 && (
        <div className="archive-section">
          <button
            className="archive-toggle"
            onClick={() => setShowArchive(!showArchive)}
          >
            {showArchive ? "▾" : "▸"} Completed ({archived.length})
          </button>
          {showArchive && (
            <div className="cards-list faded">
              {filtered(sorted(archived)).map((a) => (
                <AssignmentCard
                  key={a.id}
                  assignment={a}
                  onComplete={onComplete}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
