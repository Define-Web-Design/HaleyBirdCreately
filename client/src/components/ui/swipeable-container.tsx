import React, { useState, useRef, useEffect } from 'react';
import { useSwipe } from '@/lib/useGestures';

interface SwipeableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  disableSwipe?: boolean;
  children: React.ReactNode;
}

const SwipeableContainer: React.FC<SwipeableContainerProps> = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  swipeThreshold = 50,
  disableSwipe = false,
  children,
  className = '',
  ...props
}) => {
  // Get swipe handlers
  const { swipeHandlers, swipeDirection } = useSwipe({
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold: swipeThreshold,
    disabled: disableSwipe,
  });

  // Add visual feedback for swipe
  const [feedbackActive, setFeedbackActive] = useState(false);
  const [feedbackDirection, setFeedbackDirection] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (swipeDirection) {
      setFeedbackActive(true);
      setFeedbackDirection(swipeDirection);
      
      // Clear previous timeout if exists
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      
      // Clear feedback after animation
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedbackActive(false);
        setFeedbackDirection(null);
      }, 300);
    }
    
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [swipeDirection]);

  // Generate animation class based on swipe direction
  const getFeedbackClass = () => {
    if (!feedbackActive || !feedbackDirection) return '';
    
    const baseClass = 'transition-transform duration-300 ease-out';
    
    switch (feedbackDirection) {
      case 'left':
        return `${baseClass} -translate-x-2`;
      case 'right':
        return `${baseClass} translate-x-2`;
      case 'up':
        return `${baseClass} -translate-y-2`;
      case 'down':
        return `${baseClass} translate-y-2`;
      default:
        return '';
    }
  };

  return (
    <div
      className={`${className} ${getFeedbackClass()} touch-manipulation`}
      {...swipeHandlers}
      {...props}
    >
      {children}
    </div>
  );
};

export { SwipeableContainer };

// Example usage with a card component
interface SwipeableCardProps {
  title: string;
  content: React.ReactNode;
  onDismiss?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  swipeThreshold?: number;
  disableSwipe?: boolean;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  title,
  content,
  onDismiss,
  ...swipeProps
}) => {
  return (
    <SwipeableContainer
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 overflow-hidden"
      onSwipeLeft={onDismiss || swipeProps.onSwipeLeft}
      onSwipeRight={swipeProps.onSwipeRight}
      onSwipeUp={swipeProps.onSwipeUp}
      onSwipeDown={swipeProps.onSwipeDown}
      swipeThreshold={swipeProps.swipeThreshold}
      disableSwipe={swipeProps.disableSwipe}
    >
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <div>{content}</div>
    </SwipeableContainer>
  );
};