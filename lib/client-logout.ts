export async function signOutToHome(): Promise<boolean> {
    try {
        const response = await fetch("/api/auth/logout", { method: "POST" });
        if (!response.ok) return false;
        Object.keys(localStorage)
            .filter(key => key.startsWith("labpro_") || key.startsWith("benchscout_"))
            .forEach(key => localStorage.removeItem(key));
        // Discard every mounted account view instead of leaving stale employer state behind.
        window.location.replace("/home");
        return true;
    } catch {
        return false;
    }
}
