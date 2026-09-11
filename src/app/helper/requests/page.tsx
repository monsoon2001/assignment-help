import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import HelperRequestsView from "@/components/helper/requests-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Incoming Requests | PeerCraft",
};

type RawRequest = {
  id: string;
  title: string;
  subject: string | null;
  description: string | null;
  deadline: string | null;
  status: string;
  created_at: string;
  student: { id: string; name: string | null }[] | null;
};

type NormalizedRequest = Omit<RawRequest, "student"> & { student: { id: string; name: string | null } | null };

export default async function HelperRequestsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: requests } = await supabase
    .from("requests")
    .select("id, title, subject, description, deadline, status, created_at, student:users(id, name)")
    .eq("helper_id", user.id)
    .in("status", ["requested", "proposal_sent"])
    .order("created_at", { ascending: false });

  const { data: myProposals } = await supabase
    .from("proposals")
    .select("id, request_id, price, description, status, created_at")
    .eq("helper_id", user.id);

  const proposedIds = new Set((myProposals ?? []).map((p) => p.request_id));

  const rows: NormalizedRequest[] = ((requests ?? []) as unknown as RawRequest[]).map(
    (r) => ({
      ...r,
      student: (Array.isArray(r.student) ? (r.student[0] ?? null) : r.student) as { id: string; name: string | null } | null,
    })
  );

  return <HelperRequestsView requests={rows} proposedIds={proposedIds} />;
}