import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildThreads } from "@/lib/threads";
import MessagesInbox from "@/components/requests/messages-inbox";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages | PeerCraft",
};

export default async function HelperMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const threads = await buildThreads(supabase, user.id, true);

  return <MessagesInbox initialThreads={threads} isHelper={true} />;
}