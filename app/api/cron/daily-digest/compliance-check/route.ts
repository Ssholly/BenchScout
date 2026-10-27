import { escapeHtml } from "@/lib/security";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";

export const GET = withApi("cron", async () => {
  const users = await prisma.user.findMany({ where: { licenseExpiry: { not: null }, isVerified: true }, select: { email: true, name: true, licenseExpiry: true } });
  let dispatchedCount = 0;
  let failedCount = 0;
  for (const user of users) {
    const days = Math.ceil((user.licenseExpiry!.getTime() - Date.now()) / 86400000);
    if (days !== 30) continue;
    try {
      await sendEmail(user.email, "BenchScout: license date reminder", `<p>Hello ${escapeHtml(user.name)},</p><p>The license expiry date recorded in your profile is ${user.licenseExpiry!.toISOString().slice(0, 10)}, about 30 days away. Review your details and renewal requirements with the issuing authority.</p>`);
      dispatchedCount++;
    } catch { failedCount++; }
  }
  return Response.json({ success: failedCount === 0, processedCount: users.length, dispatchedCount, failedCount });
});
