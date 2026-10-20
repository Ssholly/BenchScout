/** Interview inputs use Nigeria time, independently of browser/server timezone. */
export function interviewScheduleError(date: unknown, time: unknown, now = Date.now()): string | null {
  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) return "Choose a valid interview date.";
  if (typeof time !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return "Choose a valid interview time.";
  if (Date.parse(`${date}T${time}:00+01:00`) <= now) return "Choose a future interview date and time (Africa/Lagos).";
  return null;
}
