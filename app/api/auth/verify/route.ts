import { ApiError, emailField } from "@/lib/security";
import { accountRole, accountTokenKey, accountTokenCandidates } from "@/lib/account-tokens";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const POST = withApi("public", async request => {
    const body = await request.json();
    const email = emailField(body.email);
    const role = accountRole(body.role);
    const key = accountTokenKey(email, role);
    const tokens = accountTokenCandidates(body.token);
    await prisma.$transaction(async tx => {
        const consumed = await tx.verificationToken.deleteMany({ where: { email: key, token: { in: tokens }, expiresAt: { gt: new Date() } } });
        if (consumed.count !== 1) throw new ApiError(400, "Invalid or expired verification link. Request a new verification email.");
        if (role === "employer") await tx.employer.update({ where: { email }, data: { emailVerifiedAt: new Date() } });
        else await tx.user.update({ where: { email }, data: { isVerified: true } });
    });
    return NextResponse.json({ success: true, message: "Email verified successfully! You can now log in." });
}, { limit: 10 });
