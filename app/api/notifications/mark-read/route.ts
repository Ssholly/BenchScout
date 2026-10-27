import { ApiError } from "@/lib/security";
import { withApi } from "@/lib/api";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";



export const POST = withApi("candidate", async (request: Request, session) => {
	try {
        const { notificationId } = await request.json();
        if (notificationId !== undefined && (typeof notificationId !== "string" || !notificationId || notificationId.length > 200)) throw new ApiError(400, "Invalid notification.");

		await prisma.notification.updateMany({
			where: { userId: session!.id, isRead: false, ...(notificationId ? { id: notificationId } : {}) },
			data: { isRead: true },
		});

		return NextResponse.json({ success: true });
	} catch (error: unknown) {
    if (error instanceof ApiError) throw error;
		return NextResponse.json({ error: "Failed to update" }, { status: 500 });
	}
}, {});
