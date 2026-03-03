import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Base Skeleton with shimmer animation
interface SkeletonBaseProps {
  className?: string;
}

export const SkeletonBase: React.FC<SkeletonBaseProps> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-shimmer rounded-lg bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%]',
        className
      )}
    />
  );
};

// Card Skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('rounded-xl border border-border bg-card p-6 space-y-4', className)}>
      <div className="flex items-center gap-3">
        <SkeletonBase className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <SkeletonBase className="h-4 w-1/3" />
          <SkeletonBase className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonBase className="h-20 w-full" />
      <div className="flex gap-2">
        <SkeletonBase className="h-6 w-16 rounded-full" />
        <SkeletonBase className="h-6 w-16 rounded-full" />
        <SkeletonBase className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
};

// Table Row Skeleton
export const TableRowSkeleton: React.FC<{ columns?: number; className?: string }> = ({ 
  columns = 5, 
  className 
}) => {
  return (
    <div className={cn('flex items-center gap-4 py-3 border-b border-border', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonBase key={i} className="h-4 flex-1" />
      ))}
    </div>
  );
};

// List Skeleton
export const ListSkeleton: React.FC<{ items?: number; className?: string }> = ({ 
  items = 5, 
  className 
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBase className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <SkeletonBase className="h-4 w-2/3" />
            <SkeletonBase className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form Skeleton
export const FormSkeleton: React.FC<{ fields?: number; className?: string }> = ({ 
  fields = 4, 
  className 
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-11 w-full rounded-lg" />
        </div>
      ))}
      <SkeletonBase className="h-11 w-32 rounded-[10px]" />
    </div>
  );
};

// Clients Page Skeleton
export const ClientsSkeletonLoader: React.FC = () => (
  <div className="space-y-6">
    {/* Stats Cards Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <SkeletonBase className="h-4 w-24" />
            <SkeletonBase className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <SkeletonBase className="h-8 w-12" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Table Skeleton */}
    <Card>
      <CardHeader>
        <SkeletonBase className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <SkeletonBase className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <SkeletonBase className="h-4 w-40" />
                <SkeletonBase className="h-3 w-60" />
              </div>
              <SkeletonBase className="h-4 w-20" />
              <SkeletonBase className="h-8 w-8 rounded" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Meal Plans Page Skeleton
export const MealPlansSkeletonLoader: React.FC = () => (
  <div className="space-y-6">
    {/* Filters Skeleton */}
    <Card>
      <CardHeader>
        <SkeletonBase className="h-6 w-40" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBase key={i} className="h-11 w-full rounded-lg" />
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Results Count */}
    <SkeletonBase className="h-5 w-48" />

    {/* Meal Plans Grid Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <SkeletonBase className="h-5 w-48" />
                <SkeletonBase className="h-4 w-32" />
                <SkeletonBase className="h-4 w-24" />
              </div>
              <div className="space-y-2">
                <SkeletonBase className="h-6 w-16 rounded-full" />
                <SkeletonBase className="h-6 w-20 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SkeletonBase className="h-4 w-full" />
              <SkeletonBase className="h-4 w-3/4" />
              <div className="flex gap-2">
                <SkeletonBase className="h-9 flex-1 rounded-[10px]" />
                <SkeletonBase className="h-9 flex-1 rounded-[10px]" />
                <SkeletonBase className="h-9 w-9 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Dashboard Skeleton
export const DashboardSkeletonLoader: React.FC = () => (
  <div className="space-y-6">
    {/* Stats Row */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <SkeletonBase className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <SkeletonBase className="h-6 w-16" />
                <SkeletonBase className="h-4 w-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    
    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <SkeletonBase className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <ListSkeleton items={4} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <SkeletonBase className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <ListSkeleton items={4} />
        </CardContent>
      </Card>
    </div>
  </div>
);

export default { 
  SkeletonBase, 
  CardSkeleton, 
  TableRowSkeleton, 
  ListSkeleton, 
  FormSkeleton, 
  ClientsSkeletonLoader, 
  MealPlansSkeletonLoader,
  DashboardSkeletonLoader 
};