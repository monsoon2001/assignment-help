import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, icon, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-on-surface">{label}</label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-on-surface-variant pointer-events-none [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={`w-full h-11 ${icon ? "pl-11" : "pl-3.5"} pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
