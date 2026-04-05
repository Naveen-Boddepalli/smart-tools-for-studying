import React from "react";
import { getSubject } from "../utils/subjectColors";
import { getPriority } from "../utils/priorityColors";
import { isUrgent, isOverdue, formatDueDate } from "../utils/studyTimeCalculator";

export default function AssignmentCard({ assignment, onComplete, onDelete }) {
  const { name, dueDate, priority, subject, completed } = assignment;
  const sub = getSubject(subject);
  const pri = getPriority(priority);
  const urgent = !completed && isUrgent(dueDate);
  const overdue = !completed && isOverdue(dueDate);

  return (
    <div
      className={`assignment-card ${completed ? "completed" : ""} ${urgent ? "urgent" : ""} ${overdue ? "overdue" : ""}`}
      style={{ borderLeftColor: sub.color }}
    >
      <div className="card-left">
        <div
          className="subject-dot"
          style={{ background: sub.color }}
          title={sub.label}
        />
        <div className="card-body">
          <div className="card-title-row">
            <span className={`card-name ${completed ? "strikethrough" : ""}`}>
              {name}
            </span>
            {urgent && <span className="badge-urgent">⚠️ Due soon</span>}
            {overdue && <span className="badge-overdue">Overdue</span>}
          </div>
          <div className="card-meta">
            <span
              className="subject-tag"
              style={{ background: sub.bg, color: sub.color }}
            >
              {sub.label}
            </span>
            <span
              className="priority-tag"
              style={{ background: pri.bg, color: pri.color }}
            >
              {priority}
            </span>
            <span className={`due-label ${overdue ? "overdue-text" : ""}`}>
              📅 {formatDueDate(dueDate)}
            </span>
          </div>
        </div>
      </div>
      <div className="card-actions">
        {!completed && (
          <button
            className="btn-complete"
            onClick={() => onComplete(assignment.id)}
            title="Mark complete"
          >
            ✓
          </button>
        )}
        <button
          className="btn-delete"
          onClick={() => onDelete(assignment.id)}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
