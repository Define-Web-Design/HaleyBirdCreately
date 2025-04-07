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
      console.log('Task verification: WebSocket connection opened');
      setConnected(true);
      webSocketClient.subscribe('tasks');
    };
    
    const handleClose = () => {
      console.log('Task verification: WebSocket connection closed');
      setConnected(false);
    };
    
    // Handle task updates from the server
    const handleTaskUpdate = (data: any) => {
      console.log('Received task update:', data);
      queryClient.invalidateQueries({ 
        queryKey: ['/api/task-verification/tasks'] 
      });
    };
    
    // Handle reconnection attempts
    const handleReconnectionAttempt = (data: any) => {
      console.log(`Task verification: Reconnection attempt ${data.attempt}/${data.maxAttempts}`);
    };
    
    // Handle permanent reconnection failure
    const handleReconnectionFailed = (data: any) => {
      console.error('Task verification: WebSocket reconnection failed permanently', data);
      setConnected(false);
    };
    
    // Set up event handlers
    webSocketClient.on('connection_open', handleOpen);
    webSocketClient.on('connection_close', handleClose);
    webSocketClient.on('task_update', handleTaskUpdate);
    webSocketClient.on('reconnection_attempt', handleReconnectionAttempt);
    webSocketClient.on('reconnection_failed', handleReconnectionFailed);
    
    // Connect to WebSocket server if not already connected
    if (!webSocketClient.connected) {
      webSocketClient.connect();
    } else {
      // If already connected, update our state to reflect that
      setConnected(true);
      // And make sure we're subscribed
      webSocketClient.subscribe('tasks');
    }
    
    // Clean up on unmount
    return () => {
      webSocketClient.off('connection_open', handleOpen);
      webSocketClient.off('connection_close', handleClose);
      webSocketClient.off('task_update', handleTaskUpdate);
      webSocketClient.off('reconnection_attempt', handleReconnectionAttempt);
      webSocketClient.off('reconnection_failed', handleReconnectionFailed);
      // Note: We don't close the connection here because it might be used by other components
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