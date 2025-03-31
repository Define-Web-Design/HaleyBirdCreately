
/**
 * Checkpoint Management System
 * Ensures all tasks are verified before allowing checkpoints to be created
 */

import { TaskVerification } from './task-verification';

interface Checkpoint {
  id: string;
  timestamp: string;
  description: string;
  tasks: string[];
  verificationStatus: {
    allTasksCompleted: boolean;
    completedTaskCount: number;
    totalTaskCount: number;
  };
}

// Store checkpoints in memory (in a real app, this would use persistent storage)
const checkpoints: Checkpoint[] = [];

/**
 * Create a new checkpoint if all tasks are verified
 */
export async function createCheckpoint(description: string): Promise<{
  success: boolean;
  checkpoint?: Checkpoint;
  message: string;
}> {
  // First verify all tasks
  const verificationResult = await TaskVerification.verifyAllTasks();
  
  if (!verificationResult.completed) {
    return {
      success: false,
      message: `Cannot create checkpoint: ${verificationResult.blockers.length} tasks not completed. ${verificationResult.blockers.join('; ')}`
    };
  }
  
  // All tasks completed, create checkpoint
  const checkpoint: Checkpoint = {
    id: `cp_${Date.now()}`,
    timestamp: new Date().toISOString(),
    description,
    tasks: verificationResult.taskResults.map(t => t.taskId),
    verificationStatus: {
      allTasksCompleted: true,
      completedTaskCount: verificationResult.taskResults.length,
      totalTaskCount: verificationResult.taskResults.length
    }
  };
  
  checkpoints.push(checkpoint);
  
  return {
    success: true,
    checkpoint,
    message: `Checkpoint "${description}" created successfully with ${checkpoint.verificationStatus.completedTaskCount} verified tasks`
  };
}

/**
 * Get list of all checkpoints
 */
export function getCheckpoints(): Checkpoint[] {
  return [...checkpoints];
}

/**
 * Get a specific checkpoint by ID
 */
export function getCheckpointById(id: string): Checkpoint | undefined {
  return checkpoints.find(cp => cp.id === id);
}

/**
 * Clear all checkpoints
 */
export function clearCheckpoints(): void {
  checkpoints.length = 0;
}

export const CheckpointManager = {
  createCheckpoint,
  getCheckpoints,
  getCheckpointById,
  clearCheckpoints
};

export default CheckpointManager;
