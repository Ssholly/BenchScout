// The supported African timezones have fixed UTC offsets and no daylight saving.
export const scheduleZones: Record<string, { iana: string; offset: number }> = {
  GMT: { iana: "Etc/UTC", offset: 0 },
  WAT: { iana: "Africa/Lagos", offset: 60 },
  CAT: { iana: "Africa/Harare", offset: 120 },
  SAST: { iana: "Africa/Johannesburg", offset: 120 },
  EAT: { iana: "Africa/Nairobi", offset: 180 },
};

export function nextScheduledRun(time: string, days: string[], zone: string, now = new Date()) {
  if (!days.length || !scheduleZones[zone]) return null;
  const offset = scheduleZones[zone].offset * 60_000;
  const local = new Date(now.getTime() + offset);
  const [hour, minute] = time.split(":").map(Number);
  local.setUTCHours(hour, minute, 0, 0);
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  for (let i = 0; i < 8; i++) {
    const instant = new Date(local.getTime() - offset);
    if (instant > now && days.includes(weekdays[local.getUTCDay()])) return instant;
    local.setUTCDate(local.getUTCDate() + 1);
  }
  return null;
}
