import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
export const GET = withApi("either", async (_request, session) => NextResponse.json({ success: true, session }));
