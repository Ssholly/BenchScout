import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export const POST = withApi("candidate", async (request: Request) => {
	try {
		const { email } = await request.json();

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user)
			return NextResponse.json({ error: "User not found" }, { status: 404 });

		await prisma.notification.updateMany({
			where: { userId: user.id, isRead: false },
			data: { isRead: true },
		});

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		return NextResponse.json({ error: "Failed to update" }, { status: 500 });
	}
}, {});
