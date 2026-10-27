import { readFile } from "node:fs/promises";
import path from "node:path";

type AccountEmailOptions = {
  label: string;
  title: string;
  paragraphs: string[];
  actionLabel: string;
  actionUrl: string;
  expiry: string;
  footer: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export async function accountEmailLayout(options: AccountEmailOptions) {
  const logo = await readFile(path.join(process.cwd(), "public/icons/benchscout-192.png"));
  const { label, title, paragraphs, actionLabel, actionUrl, expiry, footer } = options;
  return {
    images: [{ filename: "benchscout-logo.png", content: logo, contentId: "benchscout-logo" }],
    text: [`BenchScout — ${label}`, title, ...paragraphs, `${actionLabel}: ${actionUrl}`, expiry, footer].join("\n\n"),
    html: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f3f7fa;color:#0b2444;font-family:Arial,Helvetica,sans-serif">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 16px">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:440px;background:#ffffff;border:1px solid #e5edf1;border-radius:20px"><tr><td style="padding:28px;text-align:center">
        <table role="presentation" cellspacing="0" cellpadding="0" align="center" style="margin:0 auto 20px"><tr><td><img src="cid:benchscout-logo" width="44" height="44" alt="BenchScout logo" style="display:block;border:0"></td><td style="padding-left:8px;font-family:Georgia,serif;font-size:28px;font-weight:bold;color:#0b2444">Bench<span style="color:#1a8c7a">Scout</span></td></tr></table>
        <span style="display:inline-block;padding:5px 10px;background:#e8f6f2;border-radius:20px;color:#1a8c7a;font-size:10px;font-weight:bold;letter-spacing:1px">${escapeHtml(label)}</span>
        <h1 style="font-size:22px;line-height:1.3;font-weight:600;margin:18px 0 10px">${escapeHtml(title)}</h1>
        ${paragraphs.map(paragraph => `<p style="font-size:14px;line-height:1.7;color:#64748b;margin:0 0 22px">${escapeHtml(paragraph)}</p>`).join("")}
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%"><tr><td bgcolor="#0b2444" style="border-radius:12px;text-align:center"><a href="${escapeHtml(actionUrl)}" style="display:block;padding:14px 20px;font-size:14px;font-weight:bold;color:#ffffff;text-decoration:none">${escapeHtml(actionLabel)} &rarr;</a></td></tr></table>
        <p style="font-size:12px;line-height:1.6;color:#64748b;margin:18px 0 6px">If the button is missing or does not work, open this link:</p>
        <p style="font-size:12px;line-height:1.6;margin:0;word-break:break-all;overflow-wrap:anywhere"><a href="${escapeHtml(actionUrl)}" style="color:#176e61;text-decoration:underline;word-break:break-all;overflow-wrap:anywhere">${escapeHtml(actionUrl)}</a></p>
        <p style="font-size:12px;line-height:1.6;color:#46766c;margin:16px 0">${escapeHtml(expiry)}</p>
        <p style="font-size:12px;line-height:1.7;color:#94a3b8;margin:20px 0 0;padding-top:18px;border-top:1px solid #e5edf1">${escapeHtml(footer)}</p>
      </td></tr></table></td></tr></table></body></html>`,
  };
}
