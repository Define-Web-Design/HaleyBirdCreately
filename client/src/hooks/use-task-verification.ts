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

  const updateTaskProgress = useCallback(async (taskId: string, progressPercentage: number) => {
    setLoading(true);
    try {
      await apiRequest({
        url: `/api/task-verification/progress/${taskId}`,
        method: 'PATCH',
        data: { progressPercentage }
      });
      await refreshTasks();
      return true;
    } catch (error) {
      console.error('Error updating task progress:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTaskStatus = useCallback(async (taskId: string, status: string) => {
    setLoading(true);
    try {
      await apiRequest({
        url: `/api/task-verification/status/${taskId}`,
        method: 'PATCH',
        data: { status }
      });
      await refreshTasks();
      return true;
    } catch (error) {
      console.error('Error updating task status:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData: any) => {
    setLoading(true);
    try {
      const response = await apiRequest({
        url: `/api/task-verification/tasks`,
        method: 'POST',
        data: taskData
      });
      await refreshTasks();
      return response;
    } catch (error) {
      console.error('Error creating task:', error);
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
    updateTaskProgress,
    updateTaskStatus,
    createTask,
    refreshTasks,
    loading
  };
}

export default useTaskVerification;