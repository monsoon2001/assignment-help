import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  labelClassName?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, labelClassName, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label
            className={labelClassName ?? "text-xs font-semibold text-on-surface"}
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`site-control w-full p-2.5 sm:p-3 bg-surface border border-line rounded-lg text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-150 resize-none ${className}`}
          {...props}
        />
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
export default Textarea;
