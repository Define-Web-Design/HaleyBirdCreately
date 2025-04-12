import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCodeSnippetById, updateCodeSnippet } from '../../lib/api/code-snippets';
import CodeSnippetForm, { CodeSnippetFormValues } from '../../components/code-snippets/CodeSnippetForm';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';

const EditSnippetPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch snippet
  const snippetQuery = useQuery({
    queryKey: ['/api/snippets', id],
    queryFn: () => getCodeSnippetById(id),
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: CodeSnippetFormValues) => updateCodeSnippet(id, data),
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/snippets', id] });
      queryClient.invalidateQueries({ queryKey: ['/api/snippets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/snippets/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/snippets/user'] });
      
      toast({
        title: 'Snippet updated',
        description: 'Your code snippet has been updated successfully.',
        variant: 'default',
      });
      
      // Redirect to the snippet
      setLocation(`/snippets/${id}`);
    },
    onError: (error) => {
      console.error('Error updating snippet:', error);
      toast({
        title: 'Error',
        description: 'Failed to update code snippet. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Check if user is the owner of the snippet
  React.useEffect(() => {
    if (snippetQuery.data && user && snippetQuery.data.userId !== user.id) {
      toast({
        title: 'Access denied',
        description: 'You can only edit your own code snippets.',
        variant: 'destructive',
      });
      setLocation(`/snippets/${id}`);
    }
  }, [snippetQuery.data, user, id, setLocation]);

  const handleSubmit = (data: CodeSnippetFormValues) => {
    updateMutation.mutate(data);
  };

  if (snippetQuery.isLoading) {
    return <div className="flex justify-center p-8">Loading snippet...</div>;
  }

  if (snippetQuery.isError) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Snippet</h2>
        <p className="text-gray-600 mb-6">There was a problem loading this code snippet for editing.</p>
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
        <p className="text-gray-600 mb-6">The code snippet you're trying to edit doesn't exist or may have been deleted.</p>
        <Button onClick={() => setLocation('/snippets')}>
          Back to Snippets
        </Button>
      </div>
    );
  }

  const snippet = snippetQuery.data;

  // Prepare default values for the form
  const defaultValues = {
    title: snippet.title,
    description: snippet.description || '',
    code: snippet.code,
    language: snippet.language,
    tags: snippet.tags ? snippet.tags.join(', ') : '',
    isPublic: snippet.isPublic,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Edit Code Snippet</h1>
        <Button variant="outline" onClick={() => setLocation(`/snippets/${id}`)}>
          Cancel
        </Button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <CodeSnippetForm 
          defaultValues={defaultValues} 
          onSubmit={handleSubmit} 
          isSubmitting={updateMutation.isPending}
          isEditMode={true}
        />
      </div>
    </div>
  );
};

export default EditSnippetPage;