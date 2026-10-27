interface BadgeProps {
  children: React.ReactNode;
  variant?:
    "primary" | "secondary" | "blue" | "success" | "warning" | "danger" | "indigo" | "outline";
  className?: string;
  dot?: boolean;
}

export default function Badge({
  children,
  variant = "primary",
  className = "",
  dot = false,
}: BadgeProps) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-white",
    secondary: "bg-surface text-ink border border-line",
    blue: "bg-primary-tint text-primary-hover",
    success: "bg-success-tint text-success",
    warning: "bg-accent-tint text-on-accent-tint",
    danger: "bg-danger-tint text-danger",
    indigo: "bg-tone-indigo-bg text-tone-indigo",
    outline: "bg-canvas text-ink-soft border border-line",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
