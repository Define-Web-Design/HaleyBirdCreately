
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AutoDismissToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
  duration?: number;
  className?: string;
  hasCloseButton?: boolean;
  onDismiss?: (id: string) => void;
}

const variantStyles = {
  default: 'bg-background border-border',
  success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
  warning: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800',
  destructive: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
  info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
};

const variantIconStyles = {
  default: 'text-foreground',
  success: 'text-green-500 dark:text-green-400',
  warning: 'text-yellow-500 dark:text-yellow-400',
  destructive: 'text-red-500 dark:text-red-400',
  info: 'text-blue-500 dark:text-blue-400',
};

export const AutoDismissToast = ({
  id,
  title,
  description,
  variant = 'default',
  duration = 5000,
  className,
  hasCloseButton = true,
  onDismiss,
}: AutoDismissToastProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  // Handle dismiss animation
  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete
    setTimeout(() => {
      onDismiss?.(id);
    }, 300);
  };
  
  // Set up progress bar timer
  useEffect(() => {
    if (duration === Infinity) return;
    
    const startTime = Date.now();
    const endTime = startTime + duration;
    
    const updateProgress = () => {
      const now = Date.now();
      const remaining = endTime - now;
      const newProgress = Math.max(0, (remaining / duration) * 100);
      
      setProgress(newProgress);
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        handleDismiss();
      }
    };
    
    const animationId = requestAnimationFrame(updateProgress);
    
    return () => cancelAnimationFrame(animationId);
  }, [duration, id]);
  
  // Handle pause on hover/focus
  const handlePause = () => {
    // We could implement pausing the progress bar here
  };
  
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg border p-4 shadow-md",
        variantStyles[variant],
        isVisible ? 'animate-in slide-in-from-right duration-300' : 'animate-out slide-out-to-right duration-300',
        className
      )}
      role="alert"
      aria-live="polite"
      onMouseEnter={handlePause}
      onFocus={handlePause}
    >
      <div className="flex items-start gap-4">
        {/* Icon - could be customized based on variant */}
        {variant !== 'default' && (
          <div className={cn("flex-shrink-0", variantIconStyles[variant])}>
            {variant === 'success' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            )}
            {variant === 'warning' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            )}
            {variant === 'destructive' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            )}
            {variant === 'info' && (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
            )}
          </div>
        )}
        
        <div className="flex-1 space-y-1">
          {title && <p className="font-medium">{title}</p>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        
        {hasCloseButton && (
          <button 
            onClick={handleDismiss}
            className="flex-shrink-0 rounded-full p-1 hover:bg-muted transition-colors"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {/* Progress bar */}
      {duration !== Infinity && (
        <div 
          className={cn(
            "absolute bottom-0 left-0 h-1 transition-all", 
            variant === 'default' ? 'bg-primary' : variantIconStyles[variant]
          )}
          style={{ width: `${progress}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

interface AutoDismissToasterProps {
  className?: string;
  defaultDuration?: number;
}

export const AutoDismissToaster = ({ className, defaultDuration = 5000 }: AutoDismissToasterProps) => {
  const { toasts, dismiss } = useToast();
  
  return (
    <div className={cn("fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-md", className)}>
      {toasts.map((toast) => (
        <AutoDismissToast
          key={toast.id}
          id={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant as any}
          duration={toast.duration || defaultDuration}
          onDismiss={dismiss}
        />
      ))}
    </div>
  );
};
