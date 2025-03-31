import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton'; // Added for loading indicator
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added for better error display


interface ContentItem {
  id: string | number;
  title?: string;
  description?: string;
  imageUrl?: string;
  platform?: string;
  type?: string;
  tags?: string[];
  moodAnalysis?: {
    mood: string;
    intensity: number;
    keywords: string[];
  };
}

interface MoodCapsule {
  id?: string;
  title: string;
  subtitle: string;
  caption: string;
  mood: string;
  items: ContentItem[];
  createdAt?: Date;
}

export default function MoodCapsules() {
  const [capsules, setCapsules] = useState<MoodCapsule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to generate mood capsules
  const generateCapsules = async () => {
    setLoading(true);
    setError(null);

    try {
      // This would normally fetch user's content from your API
      // For now, using placeholder data
      const userContent: ContentItem[] = [
        { 
          id: 1, 
          title: "Sunset at the beach", 
          description: "A beautiful, peaceful evening by the ocean",
          imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3Vuc2V0JTIwYmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60" 
        },
        { 
          id: 2, 
          title: "Coffee shop vibes", 
          description: "Productive morning with my favorite latte",
          imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29mZmVlJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
        },
        { 
          id: 3, 
          title: "City lights", 
          description: "Urban energy after dark",
          imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2l0eSUyMGxpZ2h0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
        },
        { 
          id: 4, 
          title: "Mountain hike", 
          description: "Conquering new heights",
          imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
        }
      ];

      const response = await axios.post('/api/mood-capsule', {
        content: userContent
      });

      if (response.data.success) {
        setCapsules(response.data.moodCapsules);
      } else {
        setError("Failed to generate mood capsules");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred while generating mood capsules");

      // Fallback to demo capsules for development
      setCapsules([
        {
          title: "Serene Moments",
          subtitle: "Times of peace and tranquility",
          caption: "A collection of quiet moments that bring calm to the chaos of everyday life. These are the breaths between the storms.",
          mood: "peaceful",
          items: [
            { 
              id: 1, 
              title: "Sunset at the beach", 
              description: "A beautiful, peaceful evening by the ocean",
              imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3Vuc2V0JTIwYmVhY2h8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60" 
            },
            { 
              id: 2, 
              title: "Coffee shop vibes", 
              description: "Productive morning with my favorite latte",
              imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y29mZmVlJTIwc2hvcHxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
            }
          ]
        },
        {
          title: "Urban Adventures",
          subtitle: "Exploring the concrete jungle",
          caption: "The pulse of the city beats through these moments, capturing the energy and excitement of urban life.",
          mood: "energetic",
          items: [
            { 
              id: 3, 
              title: "City lights", 
              description: "Urban energy after dark",
              imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y2l0eSUyMGxpZ2h0c3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60" 
            },
            { 
              id: 4, 
              title: "Mountain hike", 
              description: "Conquering new heights",
              imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fG1vdW50YWlufGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60" 
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateCapsules();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center p-12">
          <Skeleton className="w-16 h-16 rounded-full" /> {/* Replaced spinner with Skeleton */}
          <p className="mt-4 text-lg font-medium text-gray-600 dark:text-gray-300">Gathering your creative moments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className='flex justify-end'>
          <button 
            onClick={generateCapsules}
            className="mt-2 px-4 py-2 bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="mood-capsules p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Mood Capsules</h2>
        <button
          onClick={generateCapsules}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Refresh Capsules
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {capsules.map((capsule, index) => (
          <div
            key={index}
            className="capsule-card bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
          >
            <div className="p-5 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{capsule.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-1">{capsule.subtitle}</p>
            </div>

            <div className="p-5">
              <blockquote className="italic text-gray-700 dark:text-gray-300 border-l-4 border-primary pl-4 py-2 my-3">
                {capsule.caption}
              </blockquote>

              <div className="capsule-items grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 my-4">
                {capsule.items.map((item) => (
                  <HoverCard key={item.id}>
                    <HoverCardTrigger>
                      <div className="relative group overflow-hidden rounded-lg">
                        <img 
                          src={item.imageUrl || "https://via.placeholder.com/150"} 
                          alt={item.title || "Content item"} 
                          className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-72">
                      <div className="space-y-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                        {item.moodAnalysis && (
                          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mood: {item.moodAnalysis.mood}</span>
                            <div className="mt-1 h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary"
                                style={{ width: `${item.moodAnalysis.intensity}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm font-medium text-gray-600 dark:text-gray-300">
                  {capsule.mood}
                </span>
                <button className="text-primary hover:text-primary/80 font-medium transition-colors">
                  Share Capsule
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {capsules.length === 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No mood capsules found. Try creating some content first!</p>
        </div>
      )}
    </div>
  );
}