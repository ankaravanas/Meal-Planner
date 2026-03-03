import * as React from "react";
import { LucideIcon, Users, FileText, UtensilsCrossed, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState = ({
  icon: Icon = FolderOpen,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4", className)}>
      <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-muted-foreground/50" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// Preset empty states for common use cases
const ClientsEmptyState = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon={Users}
    title="Δεν έχετε πελάτες ακόμα"
    description="Ξεκινήστε προσθέτοντας τον πρώτο σας πελάτη για να δημιουργήσετε διατροφικά προγράμματα"
    actionLabel="Προσθήκη Πελάτη"
    onAction={onAction}
  />
);

const MealPlansEmptyState = ({ onAction }: { onAction?: () => void }) => (
  <EmptyState
    icon={UtensilsCrossed}
    title="Δεν υπάρχουν προγράμματα"
    description="Δημιουργήστε το πρώτο διατροφικό πρόγραμμα για τους πελάτες σας"
    actionLabel="Νέο Πρόγραμμα"
    onAction={onAction}
  />
);

const NoResultsState = ({ onClear }: { onClear?: () => void }) => (
  <EmptyState
    icon={FileText}
    title="Δεν βρέθηκαν αποτελέσματα"
    description="Δοκιμάστε να αλλάξετε τα κριτήρια αναζήτησης ή τα φίλτρα"
    actionLabel={onClear ? "Καθαρισμός φίλτρων" : undefined}
    onAction={onClear}
  />
);

export { EmptyState, ClientsEmptyState, MealPlansEmptyState, NoResultsState };
