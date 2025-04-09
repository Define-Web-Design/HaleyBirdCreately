import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CollaborativeWorkspace as WorkspaceType, 
  CollaborativeMember, 
  CollaborativeProject, 
  TeamFeedback 
} from '@/lib/types';
import { 
  UsersIcon, 
  MessageSquareIcon, 
  CodeIcon, 
  CheckCircleIcon,
  ClockIcon,
  AlertCircleIcon,
  BarChart2Icon,
  ThumbsUpIcon,
  MessageCircleIcon,
  ArrowRightIcon,
  PlusIcon,
  UserPlusIcon,
  LayoutIcon,
  ArrowUpIcon,
  TargetIcon
} from 'lucide-react';

interface CollaborativeWorkspaceProps {
  workspace?: WorkspaceType;
  userId?: number;
}

// Mock data for development purposes
const mockWorkspace: WorkspaceType = {
  id: 1,
  name: "Creative Collective",
  description: "A collaborative space for our team to create and transform content together",
  ownerId: 1,
  members: [
    {
      userId: 1,
      displayName: "Alex Morgan",
      role: "owner",
      joinedAt: new Date().toISOString(),
      avatar: "",
      contributionScore: 92,
      insights: [
        "Consistently provides actionable feedback",
        "Strong strategic vision for content direction"
      ]
    },
    {
      userId: 2,
      displayName: "Jordan Lee",
      role: "editor",
      joinedAt: new Date().toISOString(),
      avatar: "",
      contributionScore: 87,
      insights: [
        "Excellent visual content contributor",
        "Helps improve content accessibility"
      ]
    },
    {
      userId: 3,
      displayName: "Taylor Kim",
      role: "editor",
      joinedAt: new Date().toISOString(),
      avatar: "",
      contributionScore: 78,
      insights: [
        "Analytical approach to content strategy",
        "Provides thorough content reviews"
      ]
    }
  ],
  projects: [
    {
      id: 101,
      name: "Q2 Content Transformation Campaign",
      description: "Transform existing blog content into multi-platform formats",
      status: "in-progress",
      contentItems: [201, 202, 203],
      assignedMembers: [1, 2, 3],
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      intellectualValue: 80,
      creativeValue: 75,
      collaborationScore: 88
    },
    {
      id: 102,
      name: "Visual Style Guide Development",
      description: "Create a cohesive visual language for cross-platform content",
      status: "planning",
      contentItems: [204, 205],
      assignedMembers: [1, 2],
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      intellectualValue: 65,
      creativeValue: 90,
      collaborationScore: 72
    },
    {
      id: 103,
      name: "Platform Performance Analysis",
      description: "Analyze content performance across platforms for optimization",
      status: "completed",
      contentItems: [206, 207, 208],
      assignedMembers: [1, 3],
      createdAt: new Date().toISOString(),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      intellectualValue: 85,
      creativeValue: 60,
      collaborationScore: 82
    }
  ],
  createdAt: new Date().toISOString(),
  teamSynergy: 82,
  activityMetrics: {
    activeDays: 18,
    totalContributions: 142,
    contributionsByUser: {
      1: 58,
      2: 45,
      3: 39
    },
    peakActivityTimes: ["Tuesday afternoons", "Thursday mornings"],
    teamFeedback: [
      {
        id: 301,
        message: "Great collaboration on the visual style guide - everyone's input was valuable",
        sentiment: "positive",
        createdAt: new Date().toISOString(),
        fromUserId: 2,
        targetType: "project",
        targetId: 102
      },
      {
        id: 302,
        message: "The analysis workflow could be improved with more structured data collection",
        sentiment: "constructive",
        createdAt: new Date().toISOString(),
        fromUserId: 3,
        targetType: "project",
        targetId: 103
      },
      {
        id: 303,
        message: "Our collaborative approach is really enhancing content consistency across platforms",
        sentiment: "positive",
        createdAt: new Date().toISOString(),
        fromUserId: 1,
        targetType: "workspace",
        targetId: 1
      }
    ],
    lastUpdated: new Date().toISOString()
  }
};

const CollaborativeWorkspace = ({ workspace = mockWorkspace, userId = 1 }: CollaborativeWorkspaceProps) => {
  const [activeTab, setActiveTab] = useState('projects');
  
  // Get the current user's role in the workspace
  const currentMember = workspace.members.find(member => member.userId === userId);
  const isOwnerOrAdmin = currentMember?.role === 'owner' || currentMember?.role === 'admin';
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Get status badge for project
  const getStatusBadge = (status: 'planning' | 'in-progress' | 'review' | 'completed') => {
    switch(status) {
      case 'planning':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-none">Planning</Badge>;
      case 'in-progress':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-none">In Progress</Badge>;
      case 'review':
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 border-none">Review</Badge>;
      case 'completed':
        return <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-none">Completed</Badge>;
      default:
        return null;
    }
  };
  
  // Get sentiment icon
  const getSentimentIcon = (sentiment: 'positive' | 'neutral' | 'constructive') => {
    switch(sentiment) {
      case 'positive':
        return <ThumbsUpIcon className="w-4 h-4 text-green-500" />;
      case 'neutral':
        return <MessageCircleIcon className="w-4 h-4 text-blue-500" />;
      case 'constructive':
        return <TargetIcon className="w-4 h-4 text-amber-500" />;
    }
  };
  
  return (
    <section className="mb-8 space-y-6">
      {/* Workspace Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{workspace.name}</h2>
              <Badge className="bg-primary/20 text-primary border-none text-xs sm:text-sm">
                {workspace.teamSynergy}% Synergy
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
              {workspace.description}
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 dark:bg-gray-800/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{workspace.members.length} Members</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 dark:bg-gray-800/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                <LayoutIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{workspace.projects.length} Projects</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 bg-white/80 dark:bg-gray-800/80 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
                <BarChart2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-500" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{workspace.activityMetrics?.totalContributions || 0} Contributions</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <div className="flex -space-x-1.5 sm:-space-x-2">
              {workspace.members.slice(0, 3).map((member) => (
                <Avatar key={member.userId} className="w-8 h-8 sm:w-10 sm:h-10 border-2 border-white dark:border-gray-800">
                  <AvatarImage src={member.avatar} alt={member.displayName} />
                  <AvatarFallback className="bg-primary text-white text-xs sm:text-sm">
                    {member.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {workspace.members.length > 3 && (
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  +{workspace.members.length - 3}
                </div>
              )}
            </div>
            
            {isOwnerOrAdmin && (
              <Button variant="outline" size="sm" className="ml-2 h-8 text-xs sm:text-sm px-2 sm:px-3">
                <UserPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Invite
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Workspace Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto scrollbar-hide">
          <TabsTrigger value="projects" className="flex items-center text-xs sm:text-sm">
            <CodeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Projects
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center text-xs sm:text-sm">
            <UsersIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> <span className="hidden xs:inline">Team </span>Members
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center text-xs sm:text-sm">
            <MessageSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Feedback<span className="hidden sm:inline"> Loop</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Active Projects</h3>
            {isOwnerOrAdmin && (
              <Button size="sm" className="h-8 text-xs sm:text-sm px-2.5 sm:px-3">
                <PlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> New<span className="hidden xs:inline"> Project</span>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workspace.projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base sm:text-lg">{project.name}</CardTitle>
                    {getStatusBadge(project.status)}
                  </div>
                  <CardDescription className="text-xs sm:text-sm">{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Created</div>
                      <div className="font-medium">{formatDate(project.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">
                        {project.status === 'completed' ? 'Completed' : 'Due Date'}
                      </div>
                      <div className="font-medium">
                        {project.status === 'completed' && project.completedAt 
                          ? formatDate(project.completedAt) 
                          : project.dueDate ? formatDate(project.dueDate) : 'Not set'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress */}
                  {project.status !== 'completed' && (
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-xs sm:text-sm font-medium">Progress</div>
                        <div className="text-xs text-gray-500">
                          {project.status === 'planning' ? '10%' : 
                           project.status === 'in-progress' ? '60%' : 
                           project.status === 'review' ? '90%' : '100%'}
                        </div>
                      </div>
                      <Progress 
                        value={project.status === 'planning' ? 10 : 
                               project.status === 'in-progress' ? 60 : 
                               project.status === 'review' ? 90 : 100} 
                        className="h-1.5" 
                      />
                    </div>
                  )}
                  
                  {/* Growth Value */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Intellectual Value</div>
                      <div className="h-1 sm:h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${project.intellectualValue}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Creative Value</div>
                      <div className="h-1 sm:h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-fuchsia-500 rounded-full" 
                          style={{ width: `${project.creativeValue}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div>
                    <div className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">Team</div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1.5 sm:-space-x-2 mr-2">
                        {project.assignedMembers.map((memberId) => {
                          const member = workspace.members.find(m => m.userId === memberId);
                          if (!member) return null;
                          
                          return (
                            <Avatar key={memberId} className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white dark:border-gray-800">
                              <AvatarFallback className="text-[10px] sm:text-xs bg-primary text-white">
                                {member.displayName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                      <Badge variant="outline" className="text-[10px] sm:text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {project.collaborationScore}% Synergy
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button className="w-full h-8 sm:h-9 text-xs sm:text-sm mt-1 sm:mt-0" variant={project.status === 'completed' ? 'outline' : 'default'}>
                    {project.status === 'completed' ? 'View Details' : 'Continue Working'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
            {isOwnerOrAdmin && (
              <Button size="sm" className="h-8 text-xs sm:text-sm px-2.5 sm:px-3">
                <UserPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Invite<span className="hidden xs:inline"> Member</span>
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspace.members.map((member) => (
              <Card key={member.userId} className="overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar className="w-10 h-10 sm:w-12 sm:h-12">
                      <AvatarImage src={member.avatar} alt={member.displayName} />
                      <AvatarFallback className="bg-primary text-white text-xs sm:text-sm">
                        {member.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex flex-wrap sm:flex-nowrap sm:items-center justify-between gap-y-1">
                        <div>
                          <h4 className="text-sm sm:text-base font-medium">{member.displayName}</h4>
                          <div className="flex flex-wrap items-center mt-0.5 sm:mt-1 gap-y-1">
                            <Badge variant="outline" className="text-[10px] sm:text-xs capitalize">
                              {member.role}
                            </Badge>
                            <span className="text-[10px] sm:text-xs text-gray-500 ml-2">
                              Joined {formatDate(member.joinedAt)}
                            </span>
                          </div>
                        </div>
                        
                        <Badge className="text-[10px] sm:text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {member.contributionScore}% Contribution
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {member.insights && member.insights.length > 0 && (
                    <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 dark:border-gray-800">
                      <h5 className="text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">AI Insights</h5>
                      <ul className="space-y-1">
                        {member.insights.map((insight, idx) => (
                          <li key={idx} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <ArrowRightIcon className="w-3 h-3 mr-1.5 mt-0.5 text-primary flex-shrink-0" />
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white">Team Feedback Loop</h3>
            <Button size="sm" className="h-8 text-xs sm:text-sm px-2.5 sm:px-3">
              <MessageSquareIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Add<span className="hidden xs:inline"> Feedback</span>
            </Button>
          </div>
          
          <div className="space-y-4">
            {workspace.activityMetrics?.teamFeedback?.map((feedback) => {
              const fromMember = workspace.members.find(m => m.userId === feedback.fromUserId);
              
              return (
                <Card key={feedback.id} className="overflow-hidden">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex gap-2 sm:gap-3">
                      <div className={`p-1.5 sm:p-2 rounded-full mt-0.5 flex-shrink-0
                        ${feedback.sentiment === 'positive' ? 'bg-green-100 dark:bg-green-900/40' : ''}
                        ${feedback.sentiment === 'neutral' ? 'bg-blue-100 dark:bg-blue-900/40' : ''}
                        ${feedback.sentiment === 'constructive' ? 'bg-amber-100 dark:bg-amber-900/40' : ''}
                      `}>
                        {getSentimentIcon(feedback.sentiment)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap sm:flex-nowrap justify-between items-start sm:items-center mb-1 gap-y-1">
                          <div className="flex flex-wrap sm:flex-nowrap sm:items-center gap-x-1 sm:gap-x-0">
                            <span className="text-xs sm:text-sm font-medium">{fromMember?.displayName || 'Team Member'}</span>
                            <span className="mx-1 sm:mx-2 text-gray-400 hidden xs:inline-block">•</span>
                            <span className="text-[10px] sm:text-xs text-gray-500">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </div>
                          
                          <Badge variant="outline" className="text-[10px] sm:text-xs capitalize">
                            {feedback.targetType}
                          </Badge>
                        </div>
                        
                        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                          {feedback.message}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-2 sm:gap-3">
                          <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs">
                            <ThumbsUpIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Helpful
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs">
                            <MessageCircleIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" /> Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default CollaborativeWorkspace;