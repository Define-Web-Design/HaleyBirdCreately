import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Import the toast component from UI components
import { toast } from '../components/ui/toast';

// Define Task Status
export enum TaskStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  FAILED = 'failed',
}

// Define Task type
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  checkpoints: Checkpoint[];
  completionPoints: number;
  createdAt: string;
  updatedAt: string;
}

// Define Checkpoint type
export interface Checkpoint {
  id: string;
  taskId: string;
  description: string;
  isCompleted: boolean;
  completionCriteria?: {
    [key: string]: any;
  };
  verificationMethod?: string;
  verificationFn?: () => Promise<boolean>;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Define class for managing checkpoints
class CheckpointManager {
  private tasks: Map<string, Task> = new Map();
  private currentTask: Task | null = null;
  private checkpointListeners: Set<(tasks: Task[]) => void> = new Set();
  private saveDebounceTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadTasksFromLocalStorage();
  }

  // Load tasks from localStorage
  private loadTasksFromLocalStorage(): void {
    try {
      const tasksJson = localStorage.getItem('tasks');
      if (tasksJson) {
        const tasksArray: Task[] = JSON.parse(tasksJson);
        tasksArray.forEach(task => {
          this.tasks.set(task.id, task);
        });
      }

      const currentTaskId = localStorage.getItem('currentTaskId');
      if (currentTaskId) {
        this.currentTask = this.tasks.get(currentTaskId) || null;
      }
    } catch (error) {
      console.error('Error loading tasks from localStorage:', error);
    }
  }

  // Save tasks to localStorage
  private saveTasksToLocalStorage(): void {
    if (this.saveDebounceTimeout) {
      clearTimeout(this.saveDebounceTimeout);
    }

    this.saveDebounceTimeout = setTimeout(() => {
      try {
        const tasksArray = Array.from(this.tasks.values());
        localStorage.setItem('tasks', JSON.stringify(tasksArray));
        if (this.currentTask) {
          localStorage.setItem('currentTaskId', this.currentTask.id);
        } else {
          localStorage.removeItem('currentTaskId');
        }
        this.notifyListeners();
      } catch (error) {
        console.error('Error saving tasks to localStorage:', error);
      }
    }, 300);
  }

  // Add a listener for checkpoint changes
  public addListener(listener: (tasks: Task[]) => void): () => void {
    this.checkpointListeners.add(listener);
    
    // Return a function to remove the listener
    return () => {
      this.checkpointListeners.delete(listener);
    };
  }

  // Notify all listeners of task changes
  private notifyListeners(): void {
    const tasksArray = Array.from(this.tasks.values());
    this.checkpointListeners.forEach(listener => {
      listener(tasksArray);
    });
  }

  // Get all tasks
  public getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  // Get a task by ID
  public getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  // Create a new task
  public createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    };
    
    this.tasks.set(newTask.id, newTask);
    this.saveTasksToLocalStorage();
    
    return newTask;
  }

  // Update a task
  public updateTask(taskId: string, updates: Partial<Task>): Task | null {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    const updatedTask: Task = {
      ...task,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    
    this.tasks.set(taskId, updatedTask);
    if (this.currentTask?.id === taskId) {
      this.currentTask = updatedTask;
    }
    
    this.saveTasksToLocalStorage();
    return updatedTask;
  }

  // Delete a task
  public deleteTask(taskId: string): boolean {
    const deleted = this.tasks.delete(taskId);
    if (deleted) {
      if (this.currentTask?.id === taskId) {
        this.currentTask = null;
      }
      this.saveTasksToLocalStorage();
    }
    return deleted;
  }

  // Set the current active task
  public setCurrentTask(taskId: string): Task | null {
    const task = this.tasks.get(taskId);
    if (task) {
      this.currentTask = task;
      this.saveTasksToLocalStorage();
      return task;
    }
    return null;
  }

  // Get the current active task
  public getCurrentTask(): Task | null {
    return this.currentTask;
  }

  // Complete a checkpoint
  public completeCheckpoint(taskId: string, checkpointId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    const checkpointIndex = task.checkpoints.findIndex(cp => cp.id === checkpointId);
    if (checkpointIndex === -1) return false;
    
    task.checkpoints[checkpointIndex].isCompleted = true;
    
    // Check if all checkpoints are completed
    const allCompleted = task.checkpoints.every(cp => cp.isCompleted);
    if (allCompleted && task.status !== TaskStatus.VERIFIED) {
      task.status = TaskStatus.COMPLETED;
    }
    
    this.tasks.set(taskId, {
      ...task,
      updatedAt: new Date().toISOString(),
    });
    
    this.saveTasksToLocalStorage();
    
    // Show a toast notification
    toast({
      title: 'Checkpoint completed!',
      description: `${task.checkpoints[checkpointIndex].description} has been marked as complete.`,
    });
    
    return true;
  }

  // Verify a task (run all verification functions)
  public async verifyTask(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;
    
    let allVerified = true;
    
    for (const checkpoint of task.checkpoints) {
      if (checkpoint.verificationFn) {
        try {
          const isVerified = await checkpoint.verificationFn();
          if (!isVerified) {
            allVerified = false;
            break;
          }
        } catch (error) {
          console.error(`Error verifying checkpoint ${checkpoint.id}:`, error);
          allVerified = false;
          break;
        }
      }
    }
    
    if (allVerified) {
      this.updateTask(taskId, { status: TaskStatus.VERIFIED });
      
      toast({
        title: 'Task Verified!',
        description: `${task.title} has been verified and marked as complete.`,
      });
    } else {
      this.updateTask(taskId, { status: TaskStatus.FAILED });
      
      toast({
        title: 'Verification Failed',
        description: 'Some checkpoints could not be verified. Please check the requirements and try again.',
        variant: 'destructive',
      });
    }
    
    return allVerified;
  }
}

// Export a singleton instance
export const checkpointManager = new CheckpointManager();

// React hook for using the checkpoint manager
export function useCheckpointManager() {
  const [tasks, setTasks] = useState<Task[]>(checkpointManager.getTasks());
  const [currentTask, setCurrentTask] = useState<Task | null>(checkpointManager.getCurrentTask());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update states when tasks change
  useEffect(() => {
    const removeListener = checkpointManager.addListener((updatedTasks) => {
      setTasks([...updatedTasks]);
      setCurrentTask(checkpointManager.getCurrentTask());
    });
    
    return removeListener;
  }, []);

  // Complete a checkpoint and optionally send to API
  const completeCheckpoint = useCallback(async (taskId: string, checkpointId: string, syncWithServer: boolean = false) => {
    const result = checkpointManager.completeCheckpoint(taskId, checkpointId);
    
    if (result && syncWithServer) {
      try {
        await apiRequest('/api/checkpoints/complete', {
          method: 'POST',
          body: JSON.stringify({
            taskId,
            checkpointId
          })
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      } catch (error) {
        console.error('Error syncing checkpoint completion with server:', error);
        toast({
          title: 'Sync Error',
          description: 'Your progress was saved locally but failed to sync with the server.',
          variant: 'destructive',
        });
      }
    }
    
    return result;
  }, [toast, queryClient]);

  // Verify a task and optionally sync with server
  const verifyTask = useCallback(async (taskId: string, syncWithServer: boolean = false) => {
    const result = await checkpointManager.verifyTask(taskId);
    
    if (result && syncWithServer) {
      try {
        await apiRequest('/api/tasks/verify', {
          method: 'POST',
          body: JSON.stringify({ taskId })
        });
        
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      } catch (error) {
        console.error('Error syncing task verification with server:', error);
        toast({
          title: 'Sync Error',
          description: 'Your task was verified locally but failed to sync with the server.',
          variant: 'destructive',
        });
      }
    }
    
    return result;
  }, [toast, queryClient]);

  return {
    tasks,
    currentTask,
    createTask: checkpointManager.createTask.bind(checkpointManager),
    updateTask: checkpointManager.updateTask.bind(checkpointManager),
    deleteTask: checkpointManager.deleteTask.bind(checkpointManager),
    setCurrentTask: checkpointManager.setCurrentTask.bind(checkpointManager),
    completeCheckpoint,
    verifyTask,
  };
}