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
            type={type}
            className={`w-full h-11 ${icon ? "pl-11" : "pl-3.5"} pr-4 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all ${sizeClass} ${className}`}
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
