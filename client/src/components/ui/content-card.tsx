
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useMobile } from '@/hooks/use-mobile';
import { hapticFeedback, setTactileFeedback } from '@/hooks/use-mobile';
import { Edit, Share2, Wand2 } from 'lucide-react';

import { ContentItem } from '@/lib/types';

interface ContentCardProps {
  title?: string;
  subtitle?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  linkTo?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  onTap?: () => void;
  content?: ContentItem;
  onEdit?: (id: number) => void;
  onShare?: (id: number) => void;
  onEnhance?: (id: number) => void;
}

export function ContentCard({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  linkTo,
  actions,
  children,
  className = '',
  interactive = true,
  onTap,
  content,
  onEdit,
  onShare,
  onEnhance
}: ContentCardProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { isMobile, isTouchDevice } = useMobile();

  // Handle tap/click with haptic feedback
  const handleTap = () => {
    if (isTouchDevice) {
      hapticFeedback('light');
    }
    
    if (onTap) {
      onTap();
    }
  };

  // Determine appropriate animation properties based on device
  const getAnimationProps = () => {
    if (!interactive) {
      return {};
    }
    
    // Touch-specific animations for mobile
    if (isTouchDevice) {
      return {
        whileTap: { scale: 0.98 },
        transition: { duration: 0.2 },
        onTapStart: () => {
          setIsPressed(true);
          hapticFeedback('light');
        },
        onTapCancel: () => setIsPressed(false),
        onTap: handleTap,
        onTapEnd: () => setIsPressed(false)
      };
    }
    
    // Mouse hover animations for desktop
    return {
      whileHover: { scale: 1.02 },
      transition: { duration: 0.2 }
    };
  };

  // If content is provided, use that data
  const displayTitle = content ? content.title : title;
  const displayDescription = content ? content.description : description;
  const displayImage = content ? content.imageUrl : imageSrc;
  const displayLinkTo = linkTo || (content ? `/content/${content.id}` : undefined);
  
  // Wrap card content for interactive cards
  const CardWrapper = ({ children }: { children: React.ReactNode }) => {
    // If link is provided, wrap with Link component
    if (displayLinkTo) {
      return (
        <Link href={displayLinkTo} className="no-underline">
          <motion.div 
            className={`content-card w-full cursor-pointer ${isPressed ? 'shadow-sm' : 'shadow'} ${className}`} 
            {...getAnimationProps()}
          >
            {children}
          </motion.div>
        </Link>
      );
    }
    
    // Otherwise just use motion div
    return (
      <motion.div 
        className={`content-card w-full ${interactive ? 'cursor-pointer' : ''} ${isPressed ? 'shadow-sm' : 'shadow'} ${className}`} 
        {...(interactive ? getAnimationProps() : {})}
      >
        {children}
      </motion.div>
    );
  };

  // Create action buttons for content if needed
  const contentActions = content && (onEdit || onShare || onEnhance) ? (
    <div className="flex gap-2">
      {onEdit && 
        <Button size="sm" variant="outline" onClick={() => onEdit(content.id)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
      }
      {onShare && 
        <Button size="sm" variant="outline" onClick={() => onShare(content.id)}>
          <Share2 className="h-4 w-4 mr-1" /> Share
        </Button>
      }
      {onEnhance && 
        <Button size="sm" variant="outline" onClick={() => onEnhance(content.id)}>
          <Wand2 className="h-4 w-4 mr-1" /> Enhance
        </Button>
      }
    </div>
  ) : actions;

  return (
    <CardWrapper>
      <Card className="border overflow-hidden h-full">
        {displayImage && (
          <div className="w-full aspect-video overflow-hidden">
            <img 
              src={displayImage} 
              alt={imageAlt || displayTitle}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{displayTitle}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          {content?.status && (
            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
              {content.status}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {displayDescription && <p className="text-sm">{displayDescription}</p>}
          {content?.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {content.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-muted text-xs rounded-full">{tag}</span>
              ))}
            </div>
          )}
          {children}
        </CardContent>
        {(contentActions || actions) && (
          <CardFooter className="flex justify-end gap-2">
            {contentActions || actions}
          </CardFooter>
        )}
      </Card>
    </CardWrapper>
  );
}

export default ContentCard;
