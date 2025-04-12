import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { ProgrammingLanguage } from '../../../shared/schema';

interface CodeSnippet {
  id: string | number;
  title: string;
  description?: string;
  language: ProgrammingLanguage;
  tags?: string[];
  isPublic: boolean;
  viewCount: number;
  createdAt?: string;
  updatedAt?: string;
  userId: string | number;
}

interface CodeSnippetListProps {
  snippets: CodeSnippet[];
  isLoading?: boolean;
  currentUserId?: string | number;
}

const CodeSnippetList: React.FC<CodeSnippetListProps> = ({ 
  snippets, 
  isLoading = false,
  currentUserId
}) => {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [languageFilter, setLanguageFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'all' | 'my-snippets'>('all');

  // Filter snippets based on search term, language, and active tab
  const filteredSnippets = snippets.filter(snippet => {
    // Filter by tab (all or my snippets)
    if (activeTab === 'my-snippets' && snippet.userId !== currentUserId) {
      return false;
    }

    // Filter by search term
    const searchMatch = 
      snippet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (snippet.description && snippet.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));

    // Filter by language
    const languageMatch = languageFilter === 'all' || snippet.language === languageFilter;

    return searchMatch && languageMatch;
  });

  // Get unique languages from snippets
  const uniqueLanguages = Array.from(new Set(snippets.map(snippet => snippet.language)));

  const handleViewSnippet = (id: string | number) => {
    setLocation(`/snippets/${id}`);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading snippets...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex-1">
          <Input
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={languageFilter}
            onValueChange={setLanguageFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Languages</SelectItem>
              {uniqueLanguages.map(language => (
                <SelectItem key={language} value={language}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentUserId && (
            <Button 
              variant="default"
              onClick={() => setLocation('/snippets/new')}
            >
              New Snippet
            </Button>
          )}
        </div>
      </div>

      {currentUserId && (
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'all' | 'my-snippets')}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="all">All Snippets</TabsTrigger>
            <TabsTrigger value="my-snippets">My Snippets</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {filteredSnippets.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-gray-500">No snippets found</p>
          {searchTerm && <p className="text-sm text-gray-400 mt-2">Try adjusting your search criteria</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSnippets.map(snippet => (
            <Card 
              key={snippet.id} 
              className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewSnippet(snippet.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-1">{snippet.title}</CardTitle>
                {snippet.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{snippet.description}</p>
                )}
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-blue-50">
                    {snippet.language}
                  </Badge>
                  {snippet.tags?.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                  {snippet.tags && snippet.tags.length > 3 && (
                    <Badge variant="outline">+{snippet.tags.length - 3}</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 mt-auto">
                  <span>{snippet.viewCount} {snippet.viewCount === 1 ? 'view' : 'views'}</span>
                  {snippet.createdAt && (
                    <span>{new Date(snippet.createdAt).toLocaleDateString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeSnippetList;