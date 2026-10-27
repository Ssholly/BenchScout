// Share only overlapping reads. Completed responses are never cached.
const pending = new Map<string, Promise<Response>>();
// A saved profile must not reuse a read started with earlier preferences.
export function invalidateSharedPageRequests() { pending.clear(); }

export async function sharedPageRequest(url: string): Promise<Response> {
  const identity = localStorage.getItem("benchscout_identity") || "signed-out";
  const key = `${identity}:${url}`;
  let request = pending.get(key);
  if (!request) {
    // Failed/cold connections must reach the page's retry UI instead of spinning forever.
    request = fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) });
    pending.set(key, request);
    const clear = () => { if (pending.get(key) === request) pending.delete(key); };
    void request.then(clear, clear);
  }
  // Each consumer can read its own body independently.
  return (await request).clone();
}
