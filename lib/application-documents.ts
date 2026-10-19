import { createHash } from "node:crypto";
import { ApiError } from "@/lib/security";
import { documentFields, isPrivateBlob } from "@/lib/documents";

export const applicationDocumentKinds = ["resume", "license", "provisional", "degree", "result", "placement", "certificate"] as const;
export type ApplicationDocumentKind = typeof applicationDocumentKinds[number];
export const applicationDocumentLabels: Record<ApplicationDocumentKind, string> = {
  resume: "Curriculum vitae", license: "Practising license", provisional: "Provisional license", degree: "Degree certificate", result: "Statement of result", placement: "Placement letter", certificate: "Additional certificate",
};
type Vault = Partial<Record<typeof documentFields[ApplicationDocumentKind], string | null>>;
export const documentRevision = (url: string) => createHash("sha256").update(url).digest("hex");
export function applicationDocumentOptions(user: Vault) {
  return applicationDocumentKinds.map(kind => {
    const url = user[documentFields[kind]];
    return { kind, name: applicationDocumentLabels[kind], available: !!url && isPrivateBlob(url), revision: url && isPrivateBlob(url) ? documentRevision(url) : null };
  });
}
export function captureDocumentSelection(value: unknown, user: Vault): Record<string, string> {
  if (!Array.isArray(value) || value.length > applicationDocumentKinds.length || !value.some(item => item?.kind === "resume")) throw new ApiError(400, "Select your CV and review the documents to share.");
  const selection: Record<string, string> = {};
  for (const item of value) {
    if (!item || typeof item !== "object" || !applicationDocumentKinds.includes(item.kind) || Object.hasOwn(selection, item.kind)) throw new ApiError(400, "Invalid document selection.");
    const kind = item.kind as ApplicationDocumentKind;
    const url = user[documentFields[kind]];
    if (!url || !isPrivateBlob(url)) throw new ApiError(400, "Selected documents must be uploaded to private storage in Profile & documents.");
    if (item.revision !== documentRevision(url)) throw new ApiError(409, "Your documents have changed. Refresh your profile preview and review the selection again.");
    selection[kind] = url;
  }
  return selection;
}
export function sharedDocumentKinds(selection: unknown, user: Vault): ApplicationDocumentKind[] {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) return [];
  const record = selection as Record<string, unknown>;
  return applicationDocumentKinds.filter(kind => typeof record[kind] === "string" && isPrivateBlob(record[kind] as string) && record[kind] === user[documentFields[kind]]);
}
export function selectedDocumentKinds(selection: unknown): ApplicationDocumentKind[] {
  if (!selection || typeof selection !== "object" || Array.isArray(selection)) return [];
  return applicationDocumentKinds.filter(kind => typeof (selection as Record<string, unknown>)[kind] === "string");
}
export function restrictApplicantDocuments<T extends Vault>(user: T, selections: unknown[], applicationId?: string) {
  const allowed = new Set(selections.flatMap(selection => sharedDocumentKinds(selection, user)));
  return { ...user, ...Object.fromEntries(applicationDocumentKinds.map(kind => [documentFields[kind], allowed.has(kind) ? user[documentFields[kind]] : null])), avatarUrl: null, ...(applicationId ? { documentApplicationId: applicationId } : {}) };
}
