// Shared by the chip editor and the API; commas, semicolons and newlines separate phrases.
export function roleKeywords(value: string | string[]): string[] {
  const seen = new Set<string>();
  return (Array.isArray(value) ? value : [value]).flatMap(part => part.split(/[,;\n\r]+/))
    .map(part => part.trim().replace(/\s+/g, " ")).filter(part => {
      const key = part.toLowerCase();
      if (!part || seen.has(key)) return false;
      seen.add(key); return true;
    });
}

export function validRoleKeywords(keywords: string[]) {
  return keywords.length <= 60 && keywords.every(keyword => keyword.length <= 100);
}
