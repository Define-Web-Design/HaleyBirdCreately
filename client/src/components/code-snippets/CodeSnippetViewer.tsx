import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from '../../hooks/use-toast';
import { ProgrammingLanguage } from '../../../shared/schema';

interface CodeSnippetViewerProps {
  snippet: {
    id: string | number;
    title: string;
    description?: string;
    code: string;
    language: ProgrammingLanguage;
    tags?: string[];
    isPublic: boolean;
    shareId: string;
    viewCount: number;
    createdAt?: string;
    updatedAt?: string;
    userId: string | number;
  };
  isOwner?: boolean;
  showControls?: boolean;
  onDelete?: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  previewMode?: boolean;
}

const CodeSnippetViewer: React.FC<CodeSnippetViewerProps> = ({
  snippet,
  isOwner = false,
  showControls = true,
  onDelete,
  onEdit,
  previewMode = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [, setLocation] = useLocation();
  const [highlightedCode, setHighlightedCode] = useState<string>(snippet.code);

  // Function to highlight code using dynamic import of highlight.js
  useEffect(() => {
    const highlightCode = async () => {
      try {
        // Use dynamic import for better performance
        const hljs = await import('highlight.js');
        
        // Check if language is supported by highlight.js
        const language = snippet.language.toLowerCase();
        const result = hljs.default.highlight(
          snippet.code,
          { language, ignoreIllegals: true }
        );
        
        setHighlightedCode(result.value);
      } catch (error) {
        console.error('Failed to highlight code:', error);
        // Fallback to plain text if highlighting fails
        setHighlightedCode(snippet.code);
      }
    };

    highlightCode();
  }, [snippet.code, snippet.language]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet.code)
      .then(() => {
        setCopied(true);
        toast({
          title: 'Code copied!',
          description: 'The code snippet has been copied to your clipboard.',
          variant: 'default',
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((error) => {
        console.error('Failed to copy code:', error);
        toast({
          title: 'Failed to copy',
          description: 'Could not copy code to clipboard. Please try again.',
          variant: 'destructive',
        });
      });
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/snippets/share/${snippet.shareId}`;
    
    // Try to use the Web Share API if available
    if (navigator.share) {
      navigator.share({
        title: snippet.title,
        text: snippet.description || 'Check out this code snippet!',
        url: shareUrl,
      }).catch((error) => {
        console.error('Error sharing:', error);
        // Fallback to clipboard
        copyShareLink(shareUrl);
      });
    } else {
      // Fallback to clipboard
      copyShareLink(shareUrl);
    }
  };

  const copyShareLink = (url: string) => {
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: 'Share link copied!',
          description: 'The link to this snippet has been copied to your clipboard.',
          variant: 'default',
        });
      })
      .catch((error) => {
        console.error('Failed to copy share link:', error);
        toast({
          title: 'Failed to copy link',
          description: 'Could not copy the share link. Please try again.',
          variant: 'destructive',
        });
      });
  };

  return (
    <Card className={`w-full ${previewMode ? 'max-w-2xl mx-auto' : ''}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{snippet.title}</CardTitle>
            {snippet.description && (
              <CardDescription className="mt-1">{snippet.description}</CardDescription>
            )}
          </div>
          {showControls && (
            <div className="flex space-x-2">
              {isOwner && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEdit && onEdit(snippet.id)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onDelete && onDelete(snippet.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className="bg-blue-50">
            {snippet.language}
          </Badge>
          {snippet.tags?.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          <Badge variant={snippet.isPublic ? "default" : "outline"}>
            {snippet.isPublic ? 'Public' : 'Private'}
          </Badge>
          {snippet.viewCount > 0 && (
            <Badge variant="outline" className="ml-auto">
              {snippet.viewCount} {snippet.viewCount === 1 ? 'view' : 'views'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <pre className="rounded-md p-4 bg-gray-900 text-gray-100 overflow-x-auto">
            <code 
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
              className="text-sm font-mono"
            />
          </pre>
          <div className="absolute top-2 right-2 flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="bg-gray-800 hover:bg-gray-700 text-gray-200"
              onClick={copyToClipboard}
            >
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-600">
          {snippet.createdAt && (
            <span>Created: {new Date(snippet.createdAt).toLocaleDateString()}</span>
          )}
        </div>
        <Button 
          variant="outline" 
          onClick={handleShare}
        >
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CodeSnippetViewer;