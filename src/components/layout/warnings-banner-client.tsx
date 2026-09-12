"use client";

import { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type WarningRow = { id: string; reason: string; created_at: string };

export default function WarningsBannerClient() {
  const [warnings, setWarnings] = useState<WarningRow[]>([]);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !active) return;
      const { data } = await supabase
        .from("user_warnings")
        .select("id, reason, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);
      if (active && data) setWarnings(data as WarningRow[]);
    })();
    return () => {
      active = false;
    };
  }, []);

  if (warnings.length === 0) return null;

  return (
    <div className="w-full bg-error-container/20 border-b border-error/20 px-4 py-3">
      <div className="w-full max-w-[1440px] mx-auto flex items-start gap-3">
        <ShieldAlert size={18} className="text-error shrink-0 mt-0.5" />
        <div className="text-sm text-on-surface">
          <span className="font-semibold">
            You have {warnings.length} warning{warnings.length !== 1 ? "s" : ""} from PeerCraft support.
          </span>
          <ul className="mt-1 list-disc list-inside text-on-surface-variant text-xs space-y-0.5">
            {warnings.map((w) => (
              <li key={w.id}>{w.reason}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}