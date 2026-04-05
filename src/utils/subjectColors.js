export const SUBJECTS = [
  { id: "math",    label: "Mathematics",   color: "#6366f1", bg: "#eef2ff", dark: "#c7d2fe" },
  { id: "cs",      label: "Computer Sci",  color: "#0ea5e9", bg: "#e0f2fe", dark: "#bae6fd" },
  { id: "english", label: "English",       color: "#ec4899", bg: "#fdf2f8", dark: "#fbcfe8" },
  { id: "history", label: "History",       color: "#f59e0b", bg: "#fffbeb", dark: "#fde68a" },
  { id: "science", label: "Science",       color: "#10b981", bg: "#ecfdf5", dark: "#a7f3d0" },
  { id: "art",     label: "Art & Design",  color: "#f97316", bg: "#fff7ed", dark: "#fed7aa" },
  { id: "physics", label: "Physics",       color: "#8b5cf6", bg: "#f5f3ff", dark: "#ddd6fe" },
  { id: "other",   label: "Other",         color: "#6b7280", bg: "#f9fafb", dark: "#e5e7eb" },
];

export const getSubject = (id) =>
  SUBJECTS.find((s) => s.id === id) || SUBJECTS[SUBJECTS.length - 1];

export const GRADE_POINTS = {
  "A+": 4.0, A: 4.0, "A-": 3.7,
  "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7,
  "D+": 1.3, D: 1.0, "D-": 0.7,
  F: 0.0,
};

export const LETTER_GRADES = Object.keys(GRADE_POINTS);

export const percentToLetter = (pct) => {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  if (pct >= 60) return "D-";
  return "F";
};

export const gpaColor = (gpa) => {
  if (gpa >= 3.7) return "#10b981";
  if (gpa >= 3.0) return "#6366f1";
  if (gpa >= 2.0) return "#f59e0b";
  return "#ef4444";
};
