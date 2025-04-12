import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { getCodeSnippetByShareId } from '../../lib/api/code-snippets';
import CodeSnippetViewer from '../../components/code-snippets/CodeSnippetViewer';
import { Button } from '../../components/ui/button';

const SharedSnippetPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [, setLocation] = useLocation();

  // Fetch snippet by share ID
  const snippetQuery = useQuery({
    queryKey: ['/api/snippets/share', shareId],
    queryFn: () => getCodeSnippetByShareId(shareId),
  });

  if (snippetQuery.isLoading) {
    return <div className="flex justify-center p-8">Loading shared snippet...</div>;
  }

  if (snippetQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Shared Snippet</h2>
        <p className="text-gray-600 mb-6">There was a problem loading this shared code snippet.</p>
        <Button onClick={() => setLocation('/snippets')}>
          Browse Snippets
        </Button>
      </div>
    );
  }

  if (!snippetQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Shared Snippet Not Found</h2>
        <p className="text-gray-600 mb-6">
          The shared code snippet you're looking for doesn't exist, may have been deleted, or is not public.
        </p>
        <Button onClick={() => setLocation('/snippets')}>
          Browse Snippets
        </Button>
      </div>
    );
  }

  const snippet = snippetQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setLocation('/snippets')}>
          Browse Snippets
        </Button>
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <CodeSnippetViewer 
          snippet={snippet} 
          showControls={false}
          previewMode={true}
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <h3 className="font-medium mb-2">Shared Snippet</h3>
        <p className="text-sm">
          This is a shared code snippet. You're viewing it in read-only mode.
        </p>
      </div>
    </div>
  );
};

export default SharedSnippetPage;