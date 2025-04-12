import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPublicCodeSnippets, getUserCodeSnippets } from '../../lib/api/code-snippets';
import CodeSnippetList from '../../components/code-snippets/CodeSnippetList';
import { useAuth } from '../../hooks/useAuth';

const SnippetsPage: React.FC = () => {
  const { user } = useAuth();

  // Fetch public snippets
  const publicSnippetsQuery = useQuery({
    queryKey: ['/api/snippets/public'],
    queryFn: getPublicCodeSnippets,
  });

  // Fetch user snippets if authenticated
  const userSnippetsQuery = useQuery({
    queryKey: ['/api/snippets/user'],
    queryFn: getUserCodeSnippets,
    enabled: !!user, // Only run if user is authenticated
  });

  // Combine public and user snippets, removing duplicates
  const allSnippets = React.useMemo(() => {
    const snippets = [...(publicSnippetsQuery.data || [])];
    
    if (userSnippetsQuery.data) {
      // Add user snippets that aren't already in the list
      userSnippetsQuery.data.forEach(userSnippet => {
        if (!snippets.some(s => s.id === userSnippet.id)) {
          snippets.push(userSnippet);
        }
      });
    }
    
    return snippets;
  }, [publicSnippetsQuery.data, userSnippetsQuery.data]);

  const isLoading = publicSnippetsQuery.isLoading || (!!user && userSnippetsQuery.isLoading);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Code Snippets</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <CodeSnippetList 
          snippets={allSnippets} 
          isLoading={isLoading}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
};

export default SnippetsPage;