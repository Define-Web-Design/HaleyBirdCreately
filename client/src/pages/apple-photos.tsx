import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import ApplePhotosIntegration from '@/components/dashboard/ApplePhotosIntegration';
import ContentAnalysis from '@/components/dashboard/ContentAnalysis';
import { Plus, Settings, RefreshCw, Camera, Upload, Layers, Users, Tag, Clock, ImagePlus, Zap, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImportedPhoto {
  id: string;
  url: string;
  metadata: {
    createdAt: string;
    format: string;
    location?: string;
    people?: string[];
    tags?: string[];
  };
}

interface ContentSuggestion {
  id: string;
  title: string;
  description: string;
  photos: string[];
  type: 'collection' | 'story' | 'single';
  score: number;
}

export default function ApplePhotosPage() {
  const [activeTab, setActiveTab] = useState('import');
  const [importedPhotos, setImportedPhotos] = useState<ImportedPhoto[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ContentSuggestion | null>(null);
  const { toast } = useToast();

  // Simulate the scanning process when photos are imported
  useEffect(() => {
    if (importedPhotos.length > 0 && !isScanning && scanningProgress === 0) {
      handleScanPhotos();
    }
  }, [importedPhotos]);

  // Progress simulation for scanning
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning) {
      interval = setInterval(() => {
        setScanningProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            setIsScanning(false);
            generateContentSuggestions();
            return 100;
          }
          return newProgress;
        });
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning]);

  const handleImportComplete = (photos: ImportedPhoto[]) => {
    // Enhance the imported photos with additional metadata
    const enhancedPhotos = photos.map(photo => ({
      ...photo,
      metadata: {
        ...photo.metadata,
        location: Math.random() > 0.5 ? 'New York, NY' : 'San Francisco, CA',
        people: Math.random() > 0.5 ? ['John', 'Sarah'] : ['Mike', 'Emily', 'David'],
        tags: ['vacation', 'outdoors', Math.random() > 0.5 ? 'family' : 'friends']
      }
    }));
    
    setImportedPhotos(enhancedPhotos);
    setActiveTab('enhance');
    toast({
      title: "Photos Ready",
      description: "Your photos have been imported and are ready to enhance and analyze",
    });
  };

  const handleEnhancePhoto = (photoId: string) => {
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
  
  const handleScanPhotos = () => {
    setIsScanning(true);
    setScanningProgress(0);
    toast({
      title: "Scanning Photos",
      description: "Analyzing your photos to identify people, objects, and content groups",
    });
  };
  
  const generateContentSuggestions = () => {
    // Generate intelligent content suggestions based on the photos
    const suggestions: ContentSuggestion[] = [
      {
        id: '1',
        title: 'Weekend Trip Collection',
        description: 'A curated collection of your weekend getaway photos, perfect for sharing on social media.',
        photos: importedPhotos.slice(0, Math.min(4, importedPhotos.length)).map(p => p.id),
        type: 'collection',
        score: 92
      },
      {
        id: '2',
        title: 'Friends Meetup Story',
        description: 'A chronological story featuring your recent meetup with friends.',
        photos: importedPhotos.slice(0, Math.min(3, importedPhotos.length)).map(p => p.id),
        type: 'story',
        score: 88
      },
      {
        id: '3',
        title: 'Featured Portrait',
        description: 'This portrait stands out from your recent photos and would make great profile content.',
        photos: importedPhotos.slice(0, 1).map(p => p.id),
        type: 'single',
        score: 95
      }
    ];
    
    setContentSuggestions(suggestions);
    
    toast({
      title: "Analysis Complete",
      description: `Created ${suggestions.length} content suggestions from your photos`,
    });
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
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="whitespace-nowrap">
            <Settings className="mr-2 h-4 w-4" />
            Integration Settings
          </Button>
          <Button variant="default" size="sm" className="whitespace-nowrap">
            <Plus className="mr-2 h-4 w-4" />
            Add Photos
          </Button>
        </div>
      </div>

      <Separator />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
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
          <TabsTrigger value="repurpose">
            <Layers className="mr-2 h-4 w-4" />
            Content Repurposing
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
                      {importedPhotos[selectedPhoto].metadata.location && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Location: </span>
                          {importedPhotos[selectedPhoto].metadata.location}
                        </div>
                      )}
                      {importedPhotos[selectedPhoto].metadata.people && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">People: </span>
                          {importedPhotos[selectedPhoto].metadata.people.join(', ')}
                        </div>
                      )}
                    </div>
                    {importedPhotos[selectedPhoto].metadata.tags && (
                      <div className="mt-4">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">Tags: </span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {importedPhotos[selectedPhoto].metadata.tags.map((tag, i) => (
                            <Badge key={`tag-${i}`} variant="outline" className="bg-gray-100 dark:bg-gray-800">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
                // Using a content ID as string for demonstration
                <ContentAnalysis contentId="1" />
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
        
        <TabsContent value="repurpose" className="mt-0">
          <div className="grid grid-cols-1 gap-6">
            {importedPhotos.length > 0 ? (
              <>
                {isScanning ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analyzing Your Photos</CardTitle>
                      <CardDescription>
                        Scanning your photos to identify content groups and repurposing opportunities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Scanning progress</span>
                          <span>{Math.round(scanningProgress)}%</span>
                        </div>
                        <Progress value={scanningProgress} className="h-2" />
                      </div>
                      
                      <div className="border rounded p-4 bg-gray-50 dark:bg-gray-800/50 space-y-3 text-sm">
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Identifying people</p>
                            <p className="text-gray-500 dark:text-gray-400">Using facial recognition to group photos by people</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Tag className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Extracting themes and tags</p>
                            <p className="text-gray-500 dark:text-gray-400">Analyzing content to identify common themes</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-purple-500 mt-0.5" />
                          <div>
                            <p className="font-medium">Constructing timelines</p>
                            <p className="text-gray-500 dark:text-gray-400">Organizing content chronologically for storytelling</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : contentSuggestions.length > 0 ? (
                  <>
                    <Card className="border-t-4 border-t-primary">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>Content Repurposing Suggestions</CardTitle>
                            <CardDescription>
                              AI-generated content ideas based on your photos while maintaining authenticity
                            </CardDescription>
                          </div>
                          <Button size="sm" variant="outline" onClick={handleScanPhotos}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Rescan
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {contentSuggestions.map((suggestion) => (
                            <Card 
                              key={suggestion.id} 
                              className={`overflow-hidden ${
                                selectedSuggestion?.id === suggestion.id ? 'ring-2 ring-primary' : ''
                              }`}
                            >
                              <div className="relative">
                                <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                  {suggestion.type === 'collection' && (
                                    <div className="grid grid-cols-2 h-full">
                                      {suggestion.photos.slice(0, 4).map((photoId, index) => {
                                        const photo = importedPhotos.find(p => p.id === photoId);
                                        return photo ? (
                                          <div key={photoId} className="relative overflow-hidden">
                                            <img 
                                              src={photo.url} 
                                              alt={`Collection photo ${index + 1}`}
                                              className="object-cover h-full w-full"
                                            />
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  
                                  {suggestion.type === 'story' && (
                                    <div className="flex h-full">
                                      {suggestion.photos.slice(0, 3).map((photoId, index) => {
                                        const photo = importedPhotos.find(p => p.id === photoId);
                                        return photo ? (
                                          <div key={photoId} className="flex-1 relative overflow-hidden">
                                            <img 
                                              src={photo.url} 
                                              alt={`Story photo ${index + 1}`}
                                              className="object-cover h-full w-full"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent opacity-60"></div>
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  
                                  {suggestion.type === 'single' && (
                                    <div className="h-full">
                                      {suggestion.photos.slice(0, 1).map((photoId) => {
                                        const photo = importedPhotos.find(p => p.id === photoId);
                                        return photo ? (
                                          <div key={photoId} className="h-full">
                                            <img 
                                              src={photo.url} 
                                              alt="Featured photo"
                                              className="object-cover h-full w-full"
                                            />
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="absolute top-2 right-2">
                                  <Badge className={`
                                    ${suggestion.type === 'collection' ? 'bg-blue-500' : ''}
                                    ${suggestion.type === 'story' ? 'bg-purple-500' : ''}
                                    ${suggestion.type === 'single' ? 'bg-green-500' : ''}
                                  `}>
                                    {suggestion.type === 'collection' && 'Collection'}
                                    {suggestion.type === 'story' && 'Story'}
                                    {suggestion.type === 'single' && 'Featured'}
                                  </Badge>
                                </div>
                              </div>
                              
                              <CardHeader className="pb-2">
                                <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                              </CardHeader>
                              
                              <CardContent className="pb-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {suggestion.description}
                                </p>
                              </CardContent>
                              
                              <CardFooter className="flex justify-between">
                                <div className="flex items-center text-sm">
                                  <Zap className="h-4 w-4 text-amber-500 mr-1" />
                                  <span>{suggestion.score}% Match</span>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => setSelectedSuggestion(suggestion)}
                                >
                                  Use This
                                </Button>
                              </CardFooter>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {selectedSuggestion && (
                      <Card className="border-t-4 border-t-green-500 mt-6">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <span>Share "{selectedSuggestion.title}"</span>
                            <Badge className="ml-2">{selectedSuggestion.type}</Badge>
                          </CardTitle>
                          <CardDescription>
                            Publish this content across your platforms while maintaining authenticity
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium mb-3">Preview</h3>
                              <div className="rounded-md overflow-hidden border bg-gray-50 dark:bg-gray-800">
                                <div className="aspect-video relative overflow-hidden">
                                  {selectedSuggestion.type === 'collection' && (
                                    <div className="grid grid-cols-2 h-full">
                                      {selectedSuggestion.photos.slice(0, 4).map((photoId, index) => {
                                        const photo = importedPhotos.find(p => p.id === photoId);
                                        return photo ? (
                                          <div key={photoId} className="relative overflow-hidden">
                                            <img 
                                              src={photo.url} 
                                              alt={`Collection photo ${index + 1}`}
                                              className="object-cover h-full w-full"
                                            />
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  
                                  {selectedSuggestion.type === 'story' && (
                                    <div className="flex h-full">
                                      {selectedSuggestion.photos.slice(0, 3).map((photoId, index) => {
                                        const photo = importedPhotos.find(p => p.id === photoId);
                                        return photo ? (
                                          <div key={photoId} className="flex-1 relative overflow-hidden">
                                            <img 
                                              src={photo.url} 
                                              alt={`Story photo ${index + 1}`}
                                              className="object-cover h-full w-full"
                                            />
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                  
                                  {selectedSuggestion.type === 'single' && (
                                    <div className="h-full">
                                      {selectedSuggestion.photos.slice(0, 1).map((photoId) => {
                                        const photo = importedPhotos.find(p => p.id === photoId);
                                        return photo ? (
                                          <div key={photoId} className="h-full">
                                            <img 
                                              src={photo.url} 
                                              alt="Featured photo"
                                              className="object-cover h-full w-full"
                                            />
                                          </div>
                                        ) : null;
                                      })}
                                    </div>
                                  )}
                                </div>
                                <div className="p-4">
                                  <h3 className="font-medium">{selectedSuggestion.title}</h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {selectedSuggestion.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h3 className="text-sm font-medium mb-3">Share to</h3>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <Button className="w-full" variant="outline">
                                    <ImagePlus className="mr-2 h-4 w-4" />
                                    Instagram
                                  </Button>
                                  <Button className="w-full" variant="outline">
                                    <Share2 className="mr-2 h-4 w-4" />
                                    Twitter
                                  </Button>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button className="w-full" variant="outline">
                                    <Users className="mr-2 h-4 w-4" />
                                    Facebook
                                  </Button>
                                  <Button className="w-full" variant="outline">
                                    <Layers className="mr-2 h-4 w-4" />
                                    TikTok
                                  </Button>
                                </div>
                                
                                <div className="mt-6">
                                  <Button className="w-full">
                                    Share Content
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Analyze Your Photos</CardTitle>
                      <CardDescription>
                        Scan your camera roll to find content repurposing opportunities
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-8">
                      <div className="max-w-md mx-auto">
                        <Layers className="h-16 w-16 text-gray-400 mb-4 mx-auto" />
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                          Let our AI analyze your photos to identify people, places, events, and themes to intelligently group your content while maintaining authenticity
                        </p>
                        <Button onClick={handleScanPhotos}>
                          <Camera className="mr-2 h-4 w-4" />
                          Scan Photos for Content Ideas
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No photos imported yet. Go to the Import tab to get started.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setActiveTab('import')}
                  >
                    Import Photos
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}