/**
 * Security Store for tracking security-related state and actions
 */

import { create } from 'zustand';

interface SecurityLog {
  timestamp: number;
  type: 'verification' | 'access' | 'error';
  contentId: number;
  details?: string;
}

interface SecurityState {
  logs: SecurityLog[];
  isVerificationActive: boolean;
  logVerificationAttempt: (contentId: number) => void;
  logAccessAttempt: (contentId: number, details?: string) => void;
  logSecurityError: (contentId: number, details: string) => void;
  clearLogs: () => void;
  toggleVerification: () => void;
}

export const securityStore = create<SecurityState>((set) => ({
  logs: [],
  isVerificationActive: true,
  
  logVerificationAttempt: (contentId: number) => set((state) => ({
    logs: [
      ...state.logs,
      {
        timestamp: Date.now(),
        type: 'verification',
        contentId,
      },
    ],
  })),
  
  logAccessAttempt: (contentId: number, details?: string) => set((state) => ({
    logs: [
      ...state.logs,
      {
        timestamp: Date.now(),
        type: 'access',
        contentId,
        details,
      },
    ],
  })),
  
  logSecurityError: (contentId: number, details: string) => set((state) => ({
    logs: [
      ...state.logs,
      {
        timestamp: Date.now(),
        type: 'error',
        contentId,
        details,
      },
    ],
  })),
  
  clearLogs: () => set({ logs: [] }),
  
  toggleVerification: () => set((state) => ({ 
    isVerificationActive: !state.isVerificationActive 
  })),
}));