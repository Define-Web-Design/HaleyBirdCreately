import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Share2, Copy, Twitter, Instagram, Facebook, Link, Check, Users } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ColorPalette {
  id: number;
  name: string;
  colors: string[];
  author: {
    name: string;
    avatar?: string;
  };
  collaborators?: {
    name: string;
    avatar?: string;
  }[];
  isPublic: boolean;
  createdAt: string;
}

const CollaborativePaletteSharing = () => {
  const [selectedPalette, setSelectedPalette] = useState<ColorPalette | null>(null);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [socialPreviewType, setSocialPreviewType] = useState<'twitter' | 'instagram' | 'facebook'>('twitter');

  // Example palette data
  const palette: ColorPalette = {
    id: 123,
    name: "Summer Sunset",
    colors: ["#FF5E5B", "#D8D8D8", "#FFFFEA", "#00CECB", "#FFED66"],
    author: {
      name: "Sarah Chen",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80"
    },
    collaborators: [
      {
        name: "Alex Kim",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80"
      },
      {
        name: "Jordan Lee",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80"
      }
    ],
    isPublic: true,
    createdAt: new Date().toISOString()
  };

  const handleShare = (palette: ColorPalette) => {
    setSelectedPalette(palette);
    setIsPublic(palette.isPublic);
    setShareLink(`https://creately.com/palette/${palette.id}`);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateSocialPreview = (type: 'twitter' | 'instagram' | 'facebook') => {
    // In a real app, this would generate a properly formatted preview for each platform
    return (
      <div className={`rounded-lg overflow-hidden border border-border ${
        type === 'instagram' ? 'aspect-square' : type === 'twitter' ? 'aspect-[2/1]' : 'aspect-[1.91/1]'
      }`}>
        <div className="relative w-full h-full bg-card flex flex-col">
          {/* Color palette display */}
          <div className="flex flex-1">
            {selectedPalette?.colors.map((color, index) => (
              <div 
                key={index} 
                className="flex-1 h-full flex items-end justify-center pb-2"
                style={{ backgroundColor: color }}
              >
                <span className="text-xs font-mono bg-black/40 text-white px-1.5 py-0.5 rounded">
                  {color}
                </span>
              </div>
            ))}
          </div>
          
          {/* Platform-specific footer */}
          <div className="p-3 bg-background border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">C</div>
                <span className="text-sm font-medium">
                  {selectedPalette?.name} · Creately
                </span>
              </div>
              {type === 'twitter' && <Twitter className="h-4 w-4 text-[#1DA1F2]" />}
              {type === 'instagram' && <Instagram className="h-4 w-4 text-[#E1306C]" />}
              {type === 'facebook' && <Facebook className="h-4 w-4 text-[#4267B2]" />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Collaborative Sharing</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 gap-1.5"
            onClick={() => handleShare(palette)}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Share your palette with teammates or on social media
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        <div className="space-y-4">
          {/* Current palette preview */}
          <div className="bg-card border border-border rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">{palette.name}</h3>
              <Badge variant="outline" className="text-xs px-2 py-0.5">
                {palette.isPublic ? 'Public' : 'Private'}
              </Badge>
            </div>
            
            <div className="flex mb-3">
              {palette.colors.map((color, index) => (
                <div 
                  key={index} 
                  className="h-10 flex-1" 
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Avatar className="h-6 w-6 border border-border">
                  <AvatarImage src={palette.author.avatar} alt={palette.author.name} />
                  <AvatarFallback>{palette.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs ml-2">{palette.author.name}</span>
              </div>
              
              <div className="flex -space-x-2">
                {palette.collaborators?.map((collaborator, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Avatar className="h-6 w-6 border-2 border-background">
                          <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                          <AvatarFallback>{collaborator.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{collaborator.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full bg-muted">
                  <Users className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Share Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <CardFooter className="p-3 pt-0 flex justify-center">
            <Button variant="link" size="sm" className="text-xs">
              View sharing options
            </Button>
          </CardFooter>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Color Palette</DialogTitle>
            <DialogDescription>
              Share your palette with others or on social media
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor="share-link" className="sr-only">Link</Label>
                <div className="flex">
                  <Input 
                    id="share-link" 
                    value={shareLink} 
                    readOnly 
                    className="rounded-r-none"
                  />
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    onClick={copyToClipboard}
                    className="rounded-l-none px-2"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="public" 
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public" className="text-sm">Public</Label>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Social Preview</h4>
              <Tabs defaultValue="twitter" onValueChange={(v) => setSocialPreviewType(v as any)}>
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="twitter">Twitter</TabsTrigger>
                  <TabsTrigger value="instagram">Instagram</TabsTrigger>
                  <TabsTrigger value="facebook">Facebook</TabsTrigger>
                </TabsList>
                
                <div className="mt-2 border border-border rounded-lg overflow-hidden">
                  <TabsContent value="twitter" className="m-0">
                    {generateSocialPreview('twitter')}
                  </TabsContent>
                  <TabsContent value="instagram" className="m-0">
                    {generateSocialPreview('instagram')}
                  </TabsContent>
                  <TabsContent value="facebook" className="m-0">
                    {generateSocialPreview('facebook')}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                <Twitter className="h-3.5 w-3.5" />
                Twitter
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                <Instagram className="h-3.5 w-3.5" />
                Instagram
              </Button>
              <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                <Facebook className="h-3.5 w-3.5" />
                Facebook
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default CollaborativePaletteSharing;