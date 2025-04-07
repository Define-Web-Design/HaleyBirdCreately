import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Smile, Heart, ThumbsUp, Flame, Star, Clock } from 'lucide-react';

interface ColorPalette {
  id: number;
  name: string;
  colors: string[];
  author: {
    name: string;
    avatar?: string;
  };
  reactions: {
    emoji: string;
    count: number;
    userIds: number[];
  }[];
  createdAt: string;
}

interface Reaction {
  emoji: string;
  icon: React.ReactNode;
  label: string;
}

const AVAILABLE_REACTIONS: Reaction[] = [
  { emoji: '❤️', icon: <Heart className="h-3.5 w-3.5 text-red-500" />, label: 'Love' },
  { emoji: '👍', icon: <ThumbsUp className="h-3.5 w-3.5 text-blue-500" />, label: 'Like' },
  { emoji: '🔥', icon: <Flame className="h-3.5 w-3.5 text-orange-500" />, label: 'Fire' },
  { emoji: '⭐', icon: <Star className="h-3.5 w-3.5 text-yellow-500" />, label: 'Star' },
  { emoji: '😍', icon: <Smile className="h-3.5 w-3.5 text-pink-500" />, label: 'Love it' }
];

const EmojiReaction = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'recent'>('trending');
  const [currentUserId] = useState(1); // Mock current user ID
  
  // Example palettes data
  const [palettes, setPalettes] = useState<ColorPalette[]>([
    {
      id: 1,
      name: "Sunset Gradient",
      colors: ["#FF9A8B", "#FF6A88", "#FF99AC", "#FCB5B5", "#FFDAB9"],
      author: {
        name: "Emma Lee",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80"
      },
      reactions: [
        { emoji: '❤️', count: 24, userIds: [2, 3, 4] },
        { emoji: '🔥', count: 18, userIds: [5, 6] },
        { emoji: '👍', count: 12, userIds: [1, 7, 8] }
      ],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      name: "Ocean Breeze",
      colors: ["#48CAE4", "#90E0EF", "#ADE8F4", "#CAF0F8", "#03045E"],
      author: {
        name: "Noah Wilson",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80"
      },
      reactions: [
        { emoji: '❤️', count: 32, userIds: [9, 10] },
        { emoji: '⭐', count: 27, userIds: [1, 11, 12] }
      ],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: "Forest Meditation",
      colors: ["#2B9348", "#55A630", "#80B918", "#AACC00", "#BFD200"],
      author: {
        name: "Olivia Chen",
        avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80"
      },
      reactions: [
        { emoji: '😍', count: 15, userIds: [13, 14] },
        { emoji: '👍', count: 9, userIds: [] }
      ],
      createdAt: new Date().toISOString()
    }
  ]);

  const handleReaction = (paletteId: number, emoji: string) => {
    setPalettes(palettes.map(palette => {
      if (palette.id === paletteId) {
        // Find if this reaction already exists
        const reactionIndex = palette.reactions.findIndex(r => r.emoji === emoji);
        
        if (reactionIndex > -1) {
          // Check if user already reacted
          const userReacted = palette.reactions[reactionIndex].userIds.includes(currentUserId);
          
          if (userReacted) {
            // Remove user's reaction
            const updatedReaction = {
              ...palette.reactions[reactionIndex],
              count: palette.reactions[reactionIndex].count - 1,
              userIds: palette.reactions[reactionIndex].userIds.filter(id => id !== currentUserId)
            };
            
            // If count is zero, remove the reaction type
            if (updatedReaction.count === 0) {
              return {
                ...palette,
                reactions: palette.reactions.filter((_, i) => i !== reactionIndex)
              };
            }
            
            // Otherwise update the reaction
            const newReactions = [...palette.reactions];
            newReactions[reactionIndex] = updatedReaction;
            
            return {
              ...palette,
              reactions: newReactions
            };
          } else {
            // Add user's reaction
            const updatedReaction = {
              ...palette.reactions[reactionIndex],
              count: palette.reactions[reactionIndex].count + 1,
              userIds: [...palette.reactions[reactionIndex].userIds, currentUserId]
            };
            
            const newReactions = [...palette.reactions];
            newReactions[reactionIndex] = updatedReaction;
            
            return {
              ...palette,
              reactions: newReactions
            };
          }
        } else {
          // Create new reaction type
          return {
            ...palette,
            reactions: [...palette.reactions, { emoji, count: 1, userIds: [currentUserId] }]
          };
        }
      }
      return palette;
    }));
  };

  const hasUserReacted = (reactions: ColorPalette['reactions'], emoji: string): boolean => {
    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction ? reaction.userIds.includes(currentUserId) : false;
  };

  const getReactionCount = (reactions: ColorPalette['reactions'], emoji: string): number => {
    const reaction = reactions.find(r => r.emoji === emoji);
    return reaction ? reaction.count : 0;
  };

  // Sort palettes based on tab
  const sortedPalettes = [...palettes].sort((a, b) => {
    if (activeTab === 'trending') {
      // Sort by total reactions count
      const totalReactionsA = a.reactions.reduce((sum, r) => sum + r.count, 0);
      const totalReactionsB = b.reactions.reduce((sum, r) => sum + r.count, 0);
      return totalReactionsB - totalReactionsA;
    } else {
      // Sort by creation date
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Reactions</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">React to palettes</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          Express how you feel about color palettes
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="trending" onValueChange={(v) => setActiveTab(v as any)}>
        <div className="px-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="trending" className="mt-0">
          <CardContent className="p-4 pt-2 max-h-[320px] overflow-y-auto">
            <div className="space-y-3">
              {sortedPalettes.map((palette) => (
                <PaletteCard 
                  key={palette.id}
                  palette={palette}
                  availableReactions={AVAILABLE_REACTIONS}
                  onReact={(emoji) => handleReaction(palette.id, emoji)}
                  hasUserReacted={hasUserReacted}
                  getReactionCount={getReactionCount}
                />
              ))}
            </div>
          </CardContent>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-0">
          <CardContent className="p-4 pt-2 max-h-[320px] overflow-y-auto">
            <div className="space-y-3">
              {sortedPalettes.map((palette) => (
                <PaletteCard 
                  key={palette.id}
                  palette={palette}
                  availableReactions={AVAILABLE_REACTIONS}
                  onReact={(emoji) => handleReaction(palette.id, emoji)}
                  hasUserReacted={hasUserReacted}
                  getReactionCount={getReactionCount}
                />
              ))}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="p-3 pt-0 flex justify-center">
        <Button variant="link" size="sm" className="text-xs">
          View all trending palettes
        </Button>
      </CardFooter>
    </Card>
  );
};

interface PaletteCardProps {
  palette: ColorPalette;
  availableReactions: Reaction[];
  onReact: (emoji: string) => void;
  hasUserReacted: (reactions: ColorPalette['reactions'], emoji: string) => boolean;
  getReactionCount: (reactions: ColorPalette['reactions'], emoji: string) => number;
}

const PaletteCard = ({ 
  palette, 
  availableReactions, 
  onReact,
  hasUserReacted,
  getReactionCount
}: PaletteCardProps) => {
  const totalReactions = palette.reactions.reduce((sum, r) => sum + r.count, 0);
  
  return (
    <div className="border border-border rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 border border-border">
            <AvatarImage src={palette.author.avatar} alt={palette.author.name} />
            <AvatarFallback>{palette.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{palette.name}</span>
        </div>
        <div className="flex items-center text-xs text-muted-foreground">
          <Clock className="h-3 w-3 mr-1" />
          <time dateTime={new Date(palette.createdAt).toISOString()}>
            {new Date(palette.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </time>
        </div>
      </div>
      
      <div className="flex rounded-md overflow-hidden mb-3">
        {palette.colors.map((color, index) => (
          <div 
            key={index} 
            className="h-8 flex-1" 
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex gap-1">
          {availableReactions.map((reaction) => {
            const hasReacted = hasUserReacted(palette.reactions, reaction.emoji);
            const count = getReactionCount(palette.reactions, reaction.emoji);
            return count > 0 ? (
              <Badge 
                key={reaction.emoji}
                variant={hasReacted ? "default" : "outline"}
                className={`text-xs px-2 py-0 h-6 gap-1 cursor-pointer transition-all ${
                  hasReacted ? 'bg-primary/20 hover:bg-primary/30 text-primary' : 'hover:bg-muted'
                }`}
                onClick={() => onReact(reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                <span>{count}</span>
              </Badge>
            ) : null;
          })}
        </div>
        
        <div className="relative group">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 w-7 rounded-full p-0" 
            aria-label="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <div className="absolute bottom-full right-0 mb-2 bg-background border border-border rounded-lg shadow-md p-1 hidden group-hover:flex flex-row opacity-0 group-hover:opacity-100 transition-opacity">
            {availableReactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 rounded-full"
                onClick={() => onReact(reaction.emoji)}
                aria-label={`React with ${reaction.label}`}
              >
                <span>{reaction.emoji}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      {totalReactions > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
        </div>
      )}
    </div>
  );
};

export default EmojiReaction;