import type { Job, Employer, User, Application, RunHistory, Notification } from "@prisma/client";
import type { ProfessionalSummary } from "@/lib/professional-summary";
export type ClientJob = Omit<Job, "createdAt" | "updatedAt" | "lastSeenAt"> & {
  createdAt: string; updatedAt: string; title?: string; isScoutedInvite?: boolean;
  lastSeenAt?: string | null; listingSource?: string; employerVerified?: boolean; matchExplanation?: string;
  applications?: ClientApplication[]; _count?: { applications: number };
};
export type ClientEmployer = Pick<Employer, "id" | "companyName" | "email" | "isVerified">;
export type Candidate = Pick<User, "id" | "name" | "email" | "resumeUrl" | "licenseUrl" | "degreeUrl"> & { careerPhase?: string; placementStage?: "seeking" | "training"; provisionalUrl?: string | null; statementOfResultUrl?: string | null; isLicenseVerified?: boolean; location?: string; professionalSummary?: ProfessionalSummary | null };
export type ClientApplication = Omit<Application, "createdAt"> & { createdAt: string; user: Candidate };
export type ClientHistory = Omit<RunHistory, "createdAt"> & { createdAt: string };
export type ClientNotification = Omit<Notification, "createdAt"> & { createdAt: string };
export type NotificationView = { id: string; title: string; body: string; time: string; isRead: boolean };
export type ComplianceMetrics = { success: boolean; status: "UNCONFIGURED" | "VALID" | "WARNING" | "EXPIRED"; daysLeft: number; expiryFormatted: string; licenseNumber: string; cpdPoints: number; cpdPercent: number; isVerified: boolean; name: string };
export type NewsArticle = { id: string | number; title: string; url: string; date: string; source: string; category: string; excerpt?: string; image?: string; color?: string; time?: string; readTime?: string };
export type ScrapedJob = { title: string; company: string; loc: string; url: string; desc: string; source: string; jobType?: string; deadline?: string };
export type ScoredJob = ScrapedJob & { score: number; tier: number; skills: string };
export type ApifyJob = { title?: string; positionName?: string; company?: string | { name?: string }; companyName?: string; location?: string; url?: string; jobUrl?: string; link?: string; description?: string; descriptionText?: string; descriptionHtml?: string; companyUrl?: string };
