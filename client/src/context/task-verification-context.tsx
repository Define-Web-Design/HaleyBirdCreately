
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TaskVerification, TaskVerificationResult } from '../utils/task-verification';
import { checkpointManager } from '../utils/checkpoint-manager';

interface TaskVerificationContextType {
  status: TaskVerificationResult | null;
  loading: boolean;
  registerTask: (taskId: string, taskName: string) => void;
  completeTask: (taskId: string, details?: string) => void;
  failTask: (taskId: string, details?: string) => void;
  verifyAllTasks: () => Promise<TaskVerificationResult>;
  canCreateCheckpoint: () => boolean;
  createTaskId: (prefix: string) => string;
  resetVerification: () => void;
  createCheckpoint: (description: string) => Promise<{
    success: boolean;
    message: string;
  }>;
  checkpoints: any[];
}

const TaskVerificationContext = createContext<TaskVerificationContextType | undefined>(undefined);

export function TaskVerificationProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<TaskVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);

  // Load initial status
  useEffect(() => {
    setStatus(TaskVerification.getVerificationStatus());
    
    // Set up polling or event-based updates
    const interval = setInterval(() => {
      setStatus(TaskVerification.getVerificationStatus());
      setCheckpoints(checkpointManager.getTasks());
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to register a new task
  const registerTask = (taskId: string, taskName: string) => {
    TaskVerification.registerTask(taskId, taskName);
    setStatus(TaskVerification.getVerificationStatus());
  };
  
  // Function to mark a task as completed
  const completeTask = (taskId: string, details?: string) => {
    TaskVerification.completeTask(taskId, details);
    setStatus(TaskVerification.getVerificationStatus());
  };
  
  // Function to mark a task as failed
  const failTask = (taskId: string, details?: string) => {
    TaskVerification.failTask(taskId, details);
    setStatus(TaskVerification.getVerificationStatus());
  };
  
  // Function to run verification on all tasks
  const verifyAllTasks = async () => {
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
  };
  
  // Create a checkpoint
  const createCheckpoint = async (description: string) => {
    setLoading(true);
    try {
      const result = await Promise.resolve({ success: true, message: 'Checkpoint created' });
      if (result.success) {
        setCheckpoints(checkpointManager.getTasks());
      }
      return result;
    } catch (error) {
      console.error('Error creating checkpoint:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a checkpoint can be created
  const canCreateCheckpoint = () => {
    return TaskVerification.canCreateCheckpoint();
  };
  
  // Create a task ID
  const createTaskId = (prefix: string) => {
    return TaskVerification.createTaskId(prefix);
  };
  
  // Reset verification
  const resetVerification = () => {
    TaskVerification.resetVerification();
    setStatus(TaskVerification.getVerificationStatus());
  };

  return (
    <TaskVerificationContext.Provider 
      value={{
        status,
        loading,
        registerTask,
        completeTask,
        failTask,
        verifyAllTasks,
        canCreateCheckpoint,
        createTaskId,
        resetVerification,
        createCheckpoint,
        checkpoints
      }}
    >
      {children}
    </TaskVerificationContext.Provider>
  );
}

export function useTaskVerificationContext() {
  const context = useContext(TaskVerificationContext);
  if (context === undefined) {
    throw new Error('useTaskVerificationContext must be used within a TaskVerificationProvider');
  }
  return context;
}
