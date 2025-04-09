import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useTaskVerification } from '@/hooks/use-task-verification';
import { ChevronDown, ChevronUp, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'verified';
  category: 'content' | 'feature' | 'security' | 'system';
  subcategory?: string;
  priority?: 'low' | 'medium' | 'high';
  points: number;
  createdAt: string;
  completedAt?: string;
  verifiedAt?: string;
  progressPercentage?: number;
}

interface TaskVerificationResponse {
  success: boolean;
  status: {
    allTasksComplete: boolean;
    totalTasks: number;
    completedTasks: Array<{
      id: string;
      name: string;
      category: string;
      details?: string;
    }>;
    pendingTasks: Array<{
      id: string;
      name: string;
      category: string;
      details?: string;
    }>;
    failedTasks: Array<{
      id: string;
      name: string;
      category: string;
      details?: string;
    }>;
  };
}

export default function TaskVerificationDashboard() {
  const { toast } = useToast();
  const { 
    verifyTask, 
    updateTaskProgress, 
    updateTaskStatus, 
    refreshTasks, 
    webSocketConnected 
  } = useTaskVerification();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [progressValue, setProgressValue] = useState<number>(0);
  const [isProgressDialogOpen, setIsProgressDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: tasksResponse, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/task-verification/tasks'],
    enabled: true,
  });

  // Transform API response to expected format or provide empty array
  const tasks: Task[] = (tasksResponse?.success && tasksResponse?.status && 
      Array.isArray(tasksResponse.status.completedTasks)) 
    ? [
        ...(tasksResponse.status.completedTasks || []).map((task: any) => ({
          id: task.id,
          title: task.name,
          description: task.details || `${task.category} task`,
          status: 'completed',
          category: task.category,
          priority: 'medium',
          points: 10,
          createdAt: new Date().toISOString(),
          progressPercentage: 100
        })),
        ...(tasksResponse.status.pendingTasks || []).map((task: any) => ({
          id: task.id,
          title: task.name,
          description: task.details || `${task.category} task`,
          status: 'pending',
          category: task.category,
          priority: 'medium',
          points: 10,
          createdAt: new Date().toISOString(),
          progressPercentage: 0
        })),
        ...(tasksResponse.status.failedTasks || []).map((task: any) => ({
          id: task.id,
          title: task.name,
          description: task.details || `${task.category} task`,
          status: 'in-progress',
          category: task.category,
          priority: 'high',
          points: 10,
          createdAt: new Date().toISOString(),
          progressPercentage: 50
        }))
      ]
    : [];

  // Handle opening progress dialog for a task
  const openProgressDialog = (task: Task) => {
    setSelectedTask(task);
    setProgressValue(task.progressPercentage || 0);
    setIsProgressDialogOpen(true);
  };

  // Handle opening status change dialog for a task
  const openStatusDialog = (task: Task) => {
    setSelectedTask(task);
    setIsStatusDialogOpen(true);
  };

  // Handle submitting task progress update
  const handleProgressUpdate = async () => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      await updateTaskProgress(selectedTask.id, progressValue);
      toast({
        title: "Progress Updated",
        description: `Task progress updated to ${progressValue}%`,
        variant: "default"
      });
      
      // If progress is 100%, let user know task is marked as completed
      if (progressValue === 100 && selectedTask.status === 'in-progress') {
        toast({
          title: "Task Completed",
          description: "Task has been automatically marked as completed",
          variant: "default"
        });
      }
      
      await refreshTasks();
      setIsProgressDialogOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating task progress.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle submitting task status update
  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTask) return;
    
    setIsLoading(true);
    try {
      await updateTaskStatus(selectedTask.id, newStatus);
      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus}`,
        variant: "default"
      });
      await refreshTasks();
      setIsStatusDialogOpen(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating task status.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyTask = async (taskId: string) => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  // Filter tasks based on selected category and priority
  const filteredTasks = tasks.filter(task => {
    const matchesCategory = !selectedCategory || task.category === selectedCategory;
    const matchesPriority = !selectedPriority || task.priority === selectedPriority;
    return matchesCategory && matchesPriority;
  });

  // Calculate progress statistics
  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(task => task.status === 'completed' || task.status === 'verified').length;
  const verifiedTasks = filteredTasks.filter(task => task.status === 'verified').length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const verificationPercentage = completedTasks > 0 ? (verifiedTasks / completedTasks) * 100 : 0;

  // Get unique categories and priorities for filters
  const categories = Array.from(new Set(tasks.map(task => task.category)));
  const priorities = Array.from(new Set(tasks.filter(task => task.priority).map(task => task.priority as string)));

  // Group tasks by category for better organization
  const tasksByCategory = filteredTasks.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, Task[]>);
  
  // Further group tasks by subcategory within each category
  const tasksBySubcategory = {} as Record<string, Record<string, Task[]>>;
  
  Object.entries(tasksByCategory).forEach(([category, categoryTasks]) => {
    tasksBySubcategory[category] = categoryTasks.reduce((acc, task) => {
      const subcategory = task.subcategory || 'General';
      if (!acc[subcategory]) {
        acc[subcategory] = [];
      }
      acc[subcategory].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  });

  if (tasksLoading) {
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
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Task Verification</span>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 cursor-help">
                      <div className={`h-2 w-2 rounded-full ${webSocketConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-xs text-muted-foreground">
                        {webSocketConnected ? 'Live Updates' : 'Offline'}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">
                      {webSocketConnected 
                        ? 'Connected to real-time updates server. Task status changes will appear instantly without refreshing.' 
                        : 'Not connected to real-time updates server. Manual refresh required to see changes.'}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" size="sm" onClick={refreshTasks}>Refresh</Button>
            </div>
          </CardTitle>
          <CardDescription>Verify completed tasks to earn evolution points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 pb-4">
              <div className="w-full sm:w-auto">
                <label className="text-sm font-medium block mb-2">Category</label>
                <Select 
                  value={selectedCategory || ""} 
                  onValueChange={(value) => setSelectedCategory(value || null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="w-full sm:w-auto">
                <label className="text-sm font-medium block mb-2">Priority</label>
                <Select 
                  value={selectedPriority || ""} 
                  onValueChange={(value) => setSelectedPriority(value || null)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Priorities</SelectItem>
                    {priorities.map(priority => (
                      <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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

            {/* Tasks by Category and Subcategory */}
            <div className="space-y-6">
              {Object.entries(tasksBySubcategory).map(([category, subcategories]) => (
                <div key={category} className="space-y-4">
                  <h3 className="font-medium capitalize">{category} Tasks</h3>
                  
                  {Object.entries(subcategories).map(([subcategory, tasks]) => (
                    <div key={`${category}-${subcategory}`} className="space-y-3">
                      <h4 className="text-sm font-medium text-muted-foreground">{subcategory}</h4>
                      
                      {tasks.map(task => (
                        <div key={task.id} className="border rounded-md p-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm">{task.title}</h4>
                                {task.priority && (
                                  <Badge variant={
                                    task.priority === 'high' ? 'destructive' : 
                                    task.priority === 'medium' ? 'default' : 'outline'
                                  } className="text-xs">
                                    {task.priority}
                                  </Badge>
                                )}
                              </div>
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
                          
                          {/* Progress indicator for in-progress tasks */}
                          {task.status === 'in-progress' && (
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span>Progress</span>
                                <span>{task.progressPercentage || 0}%</span>
                              </div>
                              <Progress value={task.progressPercentage || 0} className="h-1" />
                              <div className="flex justify-end mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => openProgressDialog(task)}
                                >
                                  Update Progress
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          {/* Action buttons for all tasks */}
                          <div className="mt-3 flex items-center justify-between">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => openStatusDialog(task)}
                              className="text-xs"
                            >
                              Change Status
                            </Button>
                            
                            {task.status === 'completed' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button 
                                      variant="secondary" 
                                      size="sm"
                                      onClick={() => handleVerifyTask(task.id)}
                                      disabled={isLoading}
                                    >
                                      Verify ({task.points} points)
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="text-xs">Earn {task.points} evolution points by verifying this task</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            
                            {task.status === 'verified' && (
                              <span className="text-xs text-muted-foreground">
                                Verified on {task.verifiedAt ? new Date(task.verifiedAt).toLocaleDateString() : 'N/A'}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Task Progress Update Dialog */}
      <Dialog open={isProgressDialogOpen} onOpenChange={setIsProgressDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Task Progress</DialogTitle>
            <DialogDescription>
              {selectedTask?.title || 'Set the completion percentage for this task'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <span className="text-sm font-medium">
                Progress: {progressValue}%
              </span>
              <Slider
                value={[progressValue]}
                onValueChange={(values) => setProgressValue(values[0])}
                max={100}
                step={5}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {progressValue === 100 
                  ? "Setting to 100% will mark the task as completed." 
                  : "Adjust the slider to update task progress."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsProgressDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleProgressUpdate}
              disabled={isLoading}
            >
              {isLoading ? "Updating..." : "Update Progress"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Task Status Update Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Task Status</DialogTitle>
            <DialogDescription>
              Select a new status for "{selectedTask?.title || 'this task'}"
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant={selectedTask?.status === 'pending' ? 'default' : 'outline'} 
                onClick={() => handleStatusUpdate('pending')}
                className="justify-start"
                disabled={isLoading}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Pending
              </Button>
              <Button 
                variant={selectedTask?.status === 'in-progress' ? 'default' : 'outline'} 
                onClick={() => handleStatusUpdate('in-progress')}
                className="justify-start"
                disabled={isLoading}
              >
                <Clock className="mr-2 h-4 w-4" />
                In Progress
              </Button>
              <Button 
                variant={selectedTask?.status === 'completed' ? 'default' : 'outline'} 
                onClick={() => handleStatusUpdate('completed')}
                className="justify-start"
                disabled={isLoading}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Completed
              </Button>
              <Button 
                variant={selectedTask?.status === 'verified' ? 'default' : 'outline'} 
                onClick={() => handleStatusUpdate('verified')}
                className="justify-start"
                disabled={isLoading || selectedTask?.status !== 'completed'}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verified
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedTask?.status === 'pending' ? 'This task has not been started yet.' : 
              selectedTask?.status === 'in-progress' ? 'This task is currently being worked on.' :
              selectedTask?.status === 'completed' ? 'This task is ready for verification.' :
              'This task has been verified and points awarded.'}
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsStatusDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}