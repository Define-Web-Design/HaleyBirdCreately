import { useState } from 'react';
import CreativeSymbiosisSection from '@/components/dashboard/CreativeSymbiosis';
import AICapabilities from '@/components/dashboard/AICapabilities';
import TaskVerificationDashboard from '@/components/dashboard/TaskVerificationDashboard';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function CreativeSymbiosisPage() {
  const [activeTab, setActiveTab] = useState('symbiosis');
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: evolutionPoints } = useQuery({
    queryKey: ['/api/evolution-points'],
    enabled: true,
  });
  
  const refreshData = async () => {
    try {
      toast({
        title: "Refreshing Data",
        description: "Syncing your latest creative symbiosis data...",
        variant: "default",
      });
      
      await queryClient.invalidateQueries({ queryKey: ['/api/evolution-points'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/user-capabilities'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/creative-history/monthly'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/task-verification/tasks'] });
      
      toast({
        title: "Data Refreshed",
        description: "Your creative symbiosis data has been updated.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "There was an error refreshing your data.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Creative Symbiosis</h1>
          <p className="text-muted-foreground mt-2">
            Evolve your creative abilities through AI collaboration
            {evolutionPoints?.currentTier && (
              <span className="ml-2">• Current Tier: <span className="font-medium">{evolutionPoints.currentTier}</span></span>
            )}
          </p>
        </div>
        <Button variant="outline" onClick={refreshData}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" className="w-4 h-4 mr-2" strokeWidth="2">
            <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.798 0 3.5-.38 5-1.046M12 3c1.798 0 3.5.38 5 1.046"/>
          </svg>
          Refresh Data
        </Button>
      </div>
      
      <Tabs defaultValue="symbiosis" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full max-w-md mx-auto grid grid-cols-3">
          <TabsTrigger value="symbiosis">Symbiosis Framework</TabsTrigger>
          <TabsTrigger value="capabilities">AI Capabilities</TabsTrigger>
          <TabsTrigger value="tasks">Task Verification</TabsTrigger>
        </TabsList>
        
        <TabsContent value="symbiosis" className="mt-6">
          <CreativeSymbiosisSection />
        </TabsContent>
        
        <TabsContent value="capabilities" className="mt-6">
          <AICapabilities />
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-6">
          <TaskVerificationDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}