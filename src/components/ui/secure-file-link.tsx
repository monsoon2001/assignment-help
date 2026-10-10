"use client";

import { useCallback, useRef, useState } from "react";
import { isStorageBucket, pathFromStoredUrl, type StorageBucket } from "@/lib/signed-files";

type ResolveState = { url?: string; error?: boolean };

function bucketFromStoredUrl(stored: string): StorageBucket | null {
  const urlPath = pathFromStoredUrl(stored);
  void urlPath;
  try {
    const url = new URL(stored);
    const parts = url.pathname.split("/").filter(Boolean);
    const idx = parts.findIndex((p) => p === "object");
    const bucket = parts[idx + 2] ?? null;
    return bucket && isStorageBucket(bucket) ? bucket : null;
  } catch {
    return null;
  }
}

/**
 * Renders an anchor whose href is a SHORT-LIVED signed URL fetched (lazily, on
 * click) from /api/files/url. The server re-checks the caller is a request or
 * order participant before signing, so private-bucket files stay private.
 */
export default function SecureFileLink({
  stored,
  bucket,
  children,
  className,
  title,
}: {
  stored: string;
  bucket?: StorageBucket;
  children?: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const baseBucket = bucket ?? bucketFromStoredUrl(stored) ?? "request-files";
  const [state, setState] = useState<ResolveState>({});
  const pending = useRef<Promise<void> | null>(null);

  const open = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      if (state.url) {
        window.open(state.url, "_blank", "noopener,noreferrer");
        return;
      }
      const targetBucket = state.error ? (baseBucket === "request-files" ? "order-files" : "request-files") : baseBucket;
      pending.current ??= (async () => {
        try {
          const qs = new URLSearchParams({ bucket: targetBucket, path: stored });
          const res = await fetch(`/api/files/url?${qs.toString()}`);
          if (!res.ok) throw new Error("file unavailable");
          const data = (await res.json()) as { url: string };
          setState({ url: data.url });
          window.open(data.url, "_blank", "noopener,noreferrer");
        } catch {
          setState({ error: true });
        } finally {
          pending.current = null;
        }
      })();
      void pending.current;
    },
    [baseBucket, state.url, state.error, stored]
  );

  return (
    <a
      href="#"
      title={title}
      className={className}
      onClick={open}
      aria-disabled={state.error}
    >
      {children}
    </a>
  );
}