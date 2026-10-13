import { NextResponse } from "next/server";
import { withApi } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { ApiError } from "@/lib/security";
import { candidateProfile, profileFields } from "@/lib/candidate-profile";
import { isPrivateBlob } from "@/lib/documents";

export const POST = withApi("candidate", async (request, session) => {
  const body = await request.json();
  const current = await prisma.user.findUniqueOrThrow({ where: { id: session!.id } });
  if (!["licensed", "internship"].includes(body.careerPhase)) throw new ApiError(400, "Choose a valid professional stage.");
  if (!body.profile || typeof body.profile !== "object" || Array.isArray(body.profile)) throw new ApiError(400, "Enter your profile details.");
  for (const key of profileFields) {
    if (body.profile[key] != null && (typeof body.profile[key] !== "string" || body.profile[key].length > 500)) throw new ApiError(400, "Profile details are too long or invalid.");
  }
  if (!["seeking", "training"].includes(body.profile.placementStage) || typeof body.profile.relocation !== "boolean") throw new ApiError(400, "Choose a placement stage and relocation preference.");
  const profile = candidateProfile(body.profile);
  for (const key of profileFields) profile[key] = profile[key].trim();
  for (const key of ["provisionalExpiry", "availabilityDate", "placementStart", "placementEnd", "nextActionDate"] as const) {
    const value = profile[key];
    if (value && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) throw new ApiError(400, "Enter valid calendar dates.");
  }
  if (profile.placementStart && profile.placementEnd && profile.placementEnd < profile.placementStart) throw new ApiError(400, "Completion must be after the placement start date.");
  if (profile.graduationYear && (!/^\d{4}$/.test(profile.graduationYear) || Number(profile.graduationYear) < 1950 || Number(profile.graduationYear) > new Date().getUTCFullYear()+1)) throw new ApiError(400, "Enter a valid graduation year.");
  if (profile.experienceYears && (!/^\d+(\.\d)?$/.test(profile.experienceYears) || Number(profile.experienceYears)>70)) throw new ApiError(400, "Enter valid years of experience.");
  if (body.careerPhase === "internship" && profile.placementStage === "training" && (!profile.placementInstitution || !profile.placementStart)) throw new ApiError(400, "Record your placement institution and start date before choosing In training.");
  const changed = body.careerPhase !== current.careerPhase;
  if (changed && body.confirmStageChange !== true) throw new ApiError(400, "Confirm your professional-stage change. Your history and documents will be preserved.");
  if (changed && body.careerPhase === "licensed" && (!current.licenseUrl || !isPrivateBlob(current.licenseUrl) || !current.licenseNumber || !current.licenseExpiry || current.licenseExpiry <= new Date())) throw new ApiError(400, "Upload your practicing license privately and record its registration number and valid expiry before changing to licensed scientist.");
  const saved = { ...profile };
  const previous = candidateProfile(current.candidateProfile);
  const credentialChanged = current.careerPhase === "internship" && (previous.provisionalNumber !== profile.provisionalNumber || previous.provisionalExpiry !== profile.provisionalExpiry);
  const user = await prisma.user.update({ where: { id: current.id }, data: { careerPhase: body.careerPhase, candidateProfile: saved, ...(changed || credentialChanged ? { isLicenseVerified: false, licenseReviewedAt: null, licenseReviewReference: null } : {}) } });
  return NextResponse.json({ success: true, user });
}, { limit: 20 });
