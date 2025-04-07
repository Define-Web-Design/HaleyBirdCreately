
import React, { useState, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTouchSwipe } from "@/hooks/use-touch-swipe";
import { motion, AnimatePresence } from "framer-motion";
import { useMobile } from "@/hooks/use-mobile";
import { addTouchFeedback, HapticIntensity } from "@/lib/touchFeedback";
import { useEffect } from "react";

interface ContentCardProps {
  title: string;
  description?: string;
  image?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  date?: string;
  tags?: string[];
  onView?: () => void;
  onShare?: () => void;
  onDelete?: () => void;
  className?: string;
  children?: React.ReactNode;
  interactive?: boolean;
}

export function ContentCard({
  title,
  description,
  image,
  author,
  date,
  tags = [],
  onView,
  onShare,
  onDelete,
  className = "",
  children,
  interactive = true,
}: ContentCardProps) {
  const { isMobile, touchEnabled } = useMobile();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Setup swipe handlers for mobile
  const { ref: swipeRef, state: swipeState } = useTouchSwipe({
    onSwipeLeft: () => {
      if (isMobile && interactive) {
        setShowActions(true);
      }
    },
    onSwipeRight: () => {
      if (isMobile && interactive) {
        setShowActions(false);
      }
    },
  }, { threshold: 30 });
  
  // Set up the card element as the swipe target
  useEffect(() => {
    if (cardRef.current && swipeRef.current !== cardRef.current) {
      swipeRef.current = cardRef.current;
    }
  }, [cardRef, swipeRef]);
  
  // Add touch feedback to the card
  useEffect(() => {
    if (!cardRef.current || !touchEnabled || !interactive) return;
    
    const cleanup = addTouchFeedback(cardRef.current, {
      haptic: true,
      hapticIntensity: HapticIntensity.LIGHT,
      visualFeedback: true,
      activeClass: 'scale-[0.99]'
    });
    
    return cleanup;
  }, [touchEnabled, interactive]);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const handleCardClick = () => {
    if (interactive && onView) {
      onView();
    }
  };

  return (
    <Card 
      ref={cardRef}
      className={`relative overflow-hidden transition-all duration-200 ${
        interactive ? "cursor-pointer hover:shadow-md" : ""
      } ${isExpanded ? "scale-[1.02]" : ""} ${className}`}
      data-swipe-handler
      aria-expanded={isExpanded}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? handleCardClick : undefined}
      onKeyDown={interactive ? (e) => e.key === "Enter" && handleCardClick() : undefined}
    >
      {image && (
        <div className="relative w-full h-40 overflow-hidden">
          <img
            src={image}
            alt={`${title} preview`}
            className="w-full h-full object-cover transition-transform duration-200 ease-in-out"
            loading="lazy"
          />
          {tags.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[70%] justify-end">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      )}

      <CardHeader>
        <CardTitle className="line-clamp-2">{title}</CardTitle>
        {description && (
          <CardDescription className={isExpanded ? "" : "line-clamp-2"}>
            {description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <AnimatePresence>
          {(isExpanded || !isMobile) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {author && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={author.avatar} alt={author.name} />
                <AvatarFallback>
                  {author.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">{author.name}</span>
            </div>
          )}
          {date && <span className="text-xs text-muted-foreground">{date}</span>}
        </div>

        {isMobile && interactive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? "Less" : "More"}
          </Button>
        )}
      </CardFooter>

      {/* Swipeable actions panel for mobile */}
      {isMobile && interactive && (onShare || onDelete) && (
        <AnimatePresence>
          {showActions && (
            <motion.div
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 h-full bg-popover border-l flex flex-col items-center justify-center gap-2 px-2"
            >
              {onShare && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                  aria-label="Share"
                >
                  Share
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  aria-label="Delete"
                >
                  Delete
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Swipe indicator for mobile */}
      {isMobile && interactive && (onShare || onDelete) && !showActions && (
        <div 
          className="absolute top-0 right-0 h-full w-1 bg-primary opacity-20"
          aria-hidden="true"
        />
      )}
    </Card>
  );
}

export default ContentCard;
