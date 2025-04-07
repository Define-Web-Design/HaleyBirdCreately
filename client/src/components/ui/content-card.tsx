import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

interface ContentCardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  interactive?: boolean;
  onClick?: () => void;
  isLoading?: boolean;
}

export function ContentCard({
  title,
  children,
  footer,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  interactive = false,
  onClick,
  isLoading = false,
}: ContentCardProps) {
  const isMobile = useIsMobile();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (interactive && onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200',
        interactive && 'hover:shadow-md cursor-pointer',
        isLoading && 'animate-pulse',
        isMobile && 'touch-manipulation',
        className
      )}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      data-mobile={isMobile}
    >
      {title && (
        <CardHeader className={cn('px-4 py-3', headerClassName)}>
          {title}
        </CardHeader>
      )}
      <CardContent className={cn('px-4 py-3', contentClassName)}>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && (
        <CardFooter className={cn('px-4 py-3 border-t', footerClassName)}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

export default ContentCard;