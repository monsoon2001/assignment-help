import { forwardRef } from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  href?: string;
}

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", href, ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors rounded-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";
    const variants: Record<string, string> = {
      primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-dark shadow-sm",
      secondary: "bg-surface text-ink border border-line hover:bg-primary-tint",
      outline: "border border-line bg-surface text-ink hover:bg-primary-tint",
      ghost: "text-ink-soft hover:bg-canvas hover:text-ink",
      danger: "bg-danger text-white hover:bg-danger-hover",
    };
    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 min-h-11 min-w-11 text-sm gap-1.5",
      md: "px-4 py-2 min-h-11 text-sm gap-2",
      lg: "px-6 py-3 min-h-11 text-base gap-2",
    };
    const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
    if (href) {
      return (
        <Link ref={ref as React.Ref<HTMLAnchorElement>} href={href} className={classes} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement> & ButtonProps)} />
      );
    }
    return <button ref={ref as React.Ref<HTMLButtonElement>} className={classes} {...props} />;
  }
);
Button.displayName = "Button";
export default Button;
