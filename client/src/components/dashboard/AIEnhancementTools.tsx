import ToolCard from '@/components/ui/tool-card';
import { ENHANCEMENT_TOOLS } from '@/lib/constants';
import { ToolCard as ToolCardType } from '@/lib/types';

interface AIEnhancementToolsProps {
  onToolSelect?: (toolName: string) => void;
}

const AIEnhancementTools = ({ onToolSelect }: AIEnhancementToolsProps) => {
  // Prepare tools with click handlers
  const tools: ToolCardType[] = ENHANCEMENT_TOOLS.map(tool => ({
    ...tool,
    onClick: () => onToolSelect?.(tool.title),
    buttonText: tool.title === 'Mood Board Generator' ? 'Create Mood Board' : 
                tool.title === 'Caption Generator' ? 'Generate New Caption' : 
                'Adapt Content'
  }));

  return (
    <section className="mb-8 animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-['SF_Pro_Display'] font-semibold">AI Enhancement Tools</h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          View All <i className="fas fa-chevron-right ml-1"></i>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mood Board Generator */}
        <ToolCard tool={tools[0]}>
          <div className="grid grid-cols-3 gap-2 mt-2 mb-4">
            <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Mood inspiration" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1490750967868-88aa4486c946?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Mood inspiration" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-square rounded bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img src="https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="Mood inspiration" className="w-full h-full object-cover" />
            </div>
          </div>
        </ToolCard>
        
        {/* Caption Generator */}
        <ToolCard tool={tools[1]}>
          <div className="bg-white dark:bg-gray-900 rounded-lg p-3 mb-4 text-sm">
            <p className="font-medium mb-1">Recent Generation:</p>
            <p className="text-gray-600 dark:text-gray-300">
              "Embracing minimalism isn't just about aesthetics—it's a lifestyle that brings clarity to both your space and mind. #MinimalistLiving #IntentionalDesign"
            </p>
            <div className="flex justify-end mt-2">
              <button className="text-primary text-xs transition-colors hover:text-primary/80">
                <i className="far fa-copy mr-1"></i> Copy
              </button>
            </div>
          </div>
        </ToolCard>
        
        {/* Cross-Platform Adapter */}
        <ToolCard tool={tools[2]}>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 mx-auto flex items-center justify-center">
                <i className="fab fa-instagram text-xl text-pink-600"></i>
              </div>
              <p className="text-xs mt-1">Instagram</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 mx-auto flex items-center justify-center">
                <i className="fab fa-tiktok text-xl text-black dark:text-white"></i>
              </div>
              <p className="text-xs mt-1">TikTok</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-700 mx-auto flex items-center justify-center">
                <i className="fab fa-pinterest text-xl text-red-600"></i>
              </div>
              <p className="text-xs mt-1">Pinterest</p>
            </div>
          </div>
        </ToolCard>
      </div>
    </section>
  );
};

export default AIEnhancementTools;
