import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Image, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApplePhotosProps {
  onImportComplete?: (photos: any[]) => void;
}

export default function ApplePhotosIntegration({ onImportComplete }: ApplePhotosProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // In a real implementation, this would check if the user has already connected their Apple Photos account
  const { data: connectionStatus, isLoading: checkingConnection } = useQuery({
    queryKey: ['apple-photos-connection'],
    queryFn: async () => {
      // Simulated API call to check connection status
      return { isConnected: false };
    },
    // Prevent infinite re-renders by disabling automatic refetching
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  // This mutation would handle the actual connection to Apple Photos in a real implementation
  const connectMutation = useMutation({
    mutationFn: async () => {
      setIsConnecting(true);
      // In a real implementation, this would redirect to Apple's OAuth flow
      // For now, we'll simulate a successful connection after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Connected to Apple Photos",
        description: "Your account has been successfully connected",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['apple-photos-connection'] });
      setIsConnecting(false);
    },
    onError: () => {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Apple Photos. Please try again.",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  });

  // This mutation would handle importing selected photos in a real implementation
  const importMutation = useMutation({
    mutationFn: async (photoIds: string[]) => {
      // For demo purposes, simulate a successful import
      // In a real implementation, we would use apiRequest here
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Return mock data for the demo
      return { 
        success: true, 
        photos: photoIds.map(id => ({
          id,
          url: `https://images.unsplash.com/photo-168268${Math.floor(Math.random() * 9000000) + 1000000}`,
          metadata: {
            createdAt: new Date().toISOString(),
            format: 'JPEG'
          }
        }))
      };
    },
    onSuccess: (data) => {
      toast({
        title: "Photos Imported",
        description: `Successfully imported ${data.photos.length} photos`,
        variant: "default",
      });
      if (onImportComplete) {
        onImportComplete(data.photos);
      }
      setSelectedPhotos([]);
    },
    onError: () => {
      toast({
        title: "Import Failed",
        description: "Could not import photos. Please try again.",
        variant: "destructive",
      });
    }
  });

  // In a real implementation, this would fetch the user's Apple Photos library
  const { data: photosLibrary, isLoading: loadingPhotos } = useQuery({
    queryKey: ['apple-photos-library'],
    queryFn: async () => {
      // Simulated API call to get photos
      return [
        { id: 'photo1', url: 'https://images.unsplash.com/photo-1682687218147-9806132dc697', title: 'Beach sunset' },
        { id: 'photo2', url: 'https://images.unsplash.com/photo-1682687982501-1e58ab814714', title: 'Mountain view' },
        { id: 'photo3', url: 'https://images.unsplash.com/photo-1682695796497-31a44224d6d6', title: 'City skyline' },
        { id: 'photo4', url: 'https://images.unsplash.com/photo-1682685797743-3a763a7c3e5a', title: 'Forest path' },
      ];
    },
    enabled: connectionStatus?.isConnected || false,
    // Prevent infinite re-renders by disabling automatic refetching
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: Infinity
  });

  const handlePhotoSelect = (photoId: string) => {
    setSelectedPhotos(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId) 
        : [...prev, photoId]
    );
  };

  const handleImport = () => {
    if (selectedPhotos.length > 0) {
      importMutation.mutate(selectedPhotos);
    } else {
      toast({
        title: "No Photos Selected",
        description: "Please select at least one photo to import",
        variant: "default",
      });
    }
  };

  if (checkingConnection) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (!connectionStatus?.isConnected) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Connect to Apple Photos</CardTitle>
          <CardDescription>
            Import your photos from Apple Photos to enhance them with AI tools
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Image className="h-16 w-16 text-gray-400 mb-4" />
          <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
            Connect your Apple Photos account to import and enhance your photos
          </p>
          <Button 
            onClick={() => connectMutation.mutate()} 
            disabled={isConnecting}
            className="w-full max-w-sm"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect to Apple Photos"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Import from Apple Photos</CardTitle>
        <CardDescription>
          Select photos to import and enhance with AI tools
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingPhotos ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : photosLibrary && photosLibrary.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photosLibrary.map(photo => (
              <div 
                key={photo.id}
                className={`relative rounded-md overflow-hidden aspect-square cursor-pointer border-2 ${
                  selectedPhotos.includes(photo.id) 
                    ? 'border-primary' 
                    : 'border-transparent'
                }`}
                onClick={() => handlePhotoSelect(photo.id)}
              >
                <img 
                  src={photo.url} 
                  alt={photo.title} 
                  className="object-cover w-full h-full"
                />
                {selectedPhotos.includes(photo.id) && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No photos found in your Apple Photos library</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          {selectedPhotos.length} photos selected
        </p>
        <Button 
          onClick={handleImport} 
          disabled={selectedPhotos.length === 0 || importMutation.isPending}
        >
          {importMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : (
            "Import Selected Photos"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}