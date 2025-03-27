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
  
  // Determine tier-specific styles and maximum energy
  const getTierStyles = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'expert':
        return {
          color: 'text-purple-500',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/50',
          gradient: 'from-purple-400 to-purple-600',
          energyCap: 200
        };
      case 'advanced':
        return {
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/50',
          gradient: 'from-blue-400 to-blue-600',
          energyCap: 150
        };
      case 'established':
        return {
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/50',
          gradient: 'from-green-400 to-green-600',
          energyCap: 125
        };
      case 'growing':
        return {
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/50',
          gradient: 'from-amber-400 to-amber-600',
          energyCap: 110
        };
      default:
        return {
          color: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary/50',
          gradient: 'from-primary/70 to-primary',
          energyCap: 100
        };
    }
  };
  
  const tierStyles = getTierStyles(evolutionPoints.currentTier || 'starter');
  const energyPercentage = (evolutionPoints.creativeEnergyPoints / tierStyles.energyCap) * 100;
  
  // Create milestone markers (evenly spaced)
  const milestones = [
    { point: nextMilestone * 0.2, label: Math.floor(nextMilestone * 0.2).toString() },
    { point: nextMilestone * 0.4, label: Math.floor(nextMilestone * 0.4).toString() },
    { point: nextMilestone * 0.6, label: Math.floor(nextMilestone * 0.6).toString() },
    { point: nextMilestone * 0.8, label: Math.floor(nextMilestone * 0.8).toString() },
    { point: nextMilestone, label: nextMilestone.toString() }
  ];

  return (
    <Card className="col-span-2 overflow-hidden">
      {/* Add top border with gradient based on tier */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${tierStyles.gradient}`}></div>
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Creative Evolution</CardTitle>
            <CardDescription>Your creative journey with AI</CardDescription>
          </div>
          <Badge variant="outline" className={`${tierStyles.bg} ${tierStyles.color} ${tierStyles.border}`}>
            {evolutionPoints.currentTier || 'Starter'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Total Evolution Points</span>
            <span className="font-medium">{totalPoints} / {nextMilestone}</span>
          </div>
          
          {/* Progress bar with milestone markers */}
          <div className="relative pt-1 pb-6">
            <Progress value={progressPercentage} className="h-2.5 rounded-full" />
            
            {/* Add milestone markers */}
            {milestones.map((milestone, i) => {
              const position = (milestone.point / nextMilestone) * 100;
              const isReached = totalPoints >= milestone.point;
              return (
                <div 
                  key={i} 
                  className="absolute bottom-0 transform -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  <div className={`w-1 h-3 ${isReached ? tierStyles.bg : 'bg-muted/50'} mb-1 mx-auto rounded-full`}></div>
                  <span className={`text-[10px] ${isReached ? tierStyles.color : 'text-muted-foreground'}`}>
                    {milestone.label}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {Math.ceil(nextMilestone - totalPoints)} points until next tier
            </p>
            
            {/* Add a celebratory element when close to next milestone */}
            {progressPercentage > 80 && (
              <p className="text-xs font-medium animate-pulse flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                  stroke="currentColor" className={`w-3.5 h-3.5 mr-1 ${tierStyles.color}`} strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
                Almost to next tier!
              </p>
            )}
          </div>
        </div>

        {/* Creative Energy Section with improved UI */}
        <div className="bg-card rounded-lg border p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="space-y-1">
              <h4 className="text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  className="w-4 h-4 mr-1.5 text-yellow-500" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Creative Energy
              </h4>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary">{evolutionPoints.creativeEnergyPoints || 0}</span>
                <span className="text-sm text-muted-foreground ml-1">/ {tierStyles.energyCap}</span>
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
                      <div className="w-[220px] text-xs space-y-1">
                        <p>
                          Creative Energy Points regenerate over time (5 points/hour) and are used to power AI features.
                        </p>
                        <p>
                          Your maximum energy capacity increases with each tier level.
                        </p>
                        <p className="text-muted-foreground">
                          Last updated: {formattedDate}
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={handleRefreshEnergy} className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" className="w-4 h-4 mr-1.5" strokeWidth="2">
                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.798 0 3.5-.38 5-1.046M12 3c1.798 0 3.5.38 5 1.046"/>
              </svg>
              Refresh Energy
            </Button>
          </div>
          
          {/* Energy progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>0</span>
              <span>{tierStyles.energyCap}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500"
                style={{ width: `${energyPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground">
              Energy regenerates at 5 points per hour (maximum: {tierStyles.energyCap})
            </p>
          </div>
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