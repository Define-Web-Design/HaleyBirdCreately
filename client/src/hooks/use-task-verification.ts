
import { useState, useEffect, useCallback } from 'react';
import { TaskVerification, TaskVerificationResult } from '../utils/task-verification';

export function useTaskVerification() {
  const [status, setStatus] = useState<TaskVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Load initial status
  useEffect(() => {
    setStatus(TaskVerification.getVerificationStatus());
    
    // Optional: set up polling or event-based updates
    const interval = setInterval(() => {
      setStatus(TaskVerification.getVerificationStatus());
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to register a new task
  const registerTask = useCallback((taskId: string, taskName: string) => {
    TaskVerification.registerTask(taskId, taskName);
    setStatus(TaskVerification.getVerificationStatus());
  }, []);
  
  // Function to mark a task as completed
  const completeTask = useCallback((taskId: string, details?: string) => {
    TaskVerification.completeTask(taskId, details);
    setStatus(TaskVerification.getVerificationStatus());
  }, []);
  
  // Function to mark a task as failed
  const failTask = useCallback((taskId: string, details?: string) => {
    TaskVerification.failTask(taskId, details);
    setStatus(TaskVerification.getVerificationStatus());
  }, []);
  
  // Function to run verification on all tasks
  const verifyAllTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await TaskVerification.verifyAllTasks();
      setStatus(result);
      return result;
    } catch (error) {
      console.error('Error verifying tasks:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Check if a checkpoint can be created
  const canCreateCheckpoint = useCallback(() => {
    return TaskVerification.canCreateCheckpoint();
  }, []);
  
  // Create a task ID
  const createTaskId = useCallback((prefix: string) => {
    return TaskVerification.createTaskId(prefix);
  }, []);
  
  return {
    status,
    loading,
    registerTask,
    completeTask,
    failTask,
    verifyAllTasks,
    canCreateCheckpoint,
    createTaskId,
    resetVerification: TaskVerification.resetVerification
  };
}

export default useTaskVerification;
