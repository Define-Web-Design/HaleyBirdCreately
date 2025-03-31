
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
