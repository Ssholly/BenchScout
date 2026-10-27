// Verification/recovery links must complete before the first Home visit.
export function needsHomeLanding(pathname: string, hasVisitedHome: boolean): boolean {
  if (hasVisitedHome || pathname === "/home") return false;
  if (["/verify", "/reset-password", "/reset"].includes(pathname)) return false;
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return false;
  return true;
}
