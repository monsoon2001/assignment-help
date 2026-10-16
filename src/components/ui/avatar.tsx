"use client";

import { useState } from "react";
import Image from "next/image";
import { avatarFor } from "@/lib/avatars";

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  role?: string | null;
  size?: "sm" | "md" | "lg";
  online?: boolean;
  className?: string;
}

export default function Avatar({ src, alt, name, role, size = "md", online, className = "" }: AvatarProps) {
  const sizes = { sm: "w-8 h-8", md: "w-10 h-10", lg: "w-14 h-14" };
  const dims = { sm: 32, md: 40, lg: 56 };
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length === 0
      ? "?"
      : (parts.length === 1 ? parts[0][0] : parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  const [error, setError] = useState(false);
  // Google accounts use their own profile photo. Non-Google helpers get a stable
  // assistant portrait (assigned by name). The branded "Acadivo Helper" identity
  // and students/admins without a Google photo fall back to initials.
  const resolvedSrc = avatarFor(name, src, role);

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
        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface-container-lowest ${online ? "bg-success" : "bg-outline"}`} />
      )}
    </div>
  );
}