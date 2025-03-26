import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import ContentLibrary from '@/components/dashboard/ContentLibrary';
import { ContentItem } from '@/lib/types';

const ContentVaultPage = () => {
  const { toast } = useToast();
  
  // Query for archived content data
  const { data: archivedContent, isLoading } = useQuery<ContentItem[] | null>({
    queryKey: ['/api/content/archived'],
    enabled: false, // Disabled for now
  });

  // Handle content actions
  const handleEditContent = (id: number) => {
    toast({
      title: "Edit Content",
      description: `Editing archived content with ID: ${id}`,
    });
  };

  const handleShareContent = (id: number) => {
    toast({
      title: "Share Content",
      description: `Sharing archived content with ID: ${id}`,
    });
  };

  const handleEnhanceContent = (id: number) => {
    toast({
      title: "Remix Content",
      description: `Creating a new version of content with ID: ${id}`,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-['SF_Pro_Display'] font-bold mb-2">Content Vault</h1>
        <p className="text-gray-600 dark:text-gray-300">Archive and repurpose your past content for new inspiration</p>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800 mb-8">
        <div className="flex items-center mb-4">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white mr-3">
            <i className="fas fa-lightbulb"></i>
          </div>
          <div>
            <h2 className="text-lg font-medium">Sustainability Insights</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Identify and refresh evergreen content to extend its lifecycle
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-accent/10 to-primary/5 dark:from-accent/20 dark:to-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Evergreen Content</h3>
              <span className="text-accent text-sm">42%</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Content that maintains relevance and engagement over time
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-secondary/10 to-primary/5 dark:from-secondary/20 dark:to-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Refresh Opportunities</h3>
              <span className="text-secondary text-sm">12</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              High-potential content that could be updated for current trends
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-primary/10 to-secondary/5 dark:from-primary/20 dark:to-secondary/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium">Remix Suggestions</h3>
              <span className="text-primary text-sm">8</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Content that could be transformed into new formats or themes
            </p>
          </div>
        </div>
      </div>
      
      <ContentLibrary 
        contentItems={archivedContent || []} 
        isLoading={isLoading}
        onEdit={handleEditContent}
        onShare={handleShareContent}
        onEnhance={handleEnhanceContent}
      />
    </div>
  );
};

export default ContentVaultPage;
