// Browser hints never authorize API access. Clear account-specific UI state on a switch.
export function setClientIdentity(role: "candidate" | "employer", id: string): void {
    const identity = `${role}:${id}`;
    if (localStorage.getItem("benchscout_identity") !== identity) {
        Object.keys(localStorage)
            .filter(key => key.startsWith("labpro_") || key === "benchscout_active_employer" || key.startsWith("benchscout_invited_"))
            .forEach(key => localStorage.removeItem(key));
    }
    localStorage.setItem("benchscout_identity", identity);
}
