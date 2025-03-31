
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading?: boolean;
  children?: React.ReactNode;
  variant?: 'default' | 'circle' | 'rounded' | 'card';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

const Skeleton = ({
  isLoading = true,
  children,
  className,
  variant = 'default',
  width,
  height,
  animate = true,
  ...props
}: SkeletonProps) => {
  if (!isLoading) return <>{children}</>;

  return (
    <div
      className={cn(
        'bg-muted/70 dark:bg-muted/40 relative overflow-hidden', 
        animate && 'after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.5s_infinite] after:bg-gradient-to-r after:from-transparent after:via-muted-foreground/10 after:to-transparent',
        variant === 'circle' && 'rounded-full',
        variant === 'rounded' && 'rounded-lg',
        variant === 'card' && 'rounded-xl',
        className
      )}
      style={{
        width: width,
        height: height,
      }}
      aria-hidden="true"
      {...props}
    />
  );
};

interface SkeletonTextProps extends Omit<SkeletonProps, 'variant'> {
  lines?: number;
  lastLineWidth?: string;
}

const SkeletonText = ({
  lines = 1,
  lastLineWidth = '100%',
  className,
  ...props
}: SkeletonTextProps) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="rounded"
          className={cn(
            'h-4',
            i === lines - 1 && lastLineWidth !== '100%' && 'w-[' + lastLineWidth + ']',
            className
          )}
          {...props}
        />
      ))}
    </div>
  );
};

interface SkeletonCardProps extends Omit<SkeletonProps, 'variant'> {
  hasImage?: boolean;
  hasFooter?: boolean;
}

const SkeletonCard = ({
  hasImage = true,
  hasFooter = true,
  className,
  ...props
}: SkeletonCardProps) => {
  return (
    <div 
      className={cn(
        'rounded-xl border bg-card p-4 shadow-sm', 
        className
      )}
      {...props}
    >
      {hasImage && (
        <Skeleton className="h-48 w-full rounded-lg mb-4" />
      )}
      <Skeleton className="h-7 w-4/5 rounded-lg mb-3" />
      <SkeletonText lines={3} lastLineWidth="60%" className="mb-4" />
      
      {hasFooter && (
        <div className="flex justify-between items-center pt-3 border-t">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      )}
    </div>
  );
};

interface SkeletonTableProps extends Omit<SkeletonProps, 'variant'> {
  rows?: number;
  columns?: number;
}

const SkeletonTable = ({
  rows = 5,
  columns = 4,
  className,
  ...props
}: SkeletonTableProps) => {
  return (
    <div className={cn('w-full overflow-hidden rounded-lg border', className)} {...props}>
      <div className="bg-muted/30 p-4">
        <Skeleton className="h-8 w-1/3 rounded-lg" />
      </div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {/* Header row */}
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="p-3 border-b border-r bg-muted/20">
            <Skeleton className="h-5 w-full rounded" />
          </div>
        ))}
        
        {/* Data rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div 
                key={`cell-${rowIndex}-${colIndex}`} 
                className={cn(
                  'p-3 border-b border-r',
                  rowIndex % 2 === 0 && 'bg-muted/10'
                )}
              >
                <Skeleton 
                  className="h-5 rounded" 
                  width={`${Math.random() * 40 + 60}%`} 
                />
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
};

Skeleton.Text = SkeletonText;
Skeleton.Card = SkeletonCard;
Skeleton.Table = SkeletonTable;

export { Skeleton };
