import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import PerformanceInsights from '@/components/dashboard/PerformanceInsights';
import ContentLibrary from '@/components/dashboard/ContentLibrary';
import AIEnhancementTools from '@/components/dashboard/AIEnhancementTools';
import ContentCalendar from '@/components/dashboard/ContentCalendar';
import { AnalyticsData, ContentItem, User } from '@/lib/types';

const Dashboard = () => {
  const { toast } = useToast();
  
  // Welcome toast removed as per user request to eliminate unnecessary pop-ups
  
  // Queries for data
  const { data: user, isLoading: isLoadingUser } = useQuery<User | null>({
    queryKey: ['/api/user'],
    enabled: false, // Disabled for now
  });
  
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery<AnalyticsData | null>({
    queryKey: ['/api/analytics'],
    enabled: false, // Disabled for now
  });
  
  const { data: contentItems, isLoading: isLoadingContent } = useQuery<ContentItem[] | null>({
    queryKey: ['/api/content'],
    enabled: false, // Disabled for now
  });

  // Handle create content click
  const handleCreateContent = () => {
    toast({
      title: "Create Content",
      description: "The content creation modal would open here.",
    });
  };

  // Handle content actions
  const handleEditContent = (id: number) => {
    toast({
      title: "Edit Content",
      description: `Editing content with ID: ${id}`,
    });
  };

  const handleShareContent = (id: number) => {
    toast({
      title: "Share Content",
      description: `Sharing content with ID: ${id}`,
    });
  };

  const handleEnhanceContent = (id: number) => {
    toast({
      title: "Enhance Content",
      description: `Enhancing content with ID: ${id} with AI tools`,
    });
  };

  // Handle tool selection
  const handleToolSelect = (toolName: string) => {
    toast({
      title: toolName,
      description: `Opening ${toolName} tool`,
    });
  };

  return (
    <>
      <WelcomeSection 
        user={user || undefined} 
        onCreateContent={handleCreateContent} 
      />
      
      <PerformanceInsights 
        analyticsData={analytics || undefined} 
        isLoading={isLoadingAnalytics} 
      />
      
      <ContentLibrary 
        contentItems={contentItems || []} 
        isLoading={isLoadingContent}
        onEdit={handleEditContent}
        onShare={handleShareContent}
        onEnhance={handleEnhanceContent}
      />
      
      <AIEnhancementTools onToolSelect={handleToolSelect} />
      
      <ContentCalendar 
        onDayClick={(day) => {
          toast({
            title: "Selected Date",
            description: `Selected ${day.date}/${day.month + 1}/${day.year}`,
          });
        }}
        onPrevMonth={() => {
          toast({
            title: "Calendar Navigation",
            description: "Navigated to previous month",
          });
        }}
        onNextMonth={() => {
          toast({
            title: "Calendar Navigation",
            description: "Navigated to next month",
          });
        }}
      />
    </>
  );
};

export default Dashboard;
