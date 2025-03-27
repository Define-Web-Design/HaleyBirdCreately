import React from 'react';
import { cn } from '@/lib/utils';

interface MoodEmoji {
  emoji: string;
  label: string;
  animation: string;
  bgColor: string;
}

interface MoodLoadingProps {
  mood?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// Map of moods to emojis and animations
const MOOD_EMOJIS: Record<string, MoodEmoji> = {
  happy: { 
    emoji: '😊', 
    label: 'Happy', 
    animation: 'animate-bounce', 
    bgColor: 'bg-yellow-100' 
  },
  excited: { 
    emoji: '🎉', 
    label: 'Excited', 
    animation: 'animate-ping', 
    bgColor: 'bg-purple-100' 
  },
  calm: { 
    emoji: '😌', 
    label: 'Calm', 
    animation: 'animate-pulse', 
    bgColor: 'bg-blue-100' 
  },
  creative: { 
    emoji: '🎨', 
    label: 'Creative', 
    animation: 'animate-spin', 
    bgColor: 'bg-indigo-100' 
  },
  focused: { 
    emoji: '🧠', 
    label: 'Focused', 
    animation: 'animate-pulse', 
    bgColor: 'bg-emerald-100' 
  },
  energetic: { 
    emoji: '⚡', 
    label: 'Energetic', 
    animation: 'animate-bounce', 
    bgColor: 'bg-orange-100' 
  },
  relaxed: { 
    emoji: '🌊', 
    label: 'Relaxed', 
    animation: 'animate-pulse', 
    bgColor: 'bg-teal-100' 
  },
  inspired: { 
    emoji: '💡', 
    label: 'Inspired', 
    animation: 'animate-ping', 
    bgColor: 'bg-amber-100' 
  },
  melancholic: { 
    emoji: '😢', 
    label: 'Melancholic', 
    animation: 'animate-pulse', 
    bgColor: 'bg-slate-100' 
  },
  // Default for generic loading
  default: { 
    emoji: '🎨', 
    label: 'Loading', 
    animation: 'animate-spin', 
    bgColor: 'bg-gray-100' 
  }
};

const MoodLoading: React.FC<MoodLoadingProps> = ({ 
  mood = 'default',
  size = 'md',
  showLabel = true,
  className
}) => {
  // Get the mood emoji data or use default if not found
  const moodData = MOOD_EMOJIS[mood.toLowerCase()] || MOOD_EMOJIS.default;
  
  // Determine size class
  const sizeClass = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl'
  }[size];
  
  // Container size class
  const containerSizeClass = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-20 w-20'
  }[size];
  
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div 
        className={cn(
          'rounded-full flex items-center justify-center', 
          containerSizeClass,
          moodData.bgColor
        )}
      >
        <span className={cn(sizeClass, moodData.animation)}>
          {moodData.emoji}
        </span>
      </div>
      
      {showLabel && (
        <span className="mt-2 text-sm font-medium text-center">
          {moodData.label}
        </span>
      )}
    </div>
  );
};

// Loading group with multiple mood emojis
export const MoodLoadingGroup: React.FC<{ moods?: string[], className?: string }> = ({ 
  moods = ['happy', 'creative', 'calm'], 
  className 
}) => {
  return (
    <div className={cn('flex justify-center gap-4', className)}>
      {moods.map((mood, index) => (
        <MoodLoading 
          key={index} 
          mood={mood} 
          size="sm" 
          // Add a small delay to each subsequent emoji for a wave effect
          className={`transition-all animation-delay-${index * 150}`}
        />
      ))}
    </div>
  );
};

export default MoodLoading;