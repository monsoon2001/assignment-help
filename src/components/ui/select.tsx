import { forwardRef } from "react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  labelClassName?: string;
  options: SelectOption[];
  placeholder?: string;
  selectSize?: "sm" | "md";
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = "",
      label,
      labelClassName,
      options,
      placeholder,
      selectSize = "md",
      ...props
    },
    ref,
  ) => {
    const sizeClasses =
      selectSize === "sm"
        ? "h-9.5 px-3 rounded-lg text-sm"
        : "h-11 px-3.5 rounded-xl text-sm";
    const labelClasses =
      labelClassName ??
      (selectSize === "sm"
        ? "text-xs font-semibold text-on-surface"
        : "text-sm font-medium text-ink");

    return (
      <div className="flex flex-col gap-1">
        {label && <label className={labelClasses}>{label}</label>}
        <select
          ref={ref}
          className={`site-control w-full ${sizeClasses} bg-surface border border-line text-ink focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
Select.displayName = "Select";
export default Select;
