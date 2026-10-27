import { ApiError, hashToken } from "@/lib/security";

export type AccountRole = "candidate" | "employer";
export function accountRole(value: unknown): AccountRole {
    if (value == null || value === "candidate") return "candidate";
    if (value === "employer") return "employer";
    throw new ApiError(400, "Invalid account type.");
}
// Keep candidate keys compatible with already-issued links; namespace employer keys.
export function accountTokenKey(email: string, role: AccountRole): string {
    return role === "employer" ? `employer@${email}` : email;
}
export function storedAccountToken(raw: string): string { return `sha256:${hashToken(raw)}`; }
export function accountTokenCandidates(value: unknown): string[] {
    if (typeof value !== "string" || !/^[a-f0-9]{64}$/.test(value)) throw new ApiError(400, "Invalid or expired link. Please request a new one.");
    // Old emailed links remain usable until their original expiry; all new tokens are hashed.
    return [storedAccountToken(value), value];
}
