import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-5 w-5 shrink-0 rounded-md border-2 border-input bg-background ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-secondary/10 focus-visible:border-secondary",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-foreground",
      "transition-all duration-200",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
      <Check className="h-3.5 w-3.5 stroke-[3]" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Card-style checkbox for multi-select options (e.g., dietary restrictions)
interface CheckboxCardProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

const CheckboxCard = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxCardProps
>(({ className, label, description, icon, ...props }, ref) => (
  <label
    className={cn(
      "relative flex cursor-pointer items-start gap-3 rounded-lg border-2 border-input bg-background p-4",
      "hover:border-primary/50 transition-all duration-200",
      "has-[[data-state=checked]]:border-secondary has-[[data-state=checked]]:bg-secondary/5",
      "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50",
      className,
    )}
  >
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded-md border-2 border-input bg-background ring-offset-background mt-0.5",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-secondary/10 focus-visible:border-secondary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-secondary data-[state=checked]:border-secondary data-[state=checked]:text-secondary-foreground",
        "transition-all duration-200",
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className={cn("flex items-center justify-center text-current")}>
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </div>
  </label>
));
CheckboxCard.displayName = "CheckboxCard";

export { Checkbox, CheckboxCard };
