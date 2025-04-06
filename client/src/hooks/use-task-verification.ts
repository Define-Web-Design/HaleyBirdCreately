import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';

export function useTaskVerification() {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const verifyTask = useCallback(async (taskId: string) => {
    setLoading(true);
    try {
      await apiRequest({
        url: `/api/task-verification/verify/${taskId}`,
        method: 'POST'
      });
      await refreshTasks();
      return true;
    } catch (error) {
      console.error('Error verifying task:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshTasks = useCallback(async () => {
    return await queryClient.invalidateQueries({ 
      queryKey: ['/api/task-verification/tasks'] 
    });
  }, [queryClient]);

  return {
    verifyTask,
    refreshTasks,
    loading
  };
}

export default useTaskVerification;