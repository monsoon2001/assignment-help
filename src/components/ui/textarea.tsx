import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-ink">{label}</label>
        )}
        <textarea
          ref={ref}
          className={`w-full p-3.5 bg-surface border border-line rounded-lg text-sm text-ink placeholder:text-ink-soft focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
export default Textarea;
