import React from "react";
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

/**
 * Auto-Dismiss Toaster Component
 * 
 * This component extends the default Shadcn toaster with auto-dismiss functionality.
 * It subscribes to the toast events and automatically dismisses toasts after a specified duration.
 */

type AutoDismissToasterProps = {
  defaultDuration?: number;
};

export const AutoDismissToaster: React.FC<AutoDismissToasterProps> = ({ 
  defaultDuration = 5000, // Default dismiss after 5 seconds
}) => {
  const { toast, dismiss } = useToast();
  
  // Subscribe to toast events to auto-dismiss them
  React.useEffect(() => {
    // Create a Map to store timeout IDs for each toast
    const timeouts = new Map<string, NodeJS.Timeout>();
    
    // Define the event handler with proper type
    const handleToastOpen = (event: Event) => {
      try {
        // Cast to CustomEvent to access the detail property
        const customEvent = event as CustomEvent<{ id: string }>;
        const { id } = customEvent.detail;
        
        // Set timeout to auto-dismiss the toast
        const timeoutId = setTimeout(() => {
          dismiss(id);
          timeouts.delete(id);
        }, defaultDuration);
        
        // Store the timeout ID
        timeouts.set(id, timeoutId);
      } catch (error) {
        console.error("Error handling toast event:", error);
      }
    };
    
    // Listen for toast open events with proper type casting
    document.addEventListener("toast-open", handleToastOpen);
    
    // Clean up event listener and any remaining timeouts
    return () => {
      document.removeEventListener("toast-open", handleToastOpen);
      
      // Clear all active timeouts
      timeouts.forEach((timeoutId) => clearTimeout(timeoutId));
      timeouts.clear();
    };
  }, [dismiss, defaultDuration]);
  
  return <ShadcnToaster />;
};

export default AutoDismissToaster;
import * as React from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from './toast';
import { useToast } from '@/hooks/use-toast';

export function AutoDismissToaster() {
  const { toasts } = useToast();

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
