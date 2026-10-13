import { ApiError, passwordField, emailField } from "@/lib/security";
import { accountRole, accountTokenKey, accountTokenCandidates } from "@/lib/account-tokens";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const POST = withApi("public", async request => {
    const body = await request.json();
    const email = emailField(body.email);
    const role = accountRole(body.role);
    const key = accountTokenKey(email, role);
    const tokens = accountTokenCandidates(body.token);
    const password = passwordField(body.newPassword);
    const record = await prisma.passwordResetToken.findFirst({ where: { email: key, token: { in: tokens }, expiresAt: { gt: new Date() } }, select: { id: true } });
    if (!record) throw new ApiError(400, "Invalid or expired reset link. Please request a new one.");
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.$transaction(async tx => {
        const consumed = await tx.passwordResetToken.deleteMany({ where: { id: record.id, email: key, token: { in: tokens }, expiresAt: { gt: new Date() } } });
        if (consumed.count !== 1) throw new ApiError(400, "Invalid or expired reset link. Please request a new one.");
        const account = role === "employer"
            ? await tx.employer.update({ where: { email }, data: { passwordHash }, select: { id: true } })
            : await tx.user.update({ where: { email }, data: { password: passwordHash }, select: { id: true } });
        await tx.authSession.deleteMany({ where: { subjectId: account.id, role } });
    });
    return NextResponse.json({ success: true, message: "Password updated successfully! Please sign in again." });
}, { limit: 5 });
