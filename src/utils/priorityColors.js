export const PRIORITY_META = {
  High: { color: "#ef4444", bg: "#fef2f2", label: "High", dot: "#ef4444" },
  Med:  { color: "#f59e0b", bg: "#fffbeb", label: "Med",  dot: "#f59e0b" },
  Low:  { color: "#10b981", bg: "#ecfdf5", label: "Low",  dot: "#10b981" },
};

export const getPriority = (key) =>
  PRIORITY_META[key] || PRIORITY_META["Low"];
