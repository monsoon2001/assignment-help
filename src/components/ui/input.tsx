import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, icon, error, type, ...props }, ref) => {
    // Safari draws native date/time widgets very small, so those get extra
    // height, a larger value, and a visible picker button.
    const isDateField = type === "date" || type === "time" || type === "datetime-local";
    const sizeClass = isDateField
      ? " h-11 text-base [&::-webkit-date-and-time-value]:w-full [&::-webkit-date-and-time-value]:text-left [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
      : "";

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-ink">{label}</label>
        )}
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3.5 text-ink-soft pointer-events-none [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            type={type}
            className={`site-control w-full h-11 ${icon ? "pl-11" : "pl-3.5"} pr-4 bg-surface border rounded-xl text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:ring-2 transition-all duration-150 ${error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line focus:border-primary focus:ring-primary/20"} ${sizeClass} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export default Input;
