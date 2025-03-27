import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock,
  Edit, 
  Eye, 
  Archive, 
  Share2, 
  Image 
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import type { MoodCapsule } from '@/lib/types';
import { motion } from 'framer-motion';

interface MoodCapsuleCardProps {
  capsule: MoodCapsule;
  onView: (capsule: MoodCapsule) => void;
  onEdit: (capsule: MoodCapsule) => void;
}

const MoodCapsuleCard: React.FC<MoodCapsuleCardProps> = ({
  capsule,
  onView,
  onEdit
}) => {
  // Get relative time string (e.g., "3 days ago")
  const getRelativeTimeString = (date: Date | null) => {
    if (!date) return 'Unknown time';
    return formatDistance(new Date(date), new Date(), { addSuffix: true });
  };

  // Generate dynamic background based on emotional tone
  const getEmotionBackground = (tone: string) => {
    const toneMap: { [key: string]: string } = {
      'joyful': 'from-yellow-100 to-orange-100 dark:from-yellow-900/20 dark:to-orange-900/20',
      'nostalgic': 'from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20',
      'energetic': 'from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20',
      'peaceful': 'from-green-100 to-teal-100 dark:from-green-900/20 dark:to-teal-900/20',
      'romantic': 'from-pink-100 to-rose-100 dark:from-pink-900/20 dark:to-rose-900/20',
      'melancholic': 'from-blue-100 to-slate-100 dark:from-blue-900/20 dark:to-slate-900/20',
      'powerful': 'from-slate-100 to-zinc-100 dark:from-slate-900/20 dark:to-zinc-900/20',
      'mysterious': 'from-violet-100 to-slate-100 dark:from-violet-900/20 dark:to-slate-900/20',
    };
    return toneMap[tone.toLowerCase()] || 'from-gray-100 to-gray-200 dark:from-gray-800/20 dark:to-gray-700/20';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card className={`overflow-hidden border hover:shadow-md transition-all duration-300 ${
        capsule.isArchived ? 'opacity-70' : ''
      }`}>
        <div className={`h-3 w-full bg-gradient-to-r ${getEmotionBackground(capsule.emotionalTone)}`} />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg truncate">{capsule.name}</h3>
              <p className="text-muted-foreground text-sm mt-1 truncate">
                {capsule.description || 'No description provided'}
              </p>
            </div>
            
            <Badge variant="outline" className="ml-2 capitalize">
              {capsule.emotionalTone}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="flex items-center text-muted-foreground text-xs space-x-4 mb-4">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              <span>{getRelativeTimeString(capsule.createdAt)}</span>
            </div>
            <div className="flex items-center">
              <Image className="mr-1 h-3 w-3" />
              <span>{(capsule.contentIds?.length || 0)} items</span>
            </div>
          </div>
          
          {capsule.thumbnailUrl ? (
            <div className="relative aspect-video overflow-hidden rounded-md bg-muted">
              <img 
                src={capsule.thumbnailUrl} 
                alt={capsule.name} 
                className="object-cover w-full h-full transition-all hover:scale-105"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center aspect-video rounded-md bg-muted/50 border border-dashed">
              <span className="text-muted-foreground text-sm">No preview available</span>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onView(capsule)}
            className="text-xs"
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(capsule)}
              className="text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default MoodCapsuleCard;