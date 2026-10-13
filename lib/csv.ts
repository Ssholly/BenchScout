// Spreadsheet exports treat leading formula/control characters as plain text.
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  if (/^\s*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return `"${text.replaceAll('"', '""')}"`;
}
