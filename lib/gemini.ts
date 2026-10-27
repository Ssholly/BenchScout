import { ApiError } from "@/lib/security";

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
type Generation = { candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[] };

// Called only by authenticated server routes. Credentials never enter a URL or browser bundle.
export async function generateText(parts: Part[], options: { system?: string; schema?: Record<string, unknown>; maxOutputTokens?: number } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new ApiError(503, "AI tools are temporarily unavailable.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  if (!/^[a-zA-Z0-9._-]+$/.test(model)) throw new ApiError(503, "AI model configuration is invalid.");
  let response: Response;
  try {
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST", cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30000),
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts }],
        ...(options.system ? { systemInstruction: { parts: [{ text: options.system }] } } : {}),
        generationConfig: { maxOutputTokens: options.maxOutputTokens || 4096,
          ...(options.schema ? { responseMimeType: "application/json", responseJsonSchema: options.schema } : {}),
        },
      }),
    });
  } catch { throw new ApiError(503, "AI tools could not be reached. Please try again."); }
  if (!response.ok) throw new ApiError(503, response.status === 429 ? "AI tools are busy. Please try again shortly." : "AI tools are temporarily unavailable.");
  let data: Generation;
  try { data = await response.json(); } catch { throw new ApiError(502, "AI returned an unreadable response. Please try again."); }
  if (!data || !Array.isArray(data.candidates)) throw new ApiError(502, "AI returned an unreadable response. Please try again.");
  const candidate = data.candidates[0];
  if (candidate?.finishReason && candidate.finishReason !== "STOP") throw new ApiError(502, "AI could not finish the response. Please try again.");
  const outputParts = candidate?.content?.parts;
  const text = Array.isArray(outputParts) ? outputParts.filter(part => part && !part.thought && typeof part.text === "string").map(part => part.text).join("").trim() : "";
  if (!text || text.length > 30000) throw new ApiError(502, "AI returned an incomplete response. Please try again.");
  return text;
}

export const licenseSchema = { type: "object", properties: {
  licenseNumber: { type: "string" }, expiryDate: { type: "string" }, fullName: { type: "string" },
}, required: ["licenseNumber", "expiryDate", "fullName"], additionalProperties: false };

export function parseLicense(text: string) {
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new ApiError(502, "AI could not read the document. Enter its details manually."); }
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(502, "AI returned invalid document details.");
  const record = value as Record<string, unknown>;
  const field = (key: string, max: number) => {
    const raw = record[key];
    if (typeof raw !== "string" || raw.length > max) throw new ApiError(502, "AI returned invalid document details.");
    return raw.trim() === "Not Found" ? "" : raw.trim();
  };
  const licenseNumber = field("licenseNumber", 100), fullName = field("fullName", 250), expiryDate = field("expiryDate", 30);
  if (expiryDate && (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate) || !Number.isFinite(Date.parse(expiryDate)) || new Date(expiryDate).toISOString().slice(0,10) !== expiryDate)) throw new ApiError(502, "AI could not read a valid expiry date. Enter it manually.");
  return { licenseNumber, fullName, expiryDate };
}
