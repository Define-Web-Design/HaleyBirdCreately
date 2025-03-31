
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface SyncItem {
  id: string;
  timestamp: number;
  data: any;
  synced: boolean;
}

interface SyncConflict {
  localItem: SyncItem;
  serverItem: any;
  resolved: boolean;
}

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  pendingChanges: SyncItem[];
  conflicts: SyncConflict[];
}

// Mock storage implementation - would be replaced with IndexedDB in production
const localStorageKey = 'offline_sync_data';

const getLocalItems = (): SyncItem[] => {
  try {
    const storedData = localStorage.getItem(localStorageKey);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error retrieving local data:', error);
    return [];
  }
};

const saveLocalItems = (items: SyncItem[]) => {
  try {
    localStorage.setItem(localStorageKey, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving local data:', error);
  }
};

export function useOfflineSync() {
  const { toast } = useToast();
  const [state, setState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSynced: null,
    pendingChanges: getLocalItems().filter(item => !item.synced),
    conflicts: []
  });

  // Load local data on mount
  useEffect(() => {
    setState(prev => ({
      ...prev,
      pendingChanges: getLocalItems().filter(item => !item.synced)
    }));
  }, []);

  // Listen for network changes
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }));
      toast({
        title: "You're back online",
        description: "Syncing your changes...",
        duration: 3000
      });
      syncChanges();
    };

    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "You're offline",
        description: "Changes will be synced when you reconnect",
        duration: 3000
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync local changes with server
  const syncChanges = useCallback(async () => {
    if (!state.isOnline || !state.pendingChanges.length || state.isSyncing) return;

    setState(prev => ({ ...prev, isSyncing: true }));
    
    try {
      const itemsToSync = [...state.pendingChanges];
      const conflicts: SyncConflict[] = [];
      const syncedItems: SyncItem[] = [];
      
      // Process each pending change
      for (const item of itemsToSync) {
        try {
          // In a real implementation, make API call here
          // const serverResponse = await api.sync(item.data);
          
          // Simulate conflict detection (would be based on server response in production)
          const hasConflict = Math.random() < 0.1; // 10% chance of conflict for demonstration
          
          if (hasConflict) {
            // Simulate server data
            const serverItem = { 
              ...item.data,
              updatedAt: new Date().toISOString(),
              serverValue: 'Changed on server'
            };
            
            conflicts.push({
              localItem: item,
              serverItem,
              resolved: false
            });
          } else {
            syncedItems.push(item);
          }
          
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
        }
      }
      
      // Update local storage with synced items
      const allItems = getLocalItems();
      const updatedItems = allItems.map(item => {
        if (syncedItems.some(syncedItem => syncedItem.id === item.id)) {
          return { ...item, synced: true };
        }
        return item;
      });
      saveLocalItems(updatedItems);
      
      // Update state
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSynced: new Date(),
        pendingChanges: prev.pendingChanges.filter(
          item => !syncedItems.some(syncedItem => syncedItem.id === item.id)
        ),
        conflicts: [...prev.conflicts, ...conflicts]
      }));
      
      // Notify user
      if (syncedItems.length > 0) {
        toast({
          title: "Sync completed",
          description: `${syncedItems.length} item(s) synchronized successfully`,
          duration: 3000
        });
      }
      
      if (conflicts.length > 0) {
        toast({
          title: "Sync conflicts detected",
          description: `${conflicts.length} item(s) have conflicts that need resolution`,
          variant: "destructive",
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setState(prev => ({ ...prev, isSyncing: false }));
      toast({
        title: "Sync failed",
        description: "Please try again later",
        variant: "destructive",
        duration: 3000
      });
    }
  }, [state.isOnline, state.pendingChanges, state.isSyncing]);

  // Add a new change to be synced
  const addChange = useCallback((change: any) => {
    const newItem: SyncItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      data: change,
      synced: false
    };
    
    // Update local storage
    const currentItems = getLocalItems();
    saveLocalItems([...currentItems, newItem]);
    
    // Update state
    setState(prev => ({
      ...prev,
      pendingChanges: [...prev.pendingChanges, newItem]
    }));
    
    // Attempt to sync immediately if online
    if (state.isOnline) {
      syncChanges();
    } else {
      toast({
        title: "Saved offline",
        description: "Changes will sync when you're back online",
        duration: 3000
      });
    }
  }, [state.isOnline, syncChanges]);

  // Resolve a conflict
  const resolveConflict = useCallback((conflictId: string, useLocalVersion: boolean) => {
    setState(prev => {
      const conflict = prev.conflicts.find(c => c.localItem.id === conflictId);
      
      if (!conflict) return prev;
      
      // Update local storage based on resolution choice
      const allItems = getLocalItems();
      const updatedItems = allItems.map(item => {
        if (item.id === conflictId) {
          return { 
            ...item, 
            synced: true,
            data: useLocalVersion ? item.data : conflict.serverItem
          };
        }
        return item;
      });
      saveLocalItems(updatedItems);
      
      return {
        ...prev,
        conflicts: prev.conflicts.map(c => 
          c.localItem.id === conflictId ? { ...c, resolved: true } : c
        )
      };
    });
    
    toast({
      title: "Conflict resolved",
      description: `Using ${useLocalVersion ? 'your' : 'server'} version`,
      duration: 3000
    });
  }, []);

  return {
    ...state,
    addChange,
    syncChanges,
    resolveConflict,
    hasUnresolvedConflicts: state.conflicts.some(c => !c.resolved)
  };
}
