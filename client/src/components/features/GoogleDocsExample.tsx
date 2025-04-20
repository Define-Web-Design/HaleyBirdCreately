
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import * as googleDocs from '@/utils/google-docs';

export default function GoogleDocsExample() {
  const { user } = useAuth();
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [fetchDocumentId, setFetchDocumentId] = useState('');
  const [fetchedContent, setFetchedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if we have Google API access token
  const hasToken = !!user?.googleAccessToken;

  const handleCreateDocument = async () => {
    if (!hasToken || !documentTitle) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const document = await googleDocs.createDocument(
        user.googleAccessToken!, 
        documentTitle
      );
      
      setDocumentId(document.documentId!);
      setSuccess(`Document created with ID: ${document.documentId}`);
      
      // If content was provided, insert it
      if (documentContent) {
        await googleDocs.insertText(
          user.googleAccessToken!,
          document.documentId!,
          documentContent
        );
        setSuccess(`Document created and content inserted`);
      }
    } catch (err: any) {
      setError(`Error creating document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchDocument = async () => {
    if (!hasToken || !fetchDocumentId) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const content = await googleDocs.getDocumentContent(
        user.googleAccessToken!,
        fetchDocumentId
      );
      setFetchedContent(content);
      setSuccess('Document fetched successfully');
    } catch (err: any) {
      setError(`Error fetching document: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!hasToken) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Google Docs Integration</CardTitle>
          <CardDescription>
            You need to authenticate with Google to use this feature
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              Please log in with Google and ensure your account has access to Google Docs API
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Google Docs Integration</CardTitle>
        <CardDescription>
          Create and fetch Google Docs documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Create a Document</h3>
          <div className="space-y-2">
            <Input
              placeholder="Document Title"
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
            />
            <Textarea
              placeholder="Document Content"
              value={documentContent}
              onChange={(e) => setDocumentContent(e.target.value)}
              rows={4}
            />
            <Button 
              onClick={handleCreateDocument} 
              disabled={loading || !documentTitle}
            >
              {loading ? 'Creating...' : 'Create Document'}
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Fetch a Document</h3>
          <div className="space-y-2">
            <Input
              placeholder="Document ID"
              value={fetchDocumentId}
              onChange={(e) => setFetchDocumentId(e.target.value)}
            />
            <Button 
              onClick={handleFetchDocument} 
              disabled={loading || !fetchDocumentId}
            >
              {loading ? 'Fetching...' : 'Fetch Document'}
            </Button>
          </div>
          
          {fetchedContent && (
            <div className="mt-4">
              <h4 className="text-md font-medium mb-2">Document Content:</h4>
              <div className="p-4 bg-gray-50 rounded border">
                <pre className="whitespace-pre-wrap">{fetchedContent}</pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Make sure your Google account has the necessary permissions to access Docs API
      </CardFooter>
    </Card>
  );
}
