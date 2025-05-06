export function formatTime(seconds: number): string {
  if (seconds == null || isNaN(seconds)) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts = [];
  if (hrs > 0) parts.push(String(hrs));
  parts.push(hrs > 0 ? String(mins).padStart(2, "0") : String(mins));
  parts.push(String(secs).padStart(2, "0"));
  return parts.join(":");
}

export function formatDeadline(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
