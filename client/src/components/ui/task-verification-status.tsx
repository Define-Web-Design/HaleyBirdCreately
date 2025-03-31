
import React, { useState, useEffect } from "react";
import { Button } from "./button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";
import { Progress } from "./progress";
import { Badge } from "./badge";
import { TaskVerification, type TaskVerificationResult } from "../../utils/task-verification";
import { CheckpointManager } from "../../utils/checkpoint-manager";
import { toast } from "./use-toast";

export function TaskVerificationStatus() {
  const [status, setStatus] = useState<TaskVerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkpointName, setCheckpointName] = useState("");

  useEffect(() => {
    // Initial load of verification status
    setStatus(TaskVerification.getVerificationStatus());
  }, []);

  const refreshStatus = () => {
    setStatus(TaskVerification.getVerificationStatus());
  };

  const runVerification = async () => {
    setLoading(true);
    try {
      const result = await TaskVerification.verifyAllTasks();
      setStatus(result);
      
      if (result.completed) {
        toast({
          title: "Verification Complete",
          description: "All tasks have been successfully verified.",
          variant: "success",
        });
      } else {
        toast({
          title: "Verification Issues",
          description: `${result.blockers.length} tasks need attention.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Verification Error",
        description: error.message || "An error occurred during verification.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewCheckpoint = async () => {
    if (!checkpointName.trim()) {
      toast({
        title: "Checkpoint Error",
        description: "Please provide a name for the checkpoint.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await CheckpointManager.createCheckpoint(checkpointName);
      
      if (result.success) {
        toast({
          title: "Checkpoint Created",
          description: result.message,
          variant: "success",
        });
        setCheckpointName("");
      } else {
        toast({
          title: "Cannot Create Checkpoint",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Checkpoint Error",
        description: error.message || "An error occurred creating the checkpoint.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No tasks registered for verification.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={refreshStatus}>Refresh Status</Button>
        </CardFooter>
      </Card>
    );
  }

  const completedTasks = status.taskResults.filter(t => t.status === 'completed');
  const completionPercentage = 
    status.taskResults.length > 0 
      ? Math.round((completedTasks.length / status.taskResults.length) * 100) 
      : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Task Verification Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Verification Progress</span>
            <span>{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} />
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Summary</h3>
          <p>{status.summary}</p>
          
          {status.blockers.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium text-destructive">Blocking Issues</h4>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                {status.blockers.map((blocker, i) => (
                  <li key={i} className="text-sm text-destructive">{blocker}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tasks</h3>
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
        </div>

        {status.completed && (
          <div className="space-y-2 pt-2 border-t">
            <h3 className="text-sm font-medium">Create Checkpoint</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={checkpointName}
                onChange={(e) => setCheckpointName(e.target.value)}
                placeholder="Checkpoint name"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button onClick={createNewCheckpoint} disabled={loading || !checkpointName.trim()}>
                Save
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={refreshStatus} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={runVerification} disabled={loading}>
          {loading ? "Verifying..." : "Verify All Tasks"}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default TaskVerificationStatus;
