"use client";

import { useCallback, useRef, useState } from "react";
import { Download } from "lucide-react";
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

function fileNameFromStored(stored: string): string {
  const path = pathFromStoredUrl(stored) ?? stored;
  const name = path.split("/").pop() ?? "file";
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

/**
 * Renders a file row. Clicking the file opens a SHORT-LIVED signed URL fetched
 * (lazily, on click) from /api/files/url so it is viewed online. When
 * `showDownload` is set, a download button on the right asks for confirmation
 * and then downloads the file (signed URL with an attachment disposition).
 * The server re-checks the caller is a request or order participant before
 * signing, so private-bucket files stay private.
 */
export default function SecureFileLink({
  stored,
  bucket,
  children,
  className,
  title,
  showDownload = false,
  label,
}: {
  stored: string;
  bucket?: StorageBucket;
  children?: React.ReactNode;
  className?: string;
  title?: string;
  showDownload?: boolean;
  label?: string;
}) {
  const baseBucket = bucket ?? bucketFromStoredUrl(stored) ?? "request-files";
  const displayName = label ?? fileNameFromStored(stored);
  const [state, setState] = useState<ResolveState>({});
  const [downloading, setDownloading] = useState(false);
  const pending = useRef<Promise<void> | null>(null);

  const resolveUrl = useCallback(
    async (asDownload: boolean) => {
      const targetBucket = state.error
        ? baseBucket === "request-files"
          ? "order-files"
          : "request-files"
        : baseBucket;
      const qs = new URLSearchParams({ bucket: targetBucket, path: stored });
      if (asDownload) qs.set("download", displayName);
      const res = await fetch(`/api/files/url?${qs.toString()}`);
      if (!res.ok) throw new Error("file unavailable");
      const data = (await res.json()) as { url: string };
      return data.url;
    },
    [baseBucket, state.error, stored, displayName],
  );

  const open = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (state.url) {
        window.open(state.url, "_blank", "noopener,noreferrer");
        return;
      }
      pending.current ??= (async () => {
        try {
          const url = await resolveUrl(false);
          setState({ url });
          window.open(url, "_blank", "noopener,noreferrer");
        } catch {
          setState({ error: true });
        } finally {
          pending.current = null;
        }
      })();
      void pending.current;
    },
    [resolveUrl, state.url],
  );

  const download = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!window.confirm(`Do you want to download ${displayName}?`)) return;
      try {
        setDownloading(true);
        const url = await resolveUrl(true);
        const a = document.createElement("a");
        a.href = url;
        a.download = displayName;
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch {
        setState({ error: true });
      } finally {
        setDownloading(false);
      }
    },
    [resolveUrl, displayName],
  );

  if (!showDownload) {
    return (
      <a href="#" title={title} className={className} onClick={open} aria-disabled={state.error}>
        {children}
      </a>
    );
  }

  return (
    <span className={className}>
      <button
        type="button"
        onClick={open}
        title={title}
        aria-disabled={state.error}
        className="flex items-center gap-3 flex-1 min-w-0 text-left cursor-pointer"
      >
        {children}
      </button>
      <button
        type="button"
        onClick={download}
        disabled={downloading}
        title={`Download ${displayName}`}
        aria-label={`Download ${displayName}`}
        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
      >
        <Download size={15} />
      </button>
    </span>
  );
}
