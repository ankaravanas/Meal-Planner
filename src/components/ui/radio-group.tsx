import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn("grid gap-3", className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-5 w-5 rounded-full border-2 border-input bg-background text-primary ring-offset-background",
        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-secondary/10 focus-visible:border-secondary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary data-[state=checked]:text-primary",
        "transition-all duration-200",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

// Card-style radio for visual selection
interface RadioGroupCardProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

const RadioGroupCard = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupCardProps
>(({ className, label, description, icon, ...props }, ref) => (
  <label
    className={cn(
      "relative flex cursor-pointer items-start gap-3 rounded-lg border-2 border-input bg-background p-4",
      "hover:border-primary/50 transition-all duration-200",
      "has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5",
      "has-[[data-disabled]]:cursor-not-allowed has-[[data-disabled]]:opacity-50",
      className,
    )}
  >
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-5 w-5 rounded-full border-2 border-input bg-background text-primary ring-offset-background mt-0.5",
        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-secondary/10 focus-visible:border-secondary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:border-primary data-[state=checked]:text-primary",
        "transition-all duration-200",
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-primary text-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
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
RadioGroupCard.displayName = "RadioGroupCard";

export { RadioGroup, RadioGroupItem, RadioGroupCard };
