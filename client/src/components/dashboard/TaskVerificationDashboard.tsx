
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { useTaskVerificationContext } from '../../context/task-verification-context';
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from '../ui/toaster';

export function TaskVerificationDashboard() {
  const {
    status,
    loading,
    verifyAllTasks,
    canCreateCheckpoint,
    createCheckpoint,
    checkpoints,
    resetVerification
  } = useTaskVerificationContext();
  
  const [checkpointName, setCheckpointName] = useState('');
  const [activeTab, setActiveTab] = useState('tasks');
  
  const handleVerify = async () => {
    try {
      await verifyAllTasks();
      toast({
        title: 'Verification Complete',
        description: 'All tasks have been verified',
      });
    } catch (error) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'An error occurred during verification',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateCheckpoint = async () => {
    if (!checkpointName.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a checkpoint name',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const result = await createCheckpoint(checkpointName);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Checkpoint created successfully',
        });
        setCheckpointName('');
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred creating the checkpoint',
        variant: 'destructive',
      });
    }
  };
  
  const handleReset = () => {
    resetVerification();
    toast({
      title: 'Reset Complete',
      description: 'Task verification has been reset',
    });
  };
  
  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No tasks have been registered for verification.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={verifyAllTasks} disabled={loading}>
            Run Verification
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  const completedTasks = status.taskResults.filter(task => task.status === 'completed');
  const completionPercentage = status.taskResults.length > 0
    ? Math.round((completedTasks.length / status.taskResults.length) * 100)
    : 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Task Verification Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Verification Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} />
        </div>
        
        {status.blockers.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Verification Blocked</AlertTitle>
            <AlertDescription>
              There are {status.blockers.length} issues preventing checkpoint creation
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tasks" className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
              {status.taskResults.map((task) => (
                <div key={task.taskId} className="flex items-center justify-between py-1 border-b last:border-0">
                  <div>
                    <span className="text-sm font-medium">{task.name}</span>
                    <p className="text-xs text-muted-foreground">{task.details}</p>
                  </div>
                  <Badge 
                    variant={
                      task.status === 'completed' ? 'success' : 
                      task.status === 'failed' ? 'destructive' : 
                      'outline'
                    }
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </div>
            
            {canCreateCheckpoint() && (
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-medium">Create Checkpoint</h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={checkpointName}
                    onChange={(e) => setCheckpointName(e.target.value)}
                    placeholder="Checkpoint name"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Button onClick={handleCreateCheckpoint} disabled={loading || !checkpointName.trim()}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="checkpoints">
            {checkpoints.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No checkpoints created yet.</p>
            ) : (
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
                {checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="p-2 border rounded-md">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{checkpoint.description}</h3>
                      <Badge variant="outline">
                        {new Date(checkpoint.timestamp).toLocaleString()}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {checkpoint.verificationStatus.completedTaskCount} tasks verified
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleReset}>
          Reset Verification
        </Button>
        <Button onClick={handleVerify} disabled={loading}>
          {loading ? "Verifying..." : "Verify All Tasks"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default TaskVerificationDashboard;
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useTaskVerification } from '@/hooks/use-task-verification';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  category: 'content' | 'feature' | 'security' | 'system';
  points: number;
  createdAt: string;
  completedAt?: string;
}

export default function TaskVerificationDashboard() {
  const { toast } = useToast();
  const { verifyTask, refreshTasks } = useTaskVerification();
  
  const { data: tasks = [], isLoading } = useQuery<Task[]>({
    queryKey: ['/api/task-verification/tasks'],
    enabled: true,
  });

  const handleVerifyTask = async (taskId: string) => {
    try {
      await verifyTask(taskId);
      toast({
        title: "Task Verified",
        description: "The task has been successfully verified.",
        variant: "default"
      });
      await refreshTasks();
    } catch (error) {
      toast({
        title: "Verification Failed",
        description: "There was an error verifying the task.",
        variant: "destructive"
      });
    }
  };

  // Calculate progress statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed' || task.status === 'verified').length;
  const verifiedTasks = tasks.filter(task => task.status === 'verified').length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const verificationPercentage = completedTasks > 0 ? (verifiedTasks / completedTasks) * 100 : 0;

  // Group tasks by category for better organization
  const tasksByCategory = tasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Verification</CardTitle>
          <CardDescription>Loading tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted/50 rounded-md animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // No tasks case
  if (totalTasks === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Verification</CardTitle>
          <CardDescription>No tasks available for verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks have been created yet. Tasks will appear here when they are created.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Task Verification</span>
          <Button variant="outline" size="sm" onClick={refreshTasks}>Refresh</Button>
        </CardTitle>
        <CardDescription>Verify completed tasks to earn evolution points</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span className="font-medium">{completedTasks} / {totalTasks} Tasks</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            
            <div className="flex justify-between text-sm mt-4">
              <span>Verification Progress</span>
              <span className="font-medium">{verifiedTasks} / {completedTasks} Tasks</span>
            </div>
            <Progress value={verificationPercentage} className="h-2" />
          </div>

          {/* Tasks by Category */}
          <div className="space-y-6">
            {Object.entries(tasksByCategory).map(([category, categoryTasks]) => (
              <div key={category}>
                <h3 className="font-medium text-sm mb-3 capitalize">{category} Tasks</h3>
                <div className="space-y-3">
                  {categoryTasks.map(task => (
                    <div key={task.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{task.description}</p>
                        </div>
                        <Badge variant={
                          task.status === 'verified' ? 'default' :
                          task.status === 'completed' ? 'outline' :
                          task.status === 'in-progress' ? 'secondary' : 'destructive'
                        }>
                          {task.status}
                        </Badge>
                      </div>
                      
                      {task.status === 'completed' && (
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {task.completedAt ? `Completed: ${new Date(task.completedAt).toLocaleDateString()}` : 'Ready for verification'}
                          </span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  onClick={() => handleVerifyTask(task.id)}
                                >
                                  Verify ({task.points} points)
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Earn {task.points} evolution points by verifying this task</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                      
                      {task.status === 'verified' && (
                        <div className="mt-3 text-xs text-muted-foreground">
                          Verified and awarded {task.points} evolution points
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
