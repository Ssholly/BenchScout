import { emailField } from "@/lib/security";
import { accountRole, accountTokenKey, storedAccountToken } from "@/lib/account-tokens";
import { sendVerificationEmail } from "@/lib/verification-email";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "node:crypto";

export const POST = withApi("public", async request => {
    const body = await request.json();
    const email = emailField(body.email);
    const role = accountRole(body.role);
    const key = accountTokenKey(email, role);
    const needsConfirmation = role === "employer"
        ? await prisma.employer.findUnique({ where: { email }, select: { emailVerificationRequired: true, emailVerifiedAt: true } }).then(account => account?.emailVerificationRequired && !account.emailVerifiedAt)
        : await prisma.user.findUnique({ where: { email }, select: { isVerified: true } }).then(account => account && !account.isVerified);
    if (needsConfirmation) {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await prisma.verificationToken.upsert({ where: { email: key }, create: { email: key, token: storedAccountToken(token), expiresAt }, update: { token: storedAccountToken(token), expiresAt } });
        try { await sendVerificationEmail(request, email, token, role); }
        catch { console.error("Verification email delivery failed; recipient can retry."); }
    }
    return NextResponse.json({ success: true, message: "If your account needs verification, check your inbox for a new link. You can retry if it does not arrive." });
}, { limit: 5 });
