export const getStudyHours = (priority) => {
  switch (priority) {
    case "High": return 4;
    case "Med":  return 2;
    case "Low":  return 1;
    default:     return 1;
  }
};

export const getTotalStudyHours = (assignments) =>
  assignments
    .filter((a) => !a.completed)
    .reduce((sum, a) => sum + getStudyHours(a.priority), 0);

export const getWeeklyWorkload = (assignments) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const counts = Array(7).fill(0);
  const now = new Date();

  assignments
    .filter((a) => !a.completed)
    .forEach((a) => {
      const due = new Date(a.dueDate);
      const diff = Math.floor((due - now) / 86400000);
      if (diff >= 0 && diff < 7) {
        counts[due.getDay()] += getStudyHours(a.priority);
      }
    });

  return days.map((d, i) => ({ day: d, hours: counts[i] }));
};

export const isUrgent = (dueDate) => {
  const diff = new Date(dueDate) - new Date();
  return diff > 0 && diff < 48 * 3600 * 1000;
};

export const isOverdue = (dueDate) => new Date(dueDate) < new Date();

export const formatDueDate = (dueDate) => {
  const diff = new Date(dueDate) - new Date();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days}d left`;
};
