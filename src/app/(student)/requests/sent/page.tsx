import { createClient } from "@/lib/supabase/server";
import RequestSent from "@/components/requests/request-sent";

export const dynamic = "force-dynamic";

export default async function RequestSentPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;

  if (!id) {
    return <RequestSent id="" title="" error="No request reference was provided." />;
  }

  const supabase = await createClient();
  const { data: request, error } = await supabase
    .from("requests")
    .select("id, title, description, subject, deadline, created_at, helper:users(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !request) {
    return <RequestSent id="" title="" error="We couldn't find that request." />;
  }

  const helper = Array.isArray(request.helper) ? request.helper[0] ?? null : request.helper;

  return (
    <RequestSent
      id={request.id}
      title={request.title}
      subject={request.subject}
      deadline={request.deadline}
      helperName={helper?.name ?? null}
    />
  );
}