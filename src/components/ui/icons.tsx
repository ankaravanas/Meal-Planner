import React from 'react';
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Settings,
  LogOut,
  Coffee,
  Apple,
  Cookie,
  Moon,
  PencilLine,
  Trash2,
  Eye,
  Share2,
  Sparkles,
  Copy,
  Download,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Loader2,
  Tag,
  Check,
  Archive,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Icon sizes
export const iconSizes = {
  xs: 'h-4 w-4',
  sm: 'h-5 w-5',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
  '2xl': 'h-20 w-20',
} as const;

// Meal category icon configuration
export const mealCategoryIcons: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  breakfast: { icon: Coffee, color: 'text-amber-500', bgColor: 'bg-amber-100' },
  πρωινό: { icon: Coffee, color: 'text-amber-500', bgColor: 'bg-amber-100' },
  morning_snack: { icon: Apple, color: 'text-green-500', bgColor: 'bg-green-100' },
  δεκατιανό: { icon: Apple, color: 'text-green-500', bgColor: 'bg-green-100' },
  snack: { icon: Apple, color: 'text-green-500', bgColor: 'bg-green-100' },
  lunch: { icon: UtensilsCrossed, color: 'text-primary', bgColor: 'bg-primary/10' },
  μεσημεριανό: { icon: UtensilsCrossed, color: 'text-primary', bgColor: 'bg-primary/10' },
  afternoon_snack: { icon: Cookie, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  απογευματινό: { icon: Cookie, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  dinner: { icon: Moon, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  βραδινό: { icon: Moon, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  δείπνο: { icon: Moon, color: 'text-blue-500', bgColor: 'bg-blue-100' },
};

// Get meal category icon and colors
export const getMealCategoryConfig = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  for (const [key, config] of Object.entries(mealCategoryIcons)) {
    if (name.includes(key)) {
      return config;
    }
  }
  
  // Default fallback
  return { icon: UtensilsCrossed, color: 'text-muted-foreground', bgColor: 'bg-muted' };
};

// Meal Category Icon Component
interface MealCategoryIconProps {
  categoryName: string;
  size?: keyof typeof iconSizes;
  showBackground?: boolean;
  className?: string;
}

export const MealCategoryIcon: React.FC<MealCategoryIconProps> = ({
  categoryName,
  size = 'sm',
  showBackground = true,
  className,
}) => {
  const config = getMealCategoryConfig(categoryName);
  const IconComponent = config.icon;
  
  if (showBackground) {
    return (
      <div className={cn('p-2 rounded-lg', config.bgColor, className)}>
        <IconComponent className={cn(iconSizes[size], config.color)} strokeWidth={2} />
      </div>
    );
  }
  
  return <IconComponent className={cn(iconSizes[size], config.color, className)} strokeWidth={2} />;
};

// Action Icon Component with hover states
interface ActionIconProps {
  action: 'edit' | 'delete' | 'view' | 'share' | 'ai' | 'copy' | 'download';
  size?: keyof typeof iconSizes;
  className?: string;
}

const actionIconConfig: Record<string, { icon: LucideIcon; defaultColor: string; hoverColor: string }> = {
  edit: { icon: PencilLine, defaultColor: 'text-muted-foreground', hoverColor: 'hover:text-primary' },
  delete: { icon: Trash2, defaultColor: 'text-destructive', hoverColor: 'hover:text-destructive' },
  view: { icon: Eye, defaultColor: 'text-muted-foreground', hoverColor: 'hover:text-foreground' },
  share: { icon: Share2, defaultColor: 'text-secondary', hoverColor: 'hover:text-secondary' },
  ai: { icon: Sparkles, defaultColor: 'text-primary', hoverColor: 'hover:text-secondary' },
  copy: { icon: Copy, defaultColor: 'text-muted-foreground', hoverColor: 'hover:text-foreground' },
  download: { icon: Download, defaultColor: 'text-muted-foreground', hoverColor: 'hover:text-foreground' },
};

export const ActionIcon: React.FC<ActionIconProps> = ({ action, size = 'sm', className }) => {
  const config = actionIconConfig[action];
  const IconComponent = config.icon;
  
  return (
    <IconComponent 
      className={cn(iconSizes[size], config.defaultColor, config.hoverColor, 'transition-colors duration-200', className)} 
      strokeWidth={2} 
    />
  );
};

// Nutrition Indicator Component
interface NutritionIndicatorProps {
  type: 'calories' | 'protein' | 'carbs' | 'fats';
  value: number | string;
  size?: 'sm' | 'md';
  className?: string;
}

const nutritionConfig: Record<string, { icon: LucideIcon; color: string; bgColor: string; label: string }> = {
  calories: { icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-50', label: 'kcal' },
  protein: { icon: Beef, color: 'text-red-500', bgColor: 'bg-red-50', label: 'P' },
  carbs: { icon: Wheat, color: 'text-yellow-500', bgColor: 'bg-yellow-50', label: 'C' },
  fats: { icon: Droplet, color: 'text-blue-500', bgColor: 'bg-blue-50', label: 'F' },
};

export const NutritionIndicator: React.FC<NutritionIndicatorProps> = ({
  type,
  value,
  size = 'sm',
  className,
}) => {
  const config = nutritionConfig[type];
  const IconComponent = config.icon;
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
      config.bgColor,
      size === 'sm' ? 'text-xs' : 'text-sm',
      className
    )}>
      <IconComponent className={cn(size === 'sm' ? 'h-3 w-3' : 'h-4 w-4', config.color)} strokeWidth={2} />
      <span className={cn('font-medium', config.color)}>
        {value}{type === 'calories' ? '' : 'g'} {config.label}
      </span>
    </div>
  );
};

// Nutrition Badge Row Component
interface NutritionBadgeRowProps {
  calories?: number | null;
  protein?: number | null;
  carbs?: number | null;
  fats?: number | null;
  size?: 'sm' | 'md';
  className?: string;
}

export const NutritionBadgeRow: React.FC<NutritionBadgeRowProps> = ({
  calories,
  protein,
  carbs,
  fats,
  size = 'sm',
  className,
}) => {
  const hasAnyValue = calories || protein || carbs || fats;
  
  if (!hasAnyValue) return null;
  
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {calories && <NutritionIndicator type="calories" value={calories} size={size} />}
      {protein && <NutritionIndicator type="protein" value={protein} size={size} />}
      {carbs && <NutritionIndicator type="carbs" value={carbs} size={size} />}
      {fats && <NutritionIndicator type="fats" value={fats} size={size} />}
    </div>
  );
};

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: keyof typeof iconSizes;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  return (
    <Loader2 className={cn(iconSizes[size], 'animate-spin text-primary', className)} strokeWidth={2} />
  );
};

// Status Badge Component
interface StatusBadgeProps {
  status: 'draft' | 'active' | 'archived' | string;
  className?: string;
}

const statusConfig: Record<string, { icon: LucideIcon; bgColor: string; textColor: string; label: string }> = {
  draft: { icon: Tag, bgColor: 'bg-muted', textColor: 'text-muted-foreground', label: 'Πρόχειρο' },
  active: { icon: Check, bgColor: 'bg-secondary', textColor: 'text-secondary-foreground', label: 'Ενεργό' },
  archived: { icon: Archive, bgColor: 'bg-muted', textColor: 'text-muted-foreground', label: 'Αρχειοθετημένο' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.draft;
  const IconComponent = config.icon;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
      config.bgColor,
      config.textColor,
      className
    )}>
      <IconComponent className="h-3 w-3" strokeWidth={2} />
      {config.label}
    </span>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent = UtensilsCrossed,
  title = 'Δεν υπάρχουν δεδομένα',
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
      <div className="rounded-full bg-muted p-4 mb-4">
        <IconComponent className="h-20 w-20 text-muted-foreground/50" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-medium text-muted-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground/70 max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
};

// AI Icon with gradient
export const AISparklesIcon: React.FC<{ size?: keyof typeof iconSizes; className?: string }> = ({
  size = 'sm',
  className,
}) => {
  return (
    <Sparkles 
      className={cn(
        iconSizes[size], 
        'text-primary animate-pulse-subtle',
        className
      )} 
      strokeWidth={2} 
    />
  );
};

// Export navigation icons for reference
export const navigationIcons = {
  dashboard: LayoutDashboard,
  clients: Users,
  mealPlans: UtensilsCrossed,
  settings: Settings,
  logout: LogOut,
} as const;