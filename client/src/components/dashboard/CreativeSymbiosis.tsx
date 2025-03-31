import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { verifyContentIntegrity } from '@/lib/security-verification';
import TaskVerificationDashboard from './TaskVerificationDashboard'; // Import added

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

interface CardProps {
  className?: string;
}

export function EvolutionProgressCard({ className }: CardProps) {
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
      <Card className={`col-span-2 ${className}`}>
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
    <Card className={`col-span-2 overflow-hidden ${className}`}>
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

export function CreativeHistoryCard({ className }: CardProps) {
  const { data: creativeHistory, isLoading } = useQuery({
    queryKey: ['/api/creative-history/monthly'],
    enabled: true,
  });

  // Mock milestones - in a real implementation, these would come from the API
  const milestones = [
    { 
      id: 1, 
      date: '2025-03-15', 
      title: 'First content created',
      description: 'You began your creative journey',
      category: 'content',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
      )
    },
    { 
      id: 2, 
      date: '2025-03-18', 
      title: 'Reached Growing tier',
      description: 'Unlocked more creative possibilities',
      category: 'tier',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2">
          <path d="M12 20v-6M6 20V10M18 20V4"/>
        </svg>
      )
    },
    { 
      id: 3, 
      date: '2025-03-22', 
      title: 'Unlocked Caption Generation',
      description: 'First AI capability unlocked',
      category: 'capability',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      )
    },
    { 
      id: 4, 
      date: '2025-03-25', 
      title: 'Created first mood board',
      description: 'Started organizing visual inspirations',
      category: 'content',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" className="w-3.5 h-3.5" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      )
    }
  ];

  // Get appropriate color based on milestone category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'content':
        return 'bg-green-500 text-green-500';
      case 'tier':
        return 'bg-blue-500 text-blue-500';
      case 'capability':
        return 'bg-purple-500 text-purple-500';
      case 'achievement':
        return 'bg-amber-500 text-amber-500';
      default:
        return 'bg-gray-500 text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="skeleton h-7 w-40"></CardTitle>
          <CardDescription className="skeleton h-5 w-56"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center">
                <div className="skeleton w-2 h-2 rounded-full mr-2"></div>
                <div className="skeleton h-5 w-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="h-1.5 w-full bg-gradient-to-r from-green-400 to-emerald-600"></div>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Creative History</CardTitle>
            <CardDescription>Your journey of growth</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
            <Link href="/analytics">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" className="w-4 h-4 mr-1" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              Details
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Timeline visualization */}
        <div className="relative pl-5 before:absolute before:left-2 before:top-2 before:bottom-0 before:w-0.5 before:bg-border">
          {milestones.map((milestone, index) => {
            const colorClass = getCategoryColor(milestone.category);
            const date = formatDate(milestone.date);

            return (
              <div key={milestone.id} className={`relative mb-6 ${index === milestones.length - 1 ? 'pb-0' : 'pb-2'}`}>
                {/* Timeline dot */}
                <div className={`absolute -left-3 p-1.5 rounded-full border-2 ${colorClass.split(' ')[0]} border-background`}>
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full ${colorClass.split(' ')[0]}/25`}>
                    <span className={`${colorClass.split(' ')[1]} flex items-center justify-center`}>
                      {milestone.icon}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="bg-card rounded-lg p-3 border">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="text-sm font-medium">{milestone.title}</h4>
                    <span className="text-xs text-muted-foreground">{date}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 px-6 py-3">
        <div className="w-full flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Journey started Mar 15, 2025</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" className="w-4 h-4" strokeWidth="2">
                    <path d="M12 18.5a.5.5 0 0 1-.5-.5.5.5 0 0 1 .5-.5.5.5 0 0 1 .5.5.5.5 0 0 1-.5.5Z"/>
                    <path d="M12 13v-2"/>
                    <path d="m9 3 3-3 3 3"/>
                    <path d="M3 3h18v18H3z"/>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="w-[200px] text-xs">
                  Your creative journey is tracked automatically as you create content 
                  and interact with the platform. Milestones are captured to show your growth over time.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardFooter>
    </Card>
  );
}

export function CapabilitiesCard({ className }: CardProps) {
  const queryClient = useQueryClient();

  const { data: capabilities = [] } = useQuery<UserCapability[]>({
    queryKey: ['/api/user-capabilities'],
    enabled: true,
  });

  const { data: evolutionPoints } = useQuery<EvolutionPoints>({
    queryKey: ['/api/evolution-points'],
    enabled: true,
  });

  // Get capability details - provides information about what each level unlocks
  const getCapabilityDetails = (name: string, level: number) => {
    const details: Record<string, Record<number, string>> = {
      'Caption Generation': {
        1: 'Basic platform-optimized captions',
        2: 'Tone and style customization',
        3: 'Multi-platform optimization',
        4: 'Hashtag strategy integration',
        5: 'Viral potential analysis'
      },
      'Content Analysis': {
        1: 'Basic engagement prediction',
        2: 'Audience match scoring',
        3: 'Content improvement suggestions',
        4: 'Competitive analysis',
        5: 'Trend alignment scoring'
      },
      'Visual Enhancement': {
        1: 'Basic image adjustments',
        2: 'Style recommendations',
        3: 'Layout optimization',
        4: 'Visual storytelling enhancement',
        5: 'Brand aesthetic alignment'
      },
      'Audience Analysis': {
        1: 'Basic demographic insights',
        2: 'Engagement pattern detection',
        3: 'Audience growth recommendations',
        4: 'Competitor audience comparison',
        5: 'Predictive audience trends'
      },
      'AI Style Training': {
        1: 'Pattern recognition in content',
        2: 'Style preference learning',
        3: 'Personalized recommendations',
        4: 'Cross-platform style adaptation',
        5: 'Custom AI voice and style' 
      }
    };

    // Default description if capability not found
    return details[name]?.[level] || `Enhanced ${name} features`;
  };

  // Show next level preview
  const getNextLevelPreview = (capability: UserCapability) => {
    if (!capability.isUnlocked || !capability.level) return null;

    // Max level is 5
    if (capability.level >= 5) return null;

    return getCapabilityDetails(capability.capabilityName, capability.level + 1);
  };

  const handleUpgradeCapability = async () => {
    // Find the first unlocked capability to upgrade
    const upgradeableCapability = capabilities.find((cap: UserCapability) => cap.isUnlocked === true && cap.level && cap.level < 5);

    if (!upgradeableCapability) {
      toast({
        title: "No capability to upgrade",
        description: "You either need to unlock a capability first or all capabilities are at maximum level.",
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

      // Get the new capability level
      const newLevel = (upgradeableCapability.level || 0) + 1;
      const newFeature = getCapabilityDetails(upgradeableCapability.capabilityName, newLevel);

      toast({
        title: "Capability Upgraded",
        description: `${upgradeableCapability.capabilityName} has been upgraded to level ${newLevel}. New feature: ${newFeature}`,
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
    <Card className={`overflow-hidden ${className}`}>
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-violet-500"></div>
      <CardHeader>
        <CardTitle>AI Capabilities</CardTitle>
        <CardDescription>Unlock powerful AI features as you create</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {capabilities.length > 0 ? (
            capabilities.map((capability: UserCapability) => {
              const isUnlocked = capability.isUnlocked === true;
              const level = capability.level || 0;
              const nextLevelPreview = getNextLevelPreview(capability);

              // Get color scheme based on capability type
              const getColorScheme = (name: string) => {
                if (name.includes('Caption')) return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/30' };
                if (name.includes('Analysis')) return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/30' };
                if (name.includes('Visual')) return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' };
                if (name.includes('Audience')) return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' };
                if (name.includes('Style')) return { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500/30' };
                return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/30' };
              };

              const colors = getColorScheme(capability.capabilityName);

              return (
                <div key={capability.id} className={`space-y-3 p-3 rounded-lg border ${isUnlocked ? colors.border : 'border-dashed'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className={`text-sm font-medium ${isUnlocked ? colors.text : ''}`}>{capability.capabilityName}</h4>
                    <Badge 
                      variant={isUnlocked ? "default" : "outline"}
                      className={isUnlocked ? `${colors.bg} ${colors.text}` : ""}
                    >
                      {isUnlocked && level ? `Level ${level}` : 'Locked'}
                    </Badge>
                  </div>

                  {isUnlocked && level && (
                    <>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Level {level}</span>
                          <span className="text-muted-foreground">Level 5</span>
                        </div>
                        <div className="relative">
                          <Progress value={level * 20} className={`h-1.5 ${colors.bg}`} />
                          {/* Level markers */}
                          {[1, 2, 3, 4, 5].map((l) => (
                            <div 
                              key={l} 
                              className={`absolute top-0 w-1 h-1.5 rounded-full ${l <= level ? colors.text : 'bg-muted'}`}
                              style={{ left: `${(l - 1) * 25}%` }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-xs space-y-2">
                        <p className="font-medium">Current capability: </p>
                        <p className="text-muted-foreground">
                          {getCapabilityDetails(capability.capabilityName, level)}
                        </p>

                        {nextLevelPreview && (
                          <>
                            <p className="font-medium pt-1">Next level unlocks: </p>
                            <p className="text-muted-foreground">
                              {nextLevelPreview}
                            </p>
                          </>
                        )}
                      </div>
                    </>
                  )}

                  {!isUnlocked && (
                    <div className="text-xs text-muted-foreground py-1">
                      <p>Unlocked with continued content creation and evolution points</p>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-6 h-6 text-primary" strokeWidth="2">
                  <path d="M10 20h4"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">No capabilities unlocked yet</p>
                <p className="text-xs text-muted-foreground mt-1">Create content to unlock AI capabilities</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full flexitems-center space-x-2" 
          onClick={handleUpgradeCapability}
          disabled={!capabilities.find(c => c.isUnlocked === true)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" 
            stroke="currentColor" className="w-4 h-4" strokeWidth="2">
            <path d="M12 2v20M2 12h20"/>
          </svg>
          <span>Upgrade Capabilities</span>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function CreativeSymbiosisSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: evolutionPoints } = useQuery<EvolutionPoints>({
    queryKey: ['/api/evolution-points'],
    enabled: true,
  });

  // Get stats for the creative journey metrics from API (using mock data for now)
  const { data: userEngagement } = useQuery({
    queryKey: ['/api/user-engagement'],
    enabled: false, // Disable until implemented
  });

  // Mock stats for the creative journey metrics
  const stats = {
    contentCreated: 12,
    aiCollaborations: 24,
    capabilitiesUnlocked: 3,
    daysActive: 7
  };

  // Define Tier info type
  type TierInfo = {
    color: string;
    nextTier: string | null;
    features: string[];
  };

  // Get tier information
  const getTierInfo = (tier: string = 'starter'): TierInfo => {
    const tiers: Record<string, TierInfo> = {
      'starter': {
        color: 'from-primary to-primary/70',
        nextTier: 'Growing',
        features: ['Basic Caption Generation', 'Content Analysis', 'Engagement Tracking']
      },
      'growing': {
        color: 'from-amber-400 to-amber-600',
        nextTier: 'Established',
        features: ['Advanced Caption Styles', 'Audience Insights', 'Visual Enhancement Tools']
      },
      'established': {
        color: 'from-green-400 to-green-600',
        nextTier: 'Advanced',
        features: ['Multi-Platform Optimization', 'Content Calendar Automation', 'Style Training Level 1']
      },
      'advanced': {
        color: 'from-blue-400 to-blue-600',
        nextTier: 'Expert',
        features: ['Predictive Audience Analysis', 'Style Training Level 2', 'Cross-Platform Content Adaptation']
      },
      'expert': {
        color: 'from-purple-400 to-purple-600',
        nextTier: null,
        features: ['Custom AI Voice & Style', 'Predictive Trend Analysis', 'Unlimited Creative Energy']
      }
    };

    const lowerTier = tier.toLowerCase();
    return tiers[lowerTier] || tiers.starter;
  };

  const currentTier = evolutionPoints?.currentTier?.toLowerCase() || 'starter';
  const tierInfo = getTierInfo(currentTier);

  const handleSymbiosisAction = async (actionType: string) => {
    setLoading(true);
    setError(null);

    try {
      // This would be a real API call in production
      await new Promise(resolve => setTimeout(resolve, 800));

      // Verify integrity of framework components
      const integrityVerified = await verifyContentIntegrity(1);

      if (!integrityVerified) {
        throw new Error("Component integrity verification failed");
      }

      toast({
        title: "Success",
        description: `${actionType} action completed successfully`,
        variant: "default",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg text-red-800 dark:text-red-300 mb-4">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      {/* Hero section with improved visual appeal */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl border border-primary/20">
        {/* Background accent elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="relative p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Creative Symbiosis Framework</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                A unique approach where you and AI evolve together through creative collaboration.
                As you create more content, you unlock enhanced AI capabilities tailored to your creative style.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="default" className="flex items-center" onClick={() => handleSymbiosisAction('How It Works')}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" className="w-4 h-4 mr-2" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  How It Works
                </Button>
                <Button variant="outline" className="flex items-center" onClick={() => handleSymbiosisAction('View Benefits')}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" className="w-4 h-4 mr-2" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                  View Benefits
                </Button>
              </div>
            </div>

            {/* Current tier badge */}
            <div className="bg-card p-4 rounded-lg border shadow-sm text-center md:min-w-[200px]">
              <h3 className="font-medium mb-2">Your Current Tier</h3>
              <div className={`text-lg font-bold py-3 px-4 rounded-md mb-2 bg-gradient-to-r ${tierInfo.color} bg-clip-text text-transparent`}>
                {evolutionPoints?.currentTier || 'Starter'}
              </div>
              {tierInfo.nextTier && (
                <p className="text-xs text-muted-foreground">Next tier: {tierInfo.nextTier}</p>
              )}
            </div>
          </div>

          {/* Tier benefits preview */}
          {tierInfo.features && tierInfo.features.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-medium mb-3">Tier Benefits:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {tierInfo.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" className="w-4 h-4 mr-2 text-primary" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <EvolutionProgressCard className="h-full" />
          <CapabilitiesCard className="h-full" />
          <CreativeHistoryCard className="h-full" />
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Task Verification</h2>
          <TaskVerificationDashboard />
        </div>
      </div>

      {/* Creative journey stats with visual improvements */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <div className="bg-muted/30 px-6 py-4 border-b">
          <h3 className="text-lg font-medium">Your Creative Journey</h3>
          <p className="text-sm text-muted-foreground">Track your growth and accomplishments over time</p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 items-stretch">
            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" className="w-6 h-6 text-blue-500" strokeWidth="2">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-blue-500">{stats.contentCreated}</span>
              <p className="text-sm text-muted-foreground mt-1">Content Created</p>
            </div>

            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" className="w-6 h-6 text-purple-500" strokeWidth="2">
                  <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>
                  <path d="M9 18h6"/>
                  <path d="M10 22h4"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-purple-500">{stats.aiCollaborations}</span>
              <p className="text-sm text-muted-foreground mt-1">AI Collaborations</p>
            </div>

            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" className="w-6 h-6 text-green-500" strokeWidth="2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-green-500">{stats.capabilitiesUnlocked}</span>
              <p className="text-sm text-muted-foreground mt-1">Capabilities Unlocked</p>
            </div>

            <div className="bg-card rounded-lg border p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" className="w-6 h-6 text-amber-500" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <span className="text-3xl font-bold text-amber-500">{stats.daysActive}</span>
              <p className="text-sm text-muted-foreground mt-1">Days Active</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border text-center">
            <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/analytics">
                View detailed analytics and insights
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" className="w-4 h-4 ml-2" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}