import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { 
  Check, 
  Lock, 
  Sparkles, 
  Star, 
  Zap, 
  InfoIcon,
  LayoutGrid
} from 'lucide-react';

// Types
interface UserCapability {
  id: number;
  userId: number;
  capabilityName: string;
  isUnlocked: boolean;
  level: number;
  unlockedAt?: string;
  expiresAt?: string;
}

interface EvolutionPoints {
  userId: number;
  totalPoints: number;
  currentTier: string;
  nextMilestone: number;
  creativeEnergyPoints: number;
  lastPointsUpdate: string;
}

interface CapabilityInfo {
  name: string;
  description: string;
  icon: React.ReactNode;
  unlockCost: number;
  upgradeCost: number;
  requiredTier: string;
  maxLevel: number;
  levelDescriptions: Record<number, string>;
}

export default function AICapabilities() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCapability, setSelectedCapability] = useState<string | null>(null);
  
  // Fetch user capabilities
  const { data: capabilities = [], isLoading: isLoadingCapabilities } = useQuery<UserCapability[]>({
    queryKey: ['/api/user-capabilities'],
    enabled: true,
  });
  
  // Fetch evolution points
  const { data: evolutionPoints, isLoading: isLoadingPoints } = useQuery<EvolutionPoints>({
    queryKey: ['/api/evolution-points'],
    enabled: true,
  });
  
  // Mutation to unlock a capability
  const unlockCapabilityMutation = useMutation({
    mutationFn: (capabilityName: string) => 
      apiRequest('POST', '/api/user-capabilities', { capabilityName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-capabilities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/evolution-points'] });
      
      toast({
        title: 'Capability Unlocked',
        description: `You've unlocked a new creative capability!`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Unlock Failed',
        description: 'Failed to unlock capability. Try again later.',
        variant: 'destructive',
      });
    }
  });
  
  // Mutation to upgrade a capability
  const upgradeCapabilityMutation = useMutation({
    mutationFn: (capabilityName: string) => 
      apiRequest('PUT', `/api/user-capabilities/${capabilityName}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-capabilities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/evolution-points'] });
      
      toast({
        title: 'Capability Upgraded',
        description: `Your capability has been enhanced to the next level!`,
        variant: 'default',
      });
    },
    onError: (error) => {
      toast({
        title: 'Upgrade Failed',
        description: 'Failed to upgrade capability. Try again later.',
        variant: 'destructive',
      });
    }
  });
  
  // Define capabilities information
  const capabilitiesInfo: Record<string, CapabilityInfo> = {
    'Caption Generation': {
      name: 'Caption Generation',
      description: 'Create engaging captions for your content optimized for various platforms',
      icon: <Sparkles className="h-5 w-5 text-amber-500" />,
      unlockCost: 50,
      upgradeCost: 25,
      requiredTier: 'Starter',
      maxLevel: 5,
      levelDescriptions: {
        1: 'Basic platform-optimized captions',
        2: 'Tone and style customization',
        3: 'Multi-platform optimization',
        4: 'Hashtag strategy integration',
        5: 'Viral potential analysis'
      }
    },
    'Content Analysis': {
      name: 'Content Analysis',
      description: 'AI-powered insights to improve your content performance',
      icon: <LayoutGrid className="h-5 w-5 text-blue-500" />,
      unlockCost: 75,
      upgradeCost: 35,
      requiredTier: 'Growing',
      maxLevel: 5,
      levelDescriptions: {
        1: 'Basic engagement prediction',
        2: 'Audience match scoring',
        3: 'Content improvement suggestions',
        4: 'Competitive analysis',
        5: 'Trend alignment scoring'
      }
    },
    'Visual Enhancement': {
      name: 'Visual Enhancement',
      description: 'Enhance your visuals with AI assistance',
      icon: <Zap className="h-5 w-5 text-purple-500" />,
      unlockCost: 100,
      upgradeCost: 45,
      requiredTier: 'Established',
      maxLevel: 5,
      levelDescriptions: {
        1: 'Basic image adjustments',
        2: 'Style recommendations',
        3: 'Layout optimization',
        4: 'Visual storytelling enhancement',
        5: 'Brand aesthetic alignment'
      }
    },
    'Content Scheduling': {
      name: 'Content Scheduling',
      description: 'Optimize posting times for maximum engagement',
      icon: <Star className="h-5 w-5 text-green-500" />,
      unlockCost: 120,
      upgradeCost: 55,
      requiredTier: 'Advanced',
      maxLevel: 5,
      levelDescriptions: {
        1: 'Basic scheduling recommendations',
        2: 'Platform-specific timing',
        3: 'Audience activity analysis',
        4: 'Performance-based adjustments',
        5: 'Global audience optimization'
      }
    }
  };
  
  // Check if tier requirements are met
  const checkTierRequirement = (requiredTier: string): boolean => {
    if (!evolutionPoints?.currentTier) return false;
    
    const tierValues: Record<string, number> = {
      'Starter': 0,
      'Growing': 1,
      'Established': 2,
      'Advanced': 3,
      'Expert': 4
    };
    
    return tierValues[evolutionPoints.currentTier] >= tierValues[requiredTier];
  };
  
  // Get user capability by name
  const getUserCapability = (capabilityName: string): UserCapability | undefined => {
    return capabilities.find(c => c.capabilityName === capabilityName);
  };
  
  // Handle unlock capability
  const handleUnlockCapability = (capabilityName: string) => {
    const info = capabilitiesInfo[capabilityName];
    
    if (!evolutionPoints || evolutionPoints.totalPoints < info.unlockCost) {
      toast({
        title: 'Not Enough Evolution Points',
        description: `You need ${info.unlockCost} points to unlock this capability`,
        variant: 'destructive',
      });
      return;
    }
    
    unlockCapabilityMutation.mutate(capabilityName);
  };
  
  // Handle upgrade capability
  const handleUpgradeCapability = (capabilityName: string) => {
    const capability = getUserCapability(capabilityName);
    const info = capabilitiesInfo[capabilityName];
    
    if (!capability) return;
    
    if (!evolutionPoints || evolutionPoints.totalPoints < info.upgradeCost) {
      toast({
        title: 'Not Enough Evolution Points',
        description: `You need ${info.upgradeCost} points to upgrade this capability`,
        variant: 'destructive',
      });
      return;
    }
    
    upgradeCapabilityMutation.mutate(capabilityName);
  };
  
  // Loading state
  if (isLoadingCapabilities || isLoadingPoints) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="skeleton h-7 w-48"></CardTitle>
          <CardDescription className="skeleton h-5 w-64"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton h-32 w-full rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Render AI capabilities
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Creative Intelligence Capabilities</CardTitle>
            <CardDescription>
              Unlock and upgrade powerful AI features to enhance your creative process
            </CardDescription>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            {evolutionPoints?.totalPoints || 0} Points Available
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {Object.entries(capabilitiesInfo).map(([name, info]) => {
            const capability = getUserCapability(name);
            const isUnlocked = capability?.isUnlocked || false;
            const level = capability?.level || 0;
            const isMaxLevel = level >= info.maxLevel;
            const tierMet = checkTierRequirement(info.requiredTier);
            
            return (
              <Card key={name} className={`border ${isUnlocked ? 'border-primary/30' : 'border-muted'}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {info.icon}
                      <CardTitle className="text-base ml-2">{name}</CardTitle>
                    </div>
                    
                    {isUnlocked && (
                      <div className="flex">
                        {Array.from({ length: info.maxLevel }).map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            className={`${i < level ? 'fill-primary text-primary' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {isUnlocked ? (
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>Level {level}/{info.maxLevel}</span>
                      <span>{info.levelDescriptions[level]}</span>
                    </div>
                  ) : (
                    <CardDescription className="text-xs mt-1 flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Requires {info.requiredTier} tier 
                      {!tierMet && " (not met)"}
                    </CardDescription>
                  )}
                </CardHeader>
                
                <CardContent className="pb-2 pt-0">
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                  
                  {isUnlocked && !isMaxLevel && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Current: {info.levelDescriptions[level]}</span>
                        <span>Next: {info.levelDescriptions[level + 1]}</span>
                      </div>
                      <Progress value={(level / info.maxLevel) * 100} className="h-1" />
                    </div>
                  )}
                </CardContent>
                
                <CardFooter>
                  {!isUnlocked ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-sm h-8"
                      disabled={!tierMet || (evolutionPoints?.totalPoints || 0) < info.unlockCost}
                      onClick={() => handleUnlockCapability(name)}
                    >
                      <Lock className="h-3 w-3 mr-1.5" />
                      Unlock ({info.unlockCost} points)
                    </Button>
                  ) : !isMaxLevel ? (
                    <Button 
                      variant="outline" 
                      className="w-full text-sm h-8"
                      disabled={(evolutionPoints?.totalPoints || 0) < info.upgradeCost}
                      onClick={() => handleUpgradeCapability(name)}
                    >
                      <Zap className="h-3 w-3 mr-1.5" />
                      Upgrade to Level {level + 1} ({info.upgradeCost} points)
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      className="w-full text-sm h-8 bg-primary/5"
                      disabled
                    >
                      <Check className="h-3 w-3 mr-1.5" />
                      Maximum Level Reached
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </CardContent>
      <CardFooter className="flex-col">
        <div className="w-full px-2 py-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
          <div className="flex items-center mb-1">
            <InfoIcon className="h-3 w-3 mr-1.5" />
            <span className="font-medium">How It Works:</span>
          </div>
          <p>
            Earn evolution points by creating content, completing activities, and engaging with the platform.
            Use these points to unlock and upgrade AI capabilities that enhance your creative process.
            Higher tier levels unlock more advanced capabilities.
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}