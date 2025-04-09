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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{workspace.name}</h2>
              <Badge className="bg-primary/20 text-primary border-none">
                {workspace.teamSynergy}% Synergy
              </Badge>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
              {workspace.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg">
                <UsersIcon className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{workspace.members.length} Members</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg">
                <LayoutIcon className="w-4 h-4 text-indigo-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{workspace.projects.length} Projects</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 px-3 py-1.5 rounded-lg">
                <BarChart2Icon className="w-4 h-4 text-teal-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{workspace.activityMetrics?.totalContributions || 0} Contributions</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {workspace.members.slice(0, 3).map((member) => (
                <Avatar key={member.userId} className="border-2 border-white dark:border-gray-800">
                  <AvatarImage src={member.avatar} alt={member.displayName} />
                  <AvatarFallback className="bg-primary text-white">
                    {member.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              ))}
              {workspace.members.length > 3 && (
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300">
                  +{workspace.members.length - 3}
                </div>
              )}
            </div>
            
            {isOwnerOrAdmin && (
              <Button variant="outline" size="sm" className="ml-2">
                <UserPlusIcon className="w-4 h-4 mr-1" /> Invite
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Workspace Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="projects" className="flex items-center">
            <CodeIcon className="w-4 h-4 mr-2" /> Projects
          </TabsTrigger>
          <TabsTrigger value="members" className="flex items-center">
            <UsersIcon className="w-4 h-4 mr-2" /> Team Members
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center">
            <MessageSquareIcon className="w-4 h-4 mr-2" /> Feedback Loop
          </TabsTrigger>
        </TabsList>
        
        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Projects</h3>
            {isOwnerOrAdmin && (
              <Button size="sm">
                <PlusIcon className="w-4 h-4 mr-1" /> New Project
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workspace.projects.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {getStatusBadge(project.status)}
                  </div>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Project Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
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
                        <div className="text-sm font-medium">Progress</div>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Intellectual Value</div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 rounded-full" 
                          style={{ width: `${project.intellectualValue}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Creative Value</div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-fuchsia-500 rounded-full" 
                          style={{ width: `${project.creativeValue}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Team Members */}
                  <div>
                    <div className="text-sm font-medium mb-2">Team</div>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2 mr-2">
                        {project.assignedMembers.map((memberId) => {
                          const member = workspace.members.find(m => m.userId === memberId);
                          if (!member) return null;
                          
                          return (
                            <Avatar key={memberId} className="w-8 h-8 border-2 border-white dark:border-gray-800">
                              <AvatarFallback className="text-xs bg-primary text-white">
                                {member.displayName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          );
                        })}
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        {project.collaborationScore}% Synergy
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Action Button */}
                  <Button className="w-full" variant={project.status === 'completed' ? 'outline' : 'default'}>
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Members</h3>
            {isOwnerOrAdmin && (
              <Button size="sm">
                <UserPlusIcon className="w-4 h-4 mr-1" /> Invite Member
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workspace.members.map((member) => (
              <Card key={member.userId} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={member.avatar} alt={member.displayName} />
                      <AvatarFallback className="bg-primary text-white">
                        {member.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{member.displayName}</h4>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs capitalize">
                              {member.role}
                            </Badge>
                            <span className="text-xs text-gray-500 ml-2">
                              Joined {formatDate(member.joinedAt)}
                            </span>
                          </div>
                        </div>
                        
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                          {member.contributionScore}% Contribution
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {member.insights && member.insights.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                      <h5 className="text-sm font-medium mb-2">AI Insights</h5>
                      <ul className="space-y-1">
                        {member.insights.map((insight, idx) => (
                          <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                            <ArrowRightIcon className="w-3 h-3 mr-1.5 mt-1 text-primary flex-shrink-0" />
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Team Feedback Loop</h3>
            <Button size="sm">
              <MessageSquareIcon className="w-4 h-4 mr-1" /> Add Feedback
            </Button>
          </div>
          
          <div className="space-y-4">
            {workspace.activityMetrics?.teamFeedback?.map((feedback) => {
              const fromMember = workspace.members.find(m => m.userId === feedback.fromUserId);
              
              return (
                <Card key={feedback.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className={`p-2 rounded-full mt-0.5 flex-shrink-0
                        ${feedback.sentiment === 'positive' ? 'bg-green-100 dark:bg-green-900/40' : ''}
                        ${feedback.sentiment === 'neutral' ? 'bg-blue-100 dark:bg-blue-900/40' : ''}
                        ${feedback.sentiment === 'constructive' ? 'bg-amber-100 dark:bg-amber-900/40' : ''}
                      `}>
                        {getSentimentIcon(feedback.sentiment)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <div className="flex items-center">
                            <span className="font-medium">{fromMember?.displayName || 'Team Member'}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(feedback.createdAt)}
                            </span>
                          </div>
                          
                          <Badge variant="outline" className="capitalize">
                            {feedback.targetType}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-700 dark:text-gray-300">
                          {feedback.message}
                        </p>
                        
                        <div className="mt-2 flex items-center gap-3">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <ThumbsUpIcon className="w-4 h-4 mr-1" /> Helpful
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <MessageCircleIcon className="w-4 h-4 mr-1" /> Reply
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