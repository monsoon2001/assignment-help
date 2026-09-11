import type { Metadata } from "next";
import RequestWorkspace from "@/components/requests/request-workspace";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Request Conversation | PeerCraft",
};

export default async function HelperRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RequestWorkspace requestId={id} mode="helper" />;
}