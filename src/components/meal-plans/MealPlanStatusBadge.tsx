import React from 'react';
import { Tag, Check, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealPlanStatusBadgeProps {
  status: 'draft' | 'active' | 'archived';
  className?: string;
}

const statusConfig = {
  active: {
    label: 'Ενεργό',
    icon: Check,
    className: 'bg-secondary text-secondary-foreground',
  },
  draft: {
    label: 'Πρόχειρο',
    icon: Tag,
    className: 'bg-muted text-muted-foreground',
  },
  archived: {
    label: 'Αρχειοθετημένο',
    icon: Archive,
    className: 'bg-muted text-muted-foreground',
  },
};

export const MealPlanStatusBadge: React.FC<MealPlanStatusBadgeProps> = ({ 
  status, 
  className = '' 
}) => {
  const config = statusConfig[status] || statusConfig.draft;
  const IconComponent = config.icon;

  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
        config.className,
        className
      )}
    >
      <IconComponent className="h-3 w-3" strokeWidth={2} />
      {config.label}
    </span>
  );
};

export default MealPlanStatusBadge;