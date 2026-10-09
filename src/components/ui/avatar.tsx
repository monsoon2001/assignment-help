"use client";

import { useState } from "react";
import Image from "next/image";
import { avatarFor } from "@/lib/avatars";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
}

export default function Avatar({ src, alt, name, size = "md", online, className = "" }: AvatarProps) {
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14" };
  const dims = { sm: 32, md: 40, lg: 56 };
  const initials = name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const [error, setError] = useState(false);
  // Prefer the account's own safe remote avatar (e.g. Google), else fall back to
  // a gender-default portrait inferred from the name. Untrusted URLs and names we
  // cannot place still resolve to the initials tile.
  const resolvedSrc = avatarFor(name, src);

  return (
    <div className={`relative shrink-0 ${className}`}>
      {resolvedSrc && !error ? (
        <Image
          src={resolvedSrc}
          alt={alt ?? name ?? ""}
          width={dims[size]}
          height={dims[size]}
          loading="lazy"
          decoding="async"
          onError={() => setError(true)}
          className={`${sizes[size]} rounded-full object-cover`}
        />
      ) : (
        <div className={`${sizes[size]} rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-semibold text-sm`}>
          {initials}
        </div>
      )}
      {online !== undefined && (
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface-container-lowest ${online ? "bg-emerald-500" : "bg-outline"}`} />
      )}
    </div>
  );
}