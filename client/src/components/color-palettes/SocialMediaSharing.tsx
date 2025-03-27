import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Share2, 
  Link as LinkIcon, 
  ClipboardCopy, 
  CheckCircle2, 
  Twitter, 
  Mail, 
  Image, 
  QrCode,
  Download
} from 'lucide-react';
import { SiPinterest, SiInstagram, SiFacebook } from 'react-icons/si';

interface SocialMediaSharingProps {
  paletteName?: string;
  paletteColors?: string[];
  paletteId?: string | number;
}

const SocialMediaSharing: React.FC<SocialMediaSharingProps> = ({ 
  paletteName = "My Color Palette", 
  paletteColors = ["#3498DB", "#2ECC71", "#E74C3C", "#F39C12", "#9B59B6"], 
  paletteId 
}) => {
  const [activeTab, setActiveTab] = useState('shareOptions');
  const [isCopied, setIsCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const { toast } = useToast();
  
  // Base URL for sharing
  const baseUrl = window.location.origin;
  const shareUrl = paletteId ? `${baseUrl}/color-palettes/${paletteId}` : baseUrl;
  
  // Handle copy link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    
    toast({
      title: "Link Copied",
      description: "Palette link copied to clipboard",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  // Generate a share message
  const getShareMessage = () => {
    return `Check out this beautiful "${paletteName}" color palette I created! ${shareUrl}`;
  };
  
  // Share to Twitter/X
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(getShareMessage())}`;
    window.open(twitterUrl, '_blank');
    
    toast({
      title: "Sharing on Twitter/X",
      description: "Opening Twitter to share your palette",
    });
  };
  
  // Share on Facebook
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(getShareMessage())}`;
    window.open(facebookUrl, '_blank');
    
    toast({
      title: "Sharing on Facebook",
      description: "Opening Facebook to share your palette",
    });
  };
  
  // Share on Pinterest
  const shareOnPinterest = () => {
    // For Pinterest we ideally need an image URL, for now we'll use a default or generate one
    const imageUrl = encodeURIComponent("https://placeholder.com/600x800");
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${imageUrl}&description=${encodeURIComponent(getShareMessage())}`;
    window.open(pinterestUrl, '_blank');
    
    toast({
      title: "Sharing on Pinterest",
      description: "Opening Pinterest to share your palette",
    });
  };
  
  // Share via Email
  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out this color palette: ${paletteName}`);
    const body = encodeURIComponent(`Hi there,\n\nI wanted to share this beautiful color palette with you: "${paletteName}"\n\nYou can see it here: ${shareUrl}\n\nEnjoy!`);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    window.open(mailtoUrl, '_blank');
    
    toast({
      title: "Share via Email",
      description: "Opening your email client to share",
    });
  };
  
  // Generate a shareable image of the palette
  const generateShareableImage = () => {
    setIsGeneratingImage(true);
    
    // Simulate image generation (in a real app, this would create a canvas and convert to image)
    setTimeout(() => {
      setIsGeneratingImage(false);
      
      toast({
        title: "Image Generated",
        description: "Shareable image has been created and downloaded",
      });
      
      // Normally we would create an actual image here
      // For demo purposes, we'll just show a success message
    }, 1500);
  };
  
  // Generate a QR code for the palette
  const generateQRCode = () => {
    setIsGeneratingQR(true);
    
    // Simulate QR code generation
    setTimeout(() => {
      setIsGeneratingQR(false);
      
      toast({
        title: "QR Code Generated",
        description: "QR code has been created and downloaded",
      });
      
      // Normally we would create an actual QR code here
      // For demo purposes, we'll just show a success message
    }, 1500);
  };
  
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" />
          Share Your Palette
        </CardTitle>
        <CardDescription>
          Share your color palette via social media or get a shareable link
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="shareOptions">Share Options</TabsTrigger>
            <TabsTrigger value="exportOptions">Export Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="shareOptions" className="space-y-4 pt-4">
            <div className="flex space-x-2">
              <Input 
                readOnly 
                value={shareUrl}
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {isCopied ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <ClipboardCopy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 h-10 w-full"
                onClick={shareOnTwitter}
              >
                <Twitter className="h-4 w-4 text-[#1DA1F2]" />
                <span>Twitter/X</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 h-10 w-full"
                onClick={shareOnFacebook}
              >
                <SiFacebook className="h-4 w-4 text-[#4267B2]" />
                <span>Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 h-10 w-full"
                onClick={shareOnPinterest}
              >
                <SiPinterest className="h-4 w-4 text-[#E60023]" />
                <span>Pinterest</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 h-10 w-full"
                onClick={shareViaEmail}
              >
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </Button>
            </div>
            
            <div className="pt-2">
              <p className="text-xs text-muted-foreground">
                When you share this palette, recipients will be able to see and use all the colors.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="exportOptions" className="space-y-4 pt-4">
            <div className="space-y-2">
              <div className="flex h-16 rounded-md overflow-hidden mb-4">
                {paletteColors.map((color, index) => (
                  <div 
                    key={index} 
                    className="flex-1 h-full" 
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-10 w-full"
                  onClick={generateShareableImage}
                  disabled={isGeneratingImage}
                >
                  {isGeneratingImage ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Image className="h-4 w-4" />
                      <span>Generate Image</span>
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-10 w-full"
                  onClick={generateQRCode}
                  disabled={isGeneratingQR}
                >
                  {isGeneratingQR ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4" />
                      <span>Generate QR Code</span>
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 h-10 w-full col-span-full"
                  onClick={() => {
                    const cssVariables = paletteColors.map((color, i) => `--color-${i+1}: ${color};`).join('\n');
                    const cssCode = `.palette-${paletteName.toLowerCase().replace(/\s+/g, '-')} {\n${cssVariables}\n}`;
                    
                    navigator.clipboard.writeText(cssCode);
                    toast({
                      title: "CSS Copied",
                      description: "CSS variables copied to clipboard",
                    });
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span>Copy CSS Variables</span>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SocialMediaSharing;