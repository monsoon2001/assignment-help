import type { Metadata } from "next";
import RequestWorkspace from "@/components/requests/request-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Conversation | PeerCraft",
};

export default async function StudentRequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ resend?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  return <RequestWorkspace requestId={id} mode="student" initialResend={sp.resend === "1"} />;
}