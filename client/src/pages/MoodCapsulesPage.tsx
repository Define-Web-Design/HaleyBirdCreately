
import React, { useState } from 'react';
import MoodCapsules from '../components/dashboard/MoodCapsules';
import MoodCapsuleForm from '../components/dashboard/MoodCapsuleForm';

// Mock content items for development
const mockContentItems = [
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

export default function MoodCapsulesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mood Capsules</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Emotionally grouped content to tell your creative story
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Create Capsule
        </button>
      </div>
      
      {showCreateForm ? (
        <MoodCapsuleForm 
          onSuccess={handleCreateSuccess} 
          onCancel={() => setShowCreateForm(false)}
          contentItems={mockContentItems}
        />
      ) : (
        <MoodCapsules key={refreshKey} />
      )}
    </div>
  );
}
