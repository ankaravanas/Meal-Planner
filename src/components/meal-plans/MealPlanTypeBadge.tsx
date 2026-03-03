import React from 'react';
import { Utensils, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealPlanTypeBadgeProps {
  type: 'flexible' | 'structured';
  className?: string;
}

const typeConfig = {
  flexible: {
    label: 'Ευέλικτο',
    icon: Utensils,
    className: 'bg-primary/10 text-primary',
  },
  structured: {
    label: 'Δομημένο',
    icon: Calendar,
    className: 'bg-purple-100 text-purple-700',
  },
};

export const MealPlanTypeBadge: React.FC<MealPlanTypeBadgeProps> = ({ 
  type, 
  className = '' 
}) => {
  const config = typeConfig[type] || typeConfig.flexible;
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

export default MealPlanTypeBadge;