import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@/components/ui/toast';

interface AutoDismissToasterProps {
  autoDismissTimeout?: number;
}

export function AutoDismissToaster({ autoDismissTimeout = 5000 }: AutoDismissToasterProps) {
  const { toasts, dismissToast } = useToast();

  // Auto-dismiss toasts after timeout
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    toasts.forEach((toast) => {
      if (!toast.dismissed) {
        const timer = setTimeout(() => {
          dismissToast(toast.id);
        }, autoDismissTimeout);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [toasts, dismissToast, autoDismissTimeout]);

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}