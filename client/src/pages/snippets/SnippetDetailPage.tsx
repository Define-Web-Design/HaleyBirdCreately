import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCodeSnippetById, deleteCodeSnippet } from '../../lib/api/code-snippets';
import CodeSnippetViewer from '../../components/code-snippets/CodeSnippetViewer';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../../components/ui/alert-dialog';

const SnippetDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);

  // Fetch snippet details
  const snippetQuery = useQuery({
    queryKey: ['/api/snippets', id],
    queryFn: () => getCodeSnippetById(id),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCodeSnippet,
    onSuccess: () => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/snippets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/snippets/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/snippets/user'] });
      
      toast({
        title: 'Snippet deleted',
        description: 'The code snippet has been deleted successfully.',
        variant: 'default',
      });
      
      // Redirect to snippets list
      setLocation('/snippets');
    },
    onError: (error) => {
      console.error('Error deleting snippet:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete code snippet. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleEdit = (id: string | number) => {
    setLocation(`/snippets/edit/${id}`);
  };

  const handleDelete = (id: string | number) => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate(id);
  };

  if (snippetQuery.isLoading) {
    return <div className="flex justify-center p-8">Loading snippet...</div>;
  }

  if (snippetQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Snippet</h2>
        <p className="text-gray-600 mb-6">There was a problem loading this code snippet.</p>
        <Button onClick={() => setLocation('/snippets')}>
          Back to Snippets
        </Button>
      </div>
    );
  }

  if (!snippetQuery.data) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Snippet Not Found</h2>
        <p className="text-gray-600 mb-6">The code snippet you're looking for doesn't exist or may have been deleted.</p>
        <Button onClick={() => setLocation('/snippets')}>
          Back to Snippets
        </Button>
      </div>
    );
  }

  const snippet = snippetQuery.data;
  const isOwner = user && user.id === snippet.userId;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setLocation('/snippets')}>
          Back to Snippets
        </Button>
        
        {isOwner && (
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleEdit(snippet.id)}>
              Edit
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </Button>
          </div>
        )}
      </div>
      
      <div className="bg-white shadow rounded-lg">
        <CodeSnippetViewer 
          snippet={snippet} 
          isOwner={isOwner}
          showControls={false}
          previewMode={true}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              code snippet and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(snippet.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SnippetDetailPage;