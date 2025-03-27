
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveElementProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverScale?: number;
  tapScale?: number;
  withRipple?: boolean;
  withGlow?: boolean;
}

export const InteractiveElement = ({
  children,
  className,
  hoverScale = 1.02,
  tapScale = 0.98,
  withRipple = false,
  withGlow = false,
  ...props
}: InteractiveElementProps) => {
  return (
    <motion.div
      className={cn(
        'relative overflow-hidden transition-all duration-300',
        withGlow && 'hover:shadow-glow',
        className
      )}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      initial={{ opacity: 0.95 }}
      animate={{ opacity: 1 }}
      {...props}
    >
      {children}
      {withRipple && (
        <span className="absolute inset-0 transform translate-y-full bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500" />
      )}
    </motion.div>
  );
};

interface InteractiveButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'subtle' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  withIndicator?: boolean;
  indicatorColor?: string;
}

export const InteractiveButton = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  withIndicator = false,
  indicatorColor = 'bg-primary',
  ...props
}: InteractiveButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5 text-lg',
  };
  
  const variantClasses = {
    default: 'bg-primary text-white hover:bg-primary/90',
    subtle: 'bg-primary/10 text-primary hover:bg-primary/20',
    outline: 'border border-primary/50 text-primary hover:bg-primary/10',
    ghost: 'text-primary hover:bg-primary/10',
  };
  
  return (
    <motion.button
      className={cn(
        'rounded-lg font-medium transition-all duration-300 inline-flex items-center justify-center relative',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
      {withIndicator && (
        <span className={cn('absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full ring-2 ring-white', indicatorColor)} />
      )}
    </motion.button>
  );
};
