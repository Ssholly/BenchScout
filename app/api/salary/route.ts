import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request: Request) {
	try {
		const { role, location, salary, experience } = await request.json();

		if (!role || !location || !salary || !experience) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 },
			);
		}

		const newReport = await prisma.salaryReport.create({
			data: { role, location, salary: parseInt(salary), experience },
		});

		// 🚀 Return the ID so the frontend can save it for future edits
		return NextResponse.json({ success: true, id: newReport.id });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to submit report" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function PUT(request: Request) {
	try {
		const { id, role, location, salary, experience } = await request.json();

		if (!id)
			return NextResponse.json({ error: "ID required" }, { status: 400 });

		await prisma.salaryReport.update({
			where: { id },
			data: { role, location, salary: parseInt(salary), experience },
		});

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to update report" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function DELETE(request: Request) {
	try {
		const { id } = await request.json();

		if (!id)
			return NextResponse.json({ error: "ID required" }, { status: 400 });

		await prisma.salaryReport.delete({ where: { id } });

		return NextResponse.json({ success: true });
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to delete report" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}

export async function GET() {
	try {
		const reports = await prisma.salaryReport.findMany();
		const jobs = await prisma.job.findMany({
			where: { salary: { not: "Competitive" } },
		});

		let totalMonthlySalary = 0;
		let validCount = 0;

		reports.forEach((r) => {
			totalMonthlySalary += r.salary;
			validCount++;
		});

		jobs.forEach((j) => {
			const nums = j.salary.replace(/,/g, "").match(/\d+/g);
			if (nums && nums.length > 0) {
				let val = parseInt(nums[0]);
				if (val < 1000) val = val * 1000;
				const monthlyVal = val >= 1000000 ? Math.round(val / 12) : val;

				totalMonthlySalary += monthlyVal;
				validCount++;
			}
		});

		const avg = validCount > 0 ? totalMonthlySalary / validCount : 0;

		return NextResponse.json({
			average: Math.round(avg),
			count: validCount,
			recent: reports.slice(-10).reverse(),
		});
	} catch (error) {
		return NextResponse.json(
			{ error: "Failed to fetch salary data" },
			{ status: 500 },
		);
	} finally {
		await prisma.$disconnect();
	}
}
