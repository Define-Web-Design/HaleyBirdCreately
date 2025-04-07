import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, ThumbsUp, Calendar, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ColorPalette {
  id: number;
  name: string;
  colors: string[];
  tags: string[];
  createdAt: string;
  category?: string;
}

const ColorInspirationDigest = () => {
  const [digestType, setDigestType] = useState<'trending' | 'personalized' | 'new'>('personalized');
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  // Mock data for demonstration, would be replaced with actual API calls
  const { data: palettes, isLoading, refetch } = useQuery<ColorPalette[]>({
    queryKey: ['color-palettes', 'digest', digestType],
    queryFn: async () => {
      // In a real implementation, this would fetch from API based on digestType
      // For now, simulate a network request
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPalettes: ColorPalette[] = [
        {
          id: 1,
          name: "Ocean Tranquility",
          colors: ["#0077B6", "#00B4D8", "#90E0EF", "#CAF0F8", "#023E8A"],
          tags: ["calming", "professional", "water"],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          category: "Professional"
        },
        {
          id: 2,
          name: "Sunset Vibes",
          colors: ["#F72585", "#7209B7", "#3A0CA3", "#4361EE", "#4CC9F0"],
          tags: ["vibrant", "sunset", "energetic"],
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          category: "Vibrant"
        },
        {
          id: 3,
          name: "Forest Dreams",
          colors: ["#588157", "#3A5A40", "#344E41", "#A3B18A", "#DAD7CD"],
          tags: ["nature", "calming", "earthy"],
          createdAt: new Date().toISOString(),
          category: "Nature"
        }
      ];
      
      return mockPalettes;
    },
    enabled: true,
  });

  const handleRefresh = () => {
    refetch();
    setLastRefreshed(new Date());
  };

  // Format the last refreshed time
  const formatRefreshTime = () => {
    return lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Color Inspiration Digest</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="h-8 w-8 p-0" aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Last updated: {formatRefreshTime()}
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="personalized" className="w-full" onValueChange={(value) => setDigestType(value as any)}>
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personalized">For You</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="personalized" className="mt-0 pt-0">
          <DigestContent palettes={palettes || []} isLoading={isLoading} type="personalized" />
        </TabsContent>
        
        <TabsContent value="trending" className="mt-0 pt-0">
          <DigestContent palettes={palettes || []} isLoading={isLoading} type="trending" />
        </TabsContent>
        
        <TabsContent value="new" className="mt-0 pt-0">
          <DigestContent palettes={palettes || []} isLoading={isLoading} type="new" />
        </TabsContent>
      </Tabs>
      
      <CardFooter className="p-3 pt-0 flex justify-center">
        <Button variant="link" size="sm" className="text-xs">
          View all recommendations
        </Button>
      </CardFooter>
    </Card>
  );
};

// DigestContent component to display the palettes
interface DigestContentProps {
  palettes: ColorPalette[];
  isLoading: boolean;
  type: 'trending' | 'personalized' | 'new';
}

const DigestContent = ({ palettes, isLoading, type }: DigestContentProps) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded-md animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (palettes.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">No palettes available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {palettes.map((palette) => (
        <div 
          key={palette.id} 
          className="flex flex-col p-3 rounded-lg bg-card border border-border hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">{palette.name}</h4>
            <Badge variant="outline" className="text-xs px-2 h-5">
              {palette.category}
            </Badge>
          </div>
          
          <div className="flex gap-1 mb-2">
            {palette.colors.map((color, idx) => (
              <div 
                key={idx} 
                className="h-6 flex-1 rounded-sm" 
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>{new Date(palette.createdAt).toLocaleDateString()}</span>
            </div>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <ThumbsUp className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ColorInspirationDigest;