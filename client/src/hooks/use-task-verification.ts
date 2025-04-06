import { useState, useCallback, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import webSocketClient from '@/lib/webSocketClient';

export function useTaskVerification() {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  // Initialize WebSocket connection
  useEffect(() => {
    // Handle connection events
    const handleOpen = () => {
      setConnected(true);
      webSocketClient.subscribe('tasks');
    };
    
    const handleClose = () => {
      setConnected(false);
    };
    
    // Handle task updates from the server
    const handleTaskUpdate = (data: any) => {
      console.log('Received task update:', data);
      queryClient.invalidateQueries({ 
        queryKey: ['/api/task-verification/tasks'] 
      });
    };
    
    // Set up event handlers
    webSocketClient.on('connection_open', handleOpen);
    webSocketClient.on('connection_close', handleClose);
    webSocketClient.on('task_update', handleTaskUpdate);
    
    // Connect to WebSocket server
    webSocketClient.connect();
    
    // Clean up on unmount
    return () => {
      webSocketClient.off('connection_open', handleOpen);
      webSocketClient.off('connection_close', handleClose);
      webSocketClient.off('task_update', handleTaskUpdate);
    };
  }, [queryClient]);

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
    loading,
    connected,
    webSocketConnected: connected
  };
}

export default useTaskVerification;