import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center font-medium transition-colors rounded-xl disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    const variants: Record<string, string> = {
      primary: "bg-primary-container text-on-primary hover:bg-primary shadow-sm",
      secondary: "bg-secondary-container text-on-secondary-container hover:bg-secondary",
      outline: "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
      ghost: "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface",
      danger: "bg-error text-on-error hover:bg-danger",
    };
    const sizes: Record<string, string> = {
      sm: "px-3 py-1.5 text-sm gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-6 py-3 text-base gap-2",
    };
    return (
      <button ref={ref} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
    );
  }
);
Button.displayName = "Button";
export default Button;
