import React from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCodeSnippet } from '../../lib/api/code-snippets';
import CodeSnippetForm, { CodeSnippetFormValues } from '../../components/code-snippets/CodeSnippetForm';
import { Button } from '../../components/ui/button';
import { toast } from '../../hooks/use-toast';
import { useAuth } from '../../hooks/useAuth';

const CreateSnippetPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You need to be logged in to create code snippets.',
        variant: 'destructive',
      });
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createCodeSnippet,
    onSuccess: (data) => {
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/snippets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/snippets/public'] });
      queryClient.invalidateQueries({ queryKey: ['/api/snippets/user'] });
      
      toast({
        title: 'Snippet created',
        description: 'Your code snippet has been created successfully.',
        variant: 'default',
      });
      
      // Redirect to the new snippet
      setLocation(`/snippets/${data.id}`);
    },
    onError: (error) => {
      console.error('Error creating snippet:', error);
      toast({
        title: 'Error',
        description: 'Failed to create code snippet. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (data: CodeSnippetFormValues) => {
    createMutation.mutate(data);
  };

  if (!user) {
    return null; // Prevent form rendering if not authenticated
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create Code Snippet</h1>
        <Button variant="outline" onClick={() => setLocation('/snippets')}>
          Cancel
        </Button>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <CodeSnippetForm 
          onSubmit={handleSubmit} 
          isSubmitting={createMutation.isPending}
        />
      </div>
    </div>
  );
};

export default CreateSnippetPage;