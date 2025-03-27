import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface EvolutionPoints {
  userId: number;
  totalPoints: number;
  currentTier: string;
  nextMilestone: number;
  creativeEnergyPoints: number;
  lastPointsUpdate: string;
}

interface UserCapability {
  id: number;
  userId: number;
  capabilityName: string;
  isUnlocked: boolean;
  level: number;
  unlockedAt?: string;
  expiresAt?: string;
}

export function EvolutionProgressCard() {
  const queryClient = useQueryClient();
  
  const { data: evolutionPoints, isLoading } = useQuery<EvolutionPoints>({
    queryKey: ['/api/evolution-points'],
    enabled: true,
  });
  
  const handleRefreshEnergy = async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ['/api/evolution-points'] });
      toast({
        title: "Energy Refreshed",
        description: "Your creative energy has been refreshed.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Energy Refresh Failed",
        description: "There was an error refreshing your creative energy.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="skeleton h-7 w-48"></CardTitle>
          <CardDescription className="skeleton h-5 w-64"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="skeleton h-20 w-full"></div>
        </CardContent>
      </Card>
    );
  }

  // If no data, show a message
  if (!evolutionPoints) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Creative Evolution</CardTitle>
          <CardDescription>Your creative journey starts here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Start creating content to build your evolution points!</p>
        </CardContent>
      </Card>
    );
  }

  const totalPoints = evolutionPoints.totalPoints || 0;
  const nextMilestone = evolutionPoints.nextMilestone || 1; // Avoid division by zero
  const progressPercentage = (totalPoints / nextMilestone) * 100;
  
  const lastUpdate = evolutionPoints.lastPointsUpdate ? new Date(evolutionPoints.lastPointsUpdate) : new Date();
  const formattedDate = lastUpdate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Creative Evolution</CardTitle>
            <CardDescription>Your creative journey with AI</CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary">
            {evolutionPoints.currentTier || 'Beginner'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Evolution Points</span>
            <span className="font-medium">{totalPoints} / {nextMilestone}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {Math.ceil(nextMilestone - totalPoints)} points until next tier
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">Creative Energy</h4>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">{evolutionPoints.creativeEnergyPoints || 0}</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="ml-2 text-xs text-muted-foreground cursor-help">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-[200px] text-xs">
                      Creative Energy Points regenerate over time and are used to power AI features. Last updated: {formattedDate}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={handleRefreshEnergy}>Refresh Energy</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CreativeHistoryCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Creative History</CardTitle>
        <CardDescription>Your journey of growth</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm flex-1">First content created</span>
            <span className="text-xs text-muted-foreground">Mar 15</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm flex-1">Reached Novice tier</span>
            <span className="text-xs text-muted-foreground">Mar 18</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm flex-1">Unlocked Advanced Captions</span>
            <span className="text-xs text-muted-foreground">Mar 22</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm" className="w-full">View Full History</Button>
      </CardFooter>
    </Card>
  );
}

export function CapabilitiesCard() {
  const queryClient = useQueryClient();
  
  const { data: capabilities = [] } = useQuery<UserCapability[]>({
    queryKey: ['/api/user-capabilities'],
    enabled: true,
  });
  
  const { data: evolutionPoints } = useQuery<EvolutionPoints>({
    queryKey: ['/api/evolution-points'],
    enabled: true,
  });
  
  const handleUpgradeCapability = async () => {
    // Find the first unlocked capability to upgrade
    const upgradeableCapability = capabilities.find((cap: UserCapability) => cap.isUnlocked === true);
    
    if (!upgradeableCapability) {
      toast({
        title: "No capability to upgrade",
        description: "You need to unlock a capability first.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if user has enough creative energy
    if (!evolutionPoints || evolutionPoints.creativeEnergyPoints < 20) {
      toast({
        title: "Not enough creative energy",
        description: "You need at least 20 creative energy points to upgrade a capability.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await fetch(`/api/user-capabilities/${upgradeableCapability.capabilityName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Refresh capabilities and evolution points
      await queryClient.invalidateQueries({ queryKey: ['/api/user-capabilities'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/evolution-points'] });
      
      toast({
        title: "Capability Upgraded",
        description: `${upgradeableCapability.capabilityName} has been upgraded to level ${upgradeableCapability.level + 1}.`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Upgrade Failed",
        description: "There was an error upgrading your capability.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Capabilities</CardTitle>
        <CardDescription>Unlock more as you create</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {capabilities.length > 0 ? (
            capabilities.map((capability: UserCapability) => (
              <div key={capability.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">{capability.capabilityName}</h4>
                  <Badge 
                    variant={capability.isUnlocked === true ? "default" : "outline"}
                    className={capability.isUnlocked === true ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : ""}
                  >
                    {capability.isUnlocked === true && capability.level ? `Level ${capability.level}` : 'Locked'}
                  </Badge>
                </div>
                {capability.isUnlocked === true && capability.level && (
                  <Progress value={capability.level * 20} className="h-1" />
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-muted-foreground">No capabilities unlocked yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create content to unlock AI capabilities</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full" onClick={handleUpgradeCapability}>
          Upgrade Capabilities
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CreativeSymbiosisSection() {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-6 border border-primary/10">
        <h2 className="text-2xl font-bold mb-2">Creative Symbiosis Framework</h2>
        <p className="text-muted-foreground mb-4">
          A unique approach where you and AI evolve together through creative collaboration.
          As you create more content, you unlock enhanced AI capabilities tailored to your creative style.
        </p>
        <div className="flex space-x-4">
          <Button size="sm" variant="default">Learn How It Works</Button>
          <Button size="sm" variant="outline">View Benefits</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <EvolutionProgressCard />
        <CapabilitiesCard />
        <CreativeHistoryCard />
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h3 className="text-lg font-medium mb-4">Your Creative Journey</h3>
        <Separator className="my-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2 text-center">
            <span className="text-3xl font-bold text-primary">0</span>
            <p className="text-sm text-muted-foreground">Content Created</p>
          </div>
          <div className="space-y-2 text-center">
            <span className="text-3xl font-bold text-primary">0</span>
            <p className="text-sm text-muted-foreground">AI Collaborations</p>
          </div>
          <div className="space-y-2 text-center">
            <span className="text-3xl font-bold text-primary">0</span>
            <p className="text-sm text-muted-foreground">Capabilities Unlocked</p>
          </div>
          <div className="space-y-2 text-center">
            <span className="text-3xl font-bold text-primary">0</span>
            <p className="text-sm text-muted-foreground">Days Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}