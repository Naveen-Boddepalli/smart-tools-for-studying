import React, { useState } from "react";
import { SUBJECTS } from "../utils/subjectColors";

const EMPTY = {
  name: "",
  dueDate: "",
  priority: "Med",
  subject: "cs",
};

export default function AddAssignmentForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [open, setOpen] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name.trim() || !form.dueDate) return;
    onAdd({
      ...form,
      id: Date.now(),
      completed: false,
      createdAt: new Date().toISOString(),
    });
    setForm(EMPTY);
    setOpen(false);
  };

  return (
    <div className="add-form-wrap">
      {!open ? (
        <button className="add-trigger-btn" onClick={() => setOpen(true)}>
          + Add Assignment
        </button>
      ) : (
        <div className="add-form-card">
          <div className="form-row">
            <input
              className="form-input"
              placeholder="Assignment name…"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-row form-row-3">
            <input
              className="form-input"
              type="date"
              value={form.dueDate}
              onChange={(e) => set("dueDate", e.target.value)}
            />
            <select
              className="form-select"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value)}
            >
              <option value="High">🔴 High</option>
              <option value="Med">🟡 Medium</option>
              <option value="Low">🟢 Low</option>
            </select>
            <select
              className="form-select"
              value={form.subject}
              onChange={(e) => set("subject", e.target.value)}
            >
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button className="btn-cancel" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-add" onClick={handleSubmit}>
              Add Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
