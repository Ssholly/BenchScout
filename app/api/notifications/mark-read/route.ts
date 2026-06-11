import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
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
	} catch (error) {
		return NextResponse.json({ error: "Failed to update" }, { status: 500 });
	}
}
