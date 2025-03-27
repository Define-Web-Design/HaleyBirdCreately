
import { useState, useEffect } from 'react';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  pendingChanges: any[];
}

export function useOfflineSync() {
  const [state, setState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSynced: null,
    pendingChanges: []
  });

  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      syncChanges();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const syncChanges = async () => {
    if (!state.pendingChanges.length) return;

    setState(prev => ({ ...prev, isSyncing: true }));
    try {
      // Implement your sync logic here
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSynced: new Date(),
        pendingChanges: []
      }));
    } catch (error) {
      console.error('Sync failed:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  };

  const addChange = (change: any) => {
    setState(prev => ({
      ...prev,
      pendingChanges: [...prev.pendingChanges, change]
    }));
    if (state.isOnline) {
      syncChanges();
    }
  };

  return {
    ...state,
    addChange,
    syncChanges
  };
}
