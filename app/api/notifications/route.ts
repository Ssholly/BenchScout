import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export const GET = withApi("candidate", async (request: Request) => {
	try {
		const { searchParams } = new URL(request.url);
		const email = searchParams.get("email");

		if (!email)
			return NextResponse.json({ error: "Email required" }, { status: 400 });

		const user = await prisma.user.findUnique({ where: { email } });
		if (!user) return NextResponse.json({ success: true, notifications: [] });

		const notifications = await prisma.notification.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: "desc" },
			take: 10,
		});

		return NextResponse.json({ success: true, notifications });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 },
		);
	}
}, {});
