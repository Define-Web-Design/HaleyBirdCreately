import { useState } from 'react';
import { User, GrowthInsight } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpIcon, 
  ArrowRightIcon, 
  MinusIcon,
  BrainIcon,
  SparklesIcon,
  ZapIcon,
  UsersIcon
} from 'lucide-react';

interface WelcomeSectionProps {
  user?: User;
  onCreateContent?: () => void;
}

const WelcomeSection = ({ user, onCreateContent }: WelcomeSectionProps) => {
  const displayName = user?.displayName || 'Sophia';
  const [showGrowthDetail, setShowGrowthDetail] = useState(false);
  
  // Mock data for development - this would come from the user object in production
  const growthMetrics = user?.growthMetrics || {
    intellectual: 72,
    creative: 85,
    impact: 64,
    trend: {
      intellectual: 'rising',
      creative: 'rising',
      impact: 'stable'
    },
    lastUpdated: new Date().toISOString()
  };
  
  const learningJourney = user?.learningJourney || {
    currentLevel: 3,
    nextMilestone: "Cross-Platform Content Mastery",
    recentInsights: [
      "Your authentic voice resonates most with audience when discussing personal growth",
      "Visual content performs 38% better when using your signature color palette"
    ],
    skillsGained: ["Emotional Tone Crafting", "Visual Storytelling", "Platform Adaptation"],
    personalizationIndex: 68
  };
  
  // Render the trend icon based on the trend type
  const renderTrendIcon = (trend: 'rising' | 'stable' | 'declining') => {
    switch(trend) {
      case 'rising':
        return <ArrowUpIcon className="w-3 h-3 text-green-500" />;
      case 'stable':
        return <MinusIcon className="w-3 h-3 text-amber-500" />;
      case 'declining':
        return <ArrowUpIcon className="w-3 h-3 text-red-500 transform rotate-180" />;
    }
  };

  return (
    <section className="mb-8 bg-gradient-to-r from-indigo-50/50 to-amber-50/50 dark:from-indigo-950/20 dark:to-amber-950/20 rounded-xl overflow-hidden">
      <div className="px-4 py-5 sm:py-6">
        <div className="flex flex-col space-y-4">
          {/* Header Section with Growth Summary */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex items-center flex-wrap gap-2">
                <h1 className="text-2xl sm:text-3xl font-['SF_Pro_Display'] font-bold text-gray-900 dark:text-white">
                  Welcome, {displayName}
                </h1>
                <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 hover:bg-indigo-100 border-none">
                  Level {learningJourney.currentLevel}
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1 max-w-xl text-sm">
                Continue your creative journey toward <span className="font-medium text-primary">{learningJourney.nextMilestone}</span>
              </p>
              
              {/* Growth Metrics Summary */}
              <div className="mt-3 flex flex-wrap gap-2">
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg">
                  <BrainIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Intellectual</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{growthMetrics.intellectual}%</span>
                      <span className="ml-1">{renderTrendIcon(growthMetrics.trend.intellectual)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg">
                  <SparklesIcon className="w-4 h-4 text-fuchsia-600 dark:text-fuchsia-400" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Creative</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{growthMetrics.creative}%</span>
                      <span className="ml-1">{renderTrendIcon(growthMetrics.trend.creative)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg">
                  <ZapIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Impact</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium">{growthMetrics.impact}%</span>
                      <span className="ml-1">{renderTrendIcon(growthMetrics.trend.impact)}</span>
                    </div>
                  </div>
                </div>
                
                {user?.collaborationStats && (
                  <div className="flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg">
                    <UsersIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Team Synergy</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{user.collaborationStats.teamSynergy}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-3 md:mt-0 space-y-2">
              <Button 
                onClick={onCreateContent}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-medium rounded-lg flex items-center justify-center transition-all group"
                size="lg"
              >
                <div className="mr-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-white text-xs">+</span>
                </div>
                Create Content
              </Button>
              
              <Button 
                onClick={() => setShowGrowthDetail(!showGrowthDetail)}
                variant="outline"
                className="w-full sm:w-auto border-primary/30 text-primary hover:text-primary/90 hover:bg-primary/5 font-medium rounded-lg flex items-center justify-center transition-all"
                size="sm"
              >
                {showGrowthDetail ? 'Hide Growth Insights' : 'Show Growth Insights'}
                <ArrowRightIcon className="ml-1 w-3 h-3" />
              </Button>
            </div>
          </div>
          
          {/* Growth Insights Section */}
          {showGrowthDetail && (
            <div className="bg-white/70 dark:bg-gray-800/50 rounded-xl p-4 mt-2 border border-indigo-100 dark:border-indigo-900">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Recent Growth Insights</h3>
              <div className="space-y-2">
                {learningJourney.recentInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-full p-1 mt-0.5">
                      <SparklesIcon className="w-3 h-3 text-primary" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{insight}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills Acquired</h3>
                <div className="flex flex-wrap gap-2">
                  {learningJourney.skillsGained.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-200 font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Personalization</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{learningJourney.personalizationIndex}%</span>
                </div>
                <Progress value={learningJourney.personalizationIndex} className="h-1.5 bg-gray-200 dark:bg-gray-700" />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  AI is continually learning your preferences and creative style
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
