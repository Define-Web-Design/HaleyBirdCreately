
import { useState, useEffect } from 'react';

export function useOfflineSync<T>(key: string, initialData: T) {
  const [data, setData] = useState<T>(initialData);
  const [pendingChanges, setPendingChanges] = useState<any[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const stored = localStorage.getItem(key);
    if (stored) {
      setData(JSON.parse(stored));
    }

    const handleOnline = () => {
      setIsOnline(true);
      syncPendingChanges();
    };

    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [key]);

  const updateData = (newData: T) => {
    setData(newData);
    localStorage.setItem(key, JSON.stringify(newData));
    
    if (!isOnline) {
      setPendingChanges(prev => [...prev, { type: 'update', data: newData }]);
    }
  };

  const syncPendingChanges = async () => {
    if (pendingChanges.length === 0) return;
    
    try {
      // Implement your sync logic here
      setPendingChanges([]);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  };

  return { data, updateData, isOnline, pendingChanges };
}
