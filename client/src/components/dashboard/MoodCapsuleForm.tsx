
import React, { useState } from 'react';
import axios from 'axios';

interface ContentItem {
  id: string | number;
  title?: string;
  description?: string;
  imageUrl?: string;
}

interface Props {
  onSuccess?: (capsule: any) => void;
  onCancel?: () => void;
  contentItems?: ContentItem[];
}

export default function MoodCapsuleForm({ onSuccess, onCancel, contentItems = [] }: Props) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [customMood, setCustomMood] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const moodOptions = [
    'joyful', 'reflective', 'energetic', 'calm', 'nostalgic', 
    'excited', 'confident', 'hopeful', 'peaceful', 'custom'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (selectedItems.length === 0) {
      setError('Please select at least one content item');
      setLoading(false);
      return;
    }

    try {
      const mood = selectedMood === 'custom' ? customMood : selectedMood;
      
      // Filter content items based on selection
      const selectedContent = contentItems.filter(item => 
        selectedItems.includes(item.id.toString())
      );
      
      const response = await axios.post('/api/mood-capsule', {
        content: selectedContent,
        mood: mood || undefined
      });

      if (response.data.success && onSuccess) {
        onSuccess(response.data.moodCapsules[0]);
      } else {
        setError('Failed to create mood capsule');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while creating the mood capsule');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Create Mood Capsule</h3>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Select content and a mood to create an AI-powered capsule
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-5 space-y-5">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Content
          </label>
          
          {contentItems.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4 text-center">
              <p className="text-gray-500 dark:text-gray-400">No content items available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {contentItems.map(item => (
                <div 
                  key={item.id}
                  onClick={() => toggleItem(item.id.toString())}
                  className={`relative cursor-pointer rounded-md overflow-hidden border-2 ${
                    selectedItems.includes(item.id.toString()) 
                      ? 'border-primary' 
                      : 'border-transparent'
                  }`}
                >
                  <img 
                    src={item.imageUrl || "https://via.placeholder.com/150"} 
                    alt={item.title || "Content item"} 
                    className="w-full h-24 object-cover"
                  />
                  {selectedItems.includes(item.id.toString()) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                        <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-black/50 py-1 px-2">
                    <p className="text-white text-xs truncate">{item.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Mood
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {moodOptions.map(mood => (
              <div 
                key={mood}
                onClick={() => setSelectedMood(mood)}
                className={`px-3 py-2 rounded-md text-center cursor-pointer ${
                  selectedMood === mood 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </div>
            ))}
          </div>
          
          {selectedMood === 'custom' && (
            <input
              type="text"
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              placeholder="Enter custom mood"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          )}
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || selectedItems.length === 0}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Capsule'}
          </button>
        </div>
      </form>
    </div>
  );
}
