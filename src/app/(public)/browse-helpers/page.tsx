import type { Metadata } from "next";
import { fetchHelperCandidates } from "@/lib/requests";
import { createClient } from "@/lib/supabase/server";
import HelperExplorer from "@/components/marketing/helper-explorer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Browse Helpers | Acadivo",
  description:
    "Browse verified peer helpers across every subject, review their ratings and subject expertise, and request help in minutes.",
};

export default async function BrowseHelpersPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject } = await searchParams;
  const supabase = await createClient();
  const result = await fetchHelperCandidates(subject ?? null, supabase);
  const initialHelpers = "error" in result ? [] : result.helpers;

  return <HelperExplorer initialHelpers={initialHelpers} subjectParam={subject ?? null} />;
}