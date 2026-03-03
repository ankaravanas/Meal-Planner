import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showCharCount?: boolean;
  maxLength?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, showCharCount, maxLength, value, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(
      typeof value === 'string' ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      onChange?.(e);
    };

    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex min-h-[120px] w-full rounded-lg border-2 border-input bg-background px-4 py-3 text-base ring-offset-background",
            "placeholder:text-muted-foreground/60",
            "focus-visible:outline-none focus-visible:border-secondary focus-visible:ring-[3px] focus-visible:ring-secondary/10",
            "disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted",
            "transition-all duration-200",
            "resize-y leading-relaxed",
            "md:text-sm",
            showCharCount && "pb-8",
            className,
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
        {showCharCount && (
          <span className="absolute bottom-3 right-3 text-xs text-muted-foreground">
            {charCount}{maxLength ? `/${maxLength}` : ''}
          </span>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
