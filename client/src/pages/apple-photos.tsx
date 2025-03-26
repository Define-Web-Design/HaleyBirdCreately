import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ApplePhotosIntegration from '@/components/dashboard/ApplePhotosIntegration';
import ContentAnalysis from '@/components/dashboard/ContentAnalysis';
import { Plus, Settings, RefreshCw, Camera, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportedPhoto {
  id: string;
  url: string;
  metadata: {
    createdAt: string;
    format: string;
  };
}

export default function ApplePhotosPage() {
  const [activeTab, setActiveTab] = useState('import');
  const [importedPhotos, setImportedPhotos] = useState<ImportedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const { toast } = useToast();

  const handleImportComplete = (photos: ImportedPhoto[]) => {
    setImportedPhotos(photos);
    setActiveTab('enhance');
    toast({
      title: "Photos Ready",
      description: "Your photos have been imported and are ready to enhance",
    });
  };

  const handleEnhancePhoto = (photoId: string) => {
    // In a real implementation, this would send the photo to the AI enhancement API
    toast({
      title: "Enhancement Started",
      description: "Your photo is being enhanced with AI tools",
    });
    // Simulate a successful enhancement
    setTimeout(() => {
      toast({
        title: "Enhancement Complete",
        description: "Your photo has been enhanced successfully",
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Apple Photos Integration</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Import, enhance, and manage your Apple Photos library
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Integration Settings
          </Button>
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Photos
          </Button>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="import">
            <Upload className="mr-2 h-4 w-4" />
            Import Photos
          </TabsTrigger>
          <TabsTrigger value="enhance">
            <RefreshCw className="mr-2 h-4 w-4" />
            Enhance Photos
          </TabsTrigger>
          <TabsTrigger value="analyze">
            <Camera className="mr-2 h-4 w-4" />
            Photo Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-0">
          <ApplePhotosIntegration onImportComplete={handleImportComplete} />
        </TabsContent>

        <TabsContent value="enhance" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Enhance Your Photos</CardTitle>
              <CardDescription>
                Apply AI enhancements to make your photos stand out
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importedPhotos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {importedPhotos.map((photo, index) => (
                    <div key={photo.id} className="space-y-3">
                      <div className="rounded-md overflow-hidden aspect-square">
                        <img 
                          src={photo.url} 
                          alt={`Imported photo ${index + 1}`} 
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          Photo {index + 1}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedPhoto(index);
                            handleEnhancePhoto(photo.id);
                          }}
                        >
                          Enhance
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No photos imported yet. Go to the Import tab to get started.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('import')}
                  >
                    Import Photos
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analyze" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              {selectedPhoto !== null && importedPhotos.length > 0 ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Photo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md overflow-hidden mb-4">
                      <img 
                        src={importedPhotos[selectedPhoto].url} 
                        alt={`Selected photo`} 
                        className="object-contain w-full max-h-[400px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Created: </span>
                        {new Date(importedPhotos[selectedPhoto].metadata.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Format: </span>
                        {importedPhotos[selectedPhoto].metadata.format}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No photo selected for analysis
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            <div>
              {selectedPhoto !== null ? (
                // Using a fake content ID for demonstration
                <ContentAnalysis contentId={1} />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Photo Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center py-6">
                    <p className="text-gray-500 dark:text-gray-400">
                      Select a photo to view AI analysis
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}