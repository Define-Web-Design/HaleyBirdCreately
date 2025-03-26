import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import AIEnhancementTools from '@/components/dashboard/AIEnhancementTools';
import { MoodBoard } from '@/lib/types';

const MoodBoardsPage = () => {
  const { toast } = useToast();
  
  // Query for mood boards data
  const { data: moodBoards, isLoading } = useQuery<MoodBoard[] | null>({
    queryKey: ['/api/mood-boards'],
    enabled: false, // Disabled for now
  });

  // Handle tool selection
  const handleToolSelect = (toolName: string) => {
    toast({
      title: toolName,
      description: `Opening ${toolName} tool`,
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-['SF_Pro_Display'] font-bold mb-2">Mood Boards</h1>
        <p className="text-gray-600 dark:text-gray-300">Create and organize visual inspiration for your content</p>
      </div>
      
      <AIEnhancementTools onToolSelect={handleToolSelect} />
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Your Mood Boards</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : moodBoards && moodBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {moodBoards.map((board) => (
              <div 
                key={board.id} 
                className="bg-gradient-to-br from-primary/5 to-secondary/5 dark:from-primary/10 dark:to-secondary/10 rounded-lg p-4 border border-primary/10 hover:shadow-md transition-shadow cursor-pointer"
              >
                <h3 className="font-medium mb-2">{board.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{board.description}</p>
                <div className="grid grid-cols-3 gap-2">
                  {board.images.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="aspect-square rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
                      <img src={img} alt={`Mood image ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6">
            <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't created any mood boards yet.</p>
            <button 
              className="bg-gradient-to-r from-primary to-secondary text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              onClick={() => handleToolSelect('Mood Board Generator')}
            >
              <i className="fas fa-palette mr-2"></i> Create Your First Mood Board
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MoodBoardsPage;
