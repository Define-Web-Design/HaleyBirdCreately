import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ContentLibrary from '@/components/dashboard/ContentLibrary';
import { ContentItem } from '@/lib/types';

const ContentLibraryPage = () => {
  const { toast } = useToast();
  
  // Query for content data
  const { data: contentItems, isLoading } = useQuery<ContentItem[] | null>({
    queryKey: ['/api/content'],
    enabled: false, // Disabled for now
  });

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

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-['SF_Pro_Display'] font-bold mb-2">Content Library</h1>
        <p className="text-gray-600 dark:text-gray-300">Manage and optimize all your content in one place</p>
      </div>
      
      <ContentLibrary 
        contentItems={contentItems || []} 
        isLoading={isLoading}
        onEdit={handleEditContent}
        onShare={handleShareContent}
        onEnhance={handleEnhanceContent}
      />
    </div>
  );
};

export default ContentLibraryPage;
