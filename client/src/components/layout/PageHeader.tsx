import React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  heading: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  rightSection?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  heading,
  description,
  children,
  className,
  rightSection,
}) => {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
          {children}
        </div>
        {rightSection && (
          <div className="flex items-center gap-2">
            {rightSection}
          </div>
        )}
      </div>
    </div>
  );
};