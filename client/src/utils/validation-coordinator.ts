
/**
 * Validation Coordinator
 * 
 * This utility ensures that all tasks in a workflow are properly completed and verified
 * before allowing checkpoints or progress commits to be created.
 */

import { runFullSystemValidation, ValidationReport, displayFullValidationResults } from './consolidated-validation';
import { validateImplementation } from './validate-implementation';
import { verifyPageLinks, runAccessibilityAudit } from './navigation-tester';
import { validateApiEndpoints } from './api-validator';

/**
 * Status for a validation task
 */
interface TaskValidationStatus {
  taskId: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  details?: string;
}

/**
 * Workflow validation session
 */
interface ValidationSession {
  id: string;
  description: string;
  tasks: TaskValidationStatus[];
  overallStatus: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  canCreateCheckpoint: boolean;
}

// Store active validation sessions
const activeSessions: ValidationSession[] = [];

/**
 * Create a new validation session for a workflow
 */
export function createValidationSession(description: string): ValidationSession {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const session: ValidationSession = {
    id: sessionId,
    description,
    tasks: [],
    overallStatus: 'pending',
    createdAt: new Date(),
    canCreateCheckpoint: false
  };
  
  activeSessions.push(session);
  return session;
}

/**
 * Add validation tasks to a session
 */
export function addValidationTasks(
  sessionId: string, 
  tasks: { id: string, name: string }[]
): void {
  const session = activeSessions.find(s => s.id === sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }
  
  tasks.forEach(task => {
    session.tasks.push({
      taskId: task.id,
      name: task.name,
      status: 'pending'
    });
  });
}

/**
 * Run a comprehensive validation of all tasks in a session
 */
export async function runValidationSession(sessionId: string): Promise<ValidationSession> {
  const session = activeSessions.find(s => s.id === sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }
  
  try {
    session.overallStatus = 'running';
    console.log(`Starting validation session: ${session.description}`);
    console.log('='.repeat(80));
    
    // Run each task in sequence
    for (const task of session.tasks) {
      task.status = 'running';
      task.startTime = new Date();
      console.log(`Running task: ${task.name}`);
      
      try {
        switch (task.taskId) {
          case 'full-validation':
            task.result = await runFullSystemValidation();
            if (!task.result.overallSuccess) {
              throw new Error('Full system validation failed');
            }
            break;
            
          case 'implementation':
            task.result = await validateImplementation();
            if (!task.result.success) {
              throw new Error('Implementation validation failed');
            }
            break;
            
          case 'links':
            task.result = await verifyPageLinks();
            if (task.result.potentialBrokenLinks.length > 0) {
              throw new Error(`Found ${task.result.potentialBrokenLinks.length} broken links`);
            }
            break;
            
          case 'accessibility':
            task.result = await runAccessibilityAudit();
            if (task.result.score < 80) {
              throw new Error(`Accessibility score is too low: ${task.result.score}`);
            }
            break;
            
          case 'api':
            task.result = await validateApiEndpoints();
            if (!task.result.success) {
              throw new Error('API validation failed');
            }
            break;
            
          default:
            throw new Error(`Unknown task type: ${task.taskId}`);
        }
        
        task.status = 'completed';
        task.endTime = new Date();
        console.log(`Task completed: ${task.name}`);
      } catch (error) {
        task.status = 'failed';
        task.endTime = new Date();
        task.details = error.message || 'Unknown error';
        console.error(`Task failed: ${task.name}`, error);
      }
    }
    
    // Determine overall session status
    const hasFailedTasks = session.tasks.some(task => task.status === 'failed');
    session.overallStatus = hasFailedTasks ? 'failed' : 'completed';
    session.completedAt = new Date();
    session.canCreateCheckpoint = !hasFailedTasks;
    
    // Display final status
    console.log('='.repeat(80));
    console.log(`Validation session completed: ${session.description}`);
    console.log(`Status: ${session.overallStatus.toUpperCase()}`);
    console.log(`Tasks: ${session.tasks.filter(t => t.status === 'completed').length} completed, ${session.tasks.filter(t => t.status === 'failed').length} failed`);
    console.log(`Can create checkpoint: ${session.canCreateCheckpoint ? 'YES' : 'NO'}`);
    console.log('='.repeat(80));
    
    return session;
  } catch (error) {
    session.overallStatus = 'failed';
    console.error('Validation session failed:', error);
    return session;
  }
}

/**
 * Check if a checkpoint can be created for the given session
 */
export function canCreateCheckpoint(sessionId: string): boolean {
  const session = activeSessions.find(s => s.id === sessionId);
  if (!session) {
    return false;
  }
  
  return session.canCreateCheckpoint;
}

/**
 * Get a validation session by ID
 */
export function getValidationSession(sessionId: string): ValidationSession | undefined {
  return activeSessions.find(s => s.id === sessionId);
}

/**
 * Get all active validation sessions
 */
export function getAllValidationSessions(): ValidationSession[] {
  return [...activeSessions];
}

/**
 * Run a thorough workflow validation before creating a checkpoint
 * Returns true if it's safe to create a checkpoint, false otherwise
 */
export async function validateBeforeCheckpoint(description: string): Promise<boolean> {
  console.log('Performing comprehensive validation before creating checkpoint');
  
  // Create a validation session
  const session = createValidationSession(`Pre-checkpoint: ${description}`);
  
  // Add all validation tasks
  addValidationTasks(session.id, [
    { id: 'full-validation', name: 'Full System Validation' },
    { id: 'implementation', name: 'Implementation Validation' },
    { id: 'links', name: 'Link Validation' },
    { id: 'accessibility', name: 'Accessibility Audit' },
    { id: 'api', name: 'API Endpoints Validation' }
  ]);
  
  // Run the validation
  await runValidationSession(session.id);
  
  // Check if checkpoint can be created
  return canCreateCheckpoint(session.id);
}

/**
 * Generate a detailed report for a validation session
 */
export function generateValidationReport(sessionId: string): string {
  const session = getValidationSession(sessionId);
  if (!session) {
    return 'Validation session not found';
  }
  
  let report = `# Validation Session Report: ${session.description}\n\n`;
  report += `- Status: ${session.overallStatus.toUpperCase()}\n`;
  report += `- Started: ${session.createdAt.toLocaleString()}\n`;
  
  if (session.completedAt) {
    report += `- Completed: ${session.completedAt.toLocaleString()}\n`;
    const duration = (session.completedAt.getTime() - session.createdAt.getTime()) / 1000;
    report += `- Duration: ${duration.toFixed(2)} seconds\n`;
  }
  
  report += `- Can create checkpoint: ${session.canCreateCheckpoint ? 'YES' : 'NO'}\n\n`;
  
  report += `## Tasks\n\n`;
  
  session.tasks.forEach(task => {
    report += `### ${task.name}\n`;
    report += `- Status: ${task.status.toUpperCase()}\n`;
    
    if (task.startTime) {
      report += `- Started: ${task.startTime.toLocaleString()}\n`;
    }
    
    if (task.endTime) {
      report += `- Completed: ${task.endTime.toLocaleString()}\n`;
      
      if (task.startTime) {
        const duration = (task.endTime.getTime() - task.startTime.getTime()) / 1000;
        report += `- Duration: ${duration.toFixed(2)} seconds\n`;
      }
    }
    
    if (task.details) {
      report += `- Details: ${task.details}\n`;
    }
    
    if (task.result) {
      report += `- Result: ${JSON.stringify(task.result, null, 2)}\n`;
    }
    
    report += '\n';
  });
  
  return report;
}
