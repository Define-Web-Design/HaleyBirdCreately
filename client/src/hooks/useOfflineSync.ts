
import { useState, useEffect } from 'react';

interface SyncOptions {
  key: string;
  onSync?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useOfflineSync = ({ key, onSync, onError }: SyncOptions) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveChange = async (change: any) => {
    try {
      if (!isOnline) {
        const stored = JSON.parse(localStorage.getItem(key) || '[]');
        stored.push({ ...change, timestamp: Date.now() });
        localStorage.setItem(key, JSON.stringify(stored));
        setPendingChanges(stored);
      } else {
        await onSync?.(change);
      }
    } catch (error) {
      onError?.(error as Error);
    }
  };

  useEffect(() => {
    if (isOnline && pendingChanges.length > 0) {
      const syncChanges = async () => {
        for (const change of pendingChanges) {
          try {
            await onSync?.(change);
          } catch (error) {
            onError?.(error as Error);
          }
        }
        localStorage.removeItem(key);
        setPendingChanges([]);
      };
      syncChanges();
    }
  }, [isOnline, pendingChanges, key, onSync, onError]);

  return { isOnline, pendingChanges, saveChange };
};
