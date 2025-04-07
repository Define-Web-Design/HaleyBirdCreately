
import { Router, Request, Response } from 'express';
import taskVerificationService from '../services/taskVerificationService';
import * as logger from '../utils/logger';

const router = Router();

// Get all tasks status
router.get('/tasks', (req: Request, res: Response) => {
  try {
    const status = taskVerificationService.getTasksStatus();
    res.json({ success: true, status });
  } catch (error) {
    logger.error('Error getting tasks status:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error getting tasks status' 
    });
  }
});

// Register a new task
router.post('/tasks', (req: Request, res: Response) => {
  try {
    const { taskId, name, category } = req.body;
    
    if (!taskId || !name || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'taskId, name, and category are required' 
      });
    }
    
    taskVerificationService.registerTask(taskId, name, category);
    
    res.json({ 
      success: true, 
      message: 'Task registered successfully' 
    });
  } catch (error) {
    logger.error('Error registering task:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error registering task' 
    });
  }
});

// Complete a task
router.post('/tasks/:taskId/complete', (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { details } = req.body;
    
    const success = taskVerificationService.completeTask(taskId, details);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Task completed successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
  } catch (error) {
    logger.error('Error completing task:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error completing task' 
    });
  }
});

// Mark a task as failed
router.post('/tasks/:taskId/fail', (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    const { details } = req.body;
    
    const success = taskVerificationService.failTask(taskId, details);
    
    if (success) {
      res.json({ 
        success: true, 
        message: 'Task marked as failed' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        message: 'Task not found' 
      });
    }
  } catch (error) {
    logger.error('Error marking task as failed:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error marking task as failed' 
    });
  }
});

// Verify a task
router.post('/tasks/:taskId/verify', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    const result = await taskVerificationService.verifyTask(taskId);
    
    res.json({ 
      success: result.success, 
      message: result.message,
      taskId: result.taskId,
      taskName: result.taskName,
      details: result.details
    });
  } catch (error) {
    logger.error('Error verifying task:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error verifying task' 
    });
  }
});

// Create a checkpoint
router.post('/checkpoint', async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Checkpoint name is required' 
      });
    }
    
    const result = await taskVerificationService.createCheckpoint(name, description);
    
    if (result.success) {
      res.json({ 
        success: true, 
        message: result.message,
        checkpoint: result.checkpoint
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: result.message 
      });
    }
  } catch (error) {
    logger.error('Error creating checkpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error creating checkpoint' 
    });
  }
});

// Check if checkpoint can be created
router.get('/checkpoint/check', (req: Request, res: Response) => {
  try {
    const canCreate = taskVerificationService.canCreateCheckpoint();
    
    res.json({ 
      success: true, 
      canCreateCheckpoint: canCreate
    });
  } catch (error) {
    logger.error('Error checking checkpoint status:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error checking checkpoint status' 
    });
  }
});

// Reset all tasks
router.post('/reset', (req: Request, res: Response) => {
  try {
    taskVerificationService.resetTasks();
    
    res.json({ 
      success: true, 
      message: 'All tasks have been reset' 
    });
  } catch (error) {
    logger.error('Error resetting tasks:', error);
    res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error resetting tasks' 
    });
  }
});

export default router;
