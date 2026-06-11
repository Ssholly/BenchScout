import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
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
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch notifications" },
			{ status: 500 },
		);
	}
}
