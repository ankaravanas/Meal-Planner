import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-0 group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg group-[.toaster]:border-l-4",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg",
          success: "group-[.toaster]:border-l-[hsl(140_60%_45%)]",
          error: "group-[.toaster]:border-l-destructive",
          info: "group-[.toaster]:border-l-[hsl(220_70%_55%)]",
          warning: "group-[.toaster]:border-l-[hsl(40_95%_50%)]",
          closeButton: "group-[.toast]:bg-transparent group-[.toast]:border-0 group-[.toast]:text-muted-foreground group-[.toast]:hover:text-foreground",
        },
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-[hsl(140_60%_45%)]" />,
        error: <AlertCircle className="h-5 w-5 text-destructive" />,
        info: <Info className="h-5 w-5 text-[hsl(220_70%_55%)]" />,
      }}
      closeButton
      {...props}
    />
  );
};

export { Toaster, toast };
