
/**
 * Task Verification API Client
 * Client-side API for interacting with the task verification service
 */

import { apiRequest } from '../lib/apiInterceptor';

const BASE_URL = '/api/task-verification';

/**
 * Get all tasks status
 */
export async function getAllTasksStatus() {
  return await apiRequest({
    url: `${BASE_URL}/tasks`,
    method: 'GET'
  });
}

/**
 * Register a new task
 */
export async function registerTask(taskId: string, name: string, category: string) {
  return await apiRequest({
    url: `${BASE_URL}/tasks`,
    method: 'POST',
    data: { taskId, name, category }
  });
}

/**
 * Complete a task
 */
export async function completeTask(taskId: string, details?: string) {
  return await apiRequest({
    url: `${BASE_URL}/tasks/${taskId}/complete`,
    method: 'POST',
    data: { details }
  });
}

/**
 * Mark a task as failed
 */
export async function failTask(taskId: string, details?: string) {
  return await apiRequest({
    url: `${BASE_URL}/tasks/${taskId}/fail`,
    method: 'POST',
    data: { details }
  });
}

/**
 * Verify a task
 */
export async function verifyTask(taskId: string) {
  return await apiRequest({
    url: `${BASE_URL}/tasks/${taskId}/verify`,
    method: 'POST'
  });
}

/**
 * Create a checkpoint
 */
export async function createCheckpoint(name: string, description?: string) {
  return await apiRequest({
    url: `${BASE_URL}/checkpoint`,
    method: 'POST',
    data: { name, description }
  });
}

/**
 * Check if checkpoint can be created
 */
export async function canCreateCheckpoint() {
  return await apiRequest({
    url: `${BASE_URL}/checkpoint/check`,
    method: 'GET'
  });
}

/**
 * Reset all tasks
 */
export async function resetTasks() {
  return await apiRequest({
    url: `${BASE_URL}/reset`,
    method: 'POST'
  });
}

// Export all functions as a single object
export const TaskVerificationAPI = {
  getAllTasksStatus,
  registerTask,
  completeTask,
  failTask,
  verifyTask,
  createCheckpoint,
  canCreateCheckpoint,
  resetTasks
};

export default TaskVerificationAPI;
