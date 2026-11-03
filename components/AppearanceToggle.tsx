"use client";

import { useSyncExternalStore } from "react";
import { currentAppearance, setAppearance, subscribeAppearance } from "@/lib/appearance";

export default function AppearanceToggle() {
  const theme = useSyncExternalStore(subscribeAppearance, currentAppearance, () => "light");
  const dark = theme === "dark";
  return <button type="button" className="appearance-toggle" aria-label="Dark mode" aria-pressed={dark}
    title={dark ? "Switch to light mode" : "Switch to dark mode"}
    onClick={() => setAppearance(dark ? "light" : "dark")}>
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dark ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></> :
        <path d="M20.8 13.1A8.7 8.7 0 0 1 10.9 3.2 8.8 8.8 0 1 0 20.8 13.1Z" />}
    </svg>
  </button>;
}
