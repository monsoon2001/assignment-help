interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
  className?: string;
  dot?: boolean;
}

export default function Badge({ children, variant = "primary", className = "", dot = false }: BadgeProps) {
  const variants: Record<string, string> = {
    primary: "bg-primary-container text-on-primary",
    secondary: "bg-secondary-container text-on-secondary-container",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    danger: "bg-error-container text-error",
    outline: "bg-surface-container text-on-surface-variant",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]} ${className}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
