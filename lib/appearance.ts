export type Appearance = "light" | "dark";
export const APPEARANCE_KEY = "benchscout_appearance";
export const APPEARANCE_EVENT = "appearanceChanged";

// Fixed first-party code only. Runs in the document head before content paints.
export const APPEARANCE_BOOTSTRAP = `(function(){
  var preference;
  try { preference = localStorage.getItem('benchscout_appearance'); } catch (_) {}
  var theme = preference === 'dark' || preference === 'light' ? preference :
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.appearanceExplicit = preference === 'dark' || preference === 'light' ? 'true' : 'false';
  document.querySelectorAll('meta[name="theme-color"]').forEach(function(meta){ meta.setAttribute('content', theme === 'dark' ? '#0c1625' : '#edf5fd'); });
})();`;

export function currentAppearance(): Appearance {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function applyAppearance(theme: Appearance, explicit: boolean) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.dataset.appearanceExplicit = String(explicit);
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.setAttribute("content", theme === "dark" ? "#0c1625" : "#edf5fd"));
}

export function setAppearance(theme: Appearance) {
  applyAppearance(theme, true);
  try { localStorage.setItem(APPEARANCE_KEY, theme); } catch { /* Keep this session usable when storage is blocked. */ }
  window.dispatchEvent(new Event(APPEARANCE_EVENT));
}

export function subscribeAppearance(notify: () => void) {
  // Reconcile metadata after React hydrates/hoists the document head.
  applyAppearance(currentAppearance(), document.documentElement.dataset.appearanceExplicit === "true");
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (document.documentElement.dataset.appearanceExplicit !== "true") {
      applyAppearance(media.matches ? "dark" : "light", false);
      notify();
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== APPEARANCE_KEY && event.key !== null) return;
    const value = event.key === null ? null : event.newValue;
    const explicit = value === "light" || value === "dark";
    applyAppearance(explicit ? value : media.matches ? "dark" : "light", explicit);
    notify();
  };
  window.addEventListener(APPEARANCE_EVENT, notify);
  window.addEventListener("storage", onStorage);
  media.addEventListener("change", onSystemChange);
  return () => {
    window.removeEventListener(APPEARANCE_EVENT, notify);
    window.removeEventListener("storage", onStorage);
    media.removeEventListener("change", onSystemChange);
  };
}
