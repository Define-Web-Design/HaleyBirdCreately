import { ContentItem } from '@/lib/types';

interface ContentCardProps {
  content: ContentItem;
  onEdit?: (id: number) => void;
  onShare?: (id: number) => void;
  onEnhance?: (id: number) => void;
}

const ContentCard = ({ content, onEdit, onShare, onEnhance }: ContentCardProps) => {
  // Platform icon mapping
  const getPlatformIcon = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'instagram': return 'fab fa-instagram';
      case 'tiktok': return 'fab fa-tiktok';
      case 'pinterest': return 'fab fa-pinterest';
      case 'twitter': return 'fab fa-twitter';
      default: return 'fas fa-globe';
    }
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Posted':
        return {
          bg: 'bg-accent/10 text-accent',
          text: 'High Engagement'
        };
      case 'Scheduled':
        return {
          bg: 'bg-secondary/10 text-secondary',
          text: 'Trending Topic'
        };
      case 'Draft':
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
          text: 'In Progress'
        };
    }
  };

  const statusBadge = getStatusBadge(content.status);

  return (
    <div className="content-card bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col group transition-all hover:translate-y-[-4px] hover:shadow-lg">
      {/* Image section */}
      <div className="relative">
        <img 
          src={content.imageUrl || 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=800&q=80'} 
          alt={content.title} 
          className="w-full h-48 object-cover"
        />
        
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
          <div className="flex space-x-2">
            <button 
              className="h-8 w-8 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white transition-colors"
              onClick={() => onEdit && onEdit(content.id)}
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="h-8 w-8 rounded-full bg-white/90 text-gray-800 flex items-center justify-center hover:bg-white transition-colors"
              onClick={() => onShare && onShare(content.id)}
            >
              <i className="fas fa-share-alt"></i>
            </button>
          </div>
          <div>
            <button 
              className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
              onClick={() => onEnhance && onEnhance(content.id)}
            >
              <i className="fas fa-magic"></i>
            </button>
          </div>
        </div>
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 dark:bg-gray-900/90 text-xs px-2 py-1 rounded-full text-gray-700 dark:text-gray-300">
            <i className={`${getPlatformIcon(content.platform)} mr-1`}></i> {content.status}
          </span>
        </div>
      </div>
      
      {/* Content details */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium">{content.title}</h3>
          <span className={`${statusBadge.bg} text-xs px-2 py-1 rounded`}>{statusBadge.text}</span>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {content.description || 'No description provided.'}
        </p>
        
        <div className="mt-auto">
          {content.status === 'Posted' && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 mr-4">
                  <i className="fas fa-heart mr-1"></i> {content.engagement || 0}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  <i className="fas fa-comment mr-1"></i> {Math.floor((content.engagement || 0) / 15)}
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-400">
                {new Date(content.postedAt || content.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>
          )}
          
          {content.status === 'Scheduled' && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <span className="text-gray-500 dark:text-gray-400 mr-4">
                  <i className="fas fa-calendar mr-1"></i> {new Date(content.scheduledFor || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-gray-500 dark:text-gray-400">
                  <i className="fas fa-clock mr-1"></i> {new Date(content.scheduledFor || '').toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          )}
          
          {content.status === 'Draft' && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-3">
                <button className="text-primary hover:text-primary/80 transition-colors">
                  <i className="fas fa-wand-magic-sparkles mr-1"></i> Enhance
                </button>
                <button className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors">
                  <i className="fas fa-hashtag mr-1"></i> Generate Tags
                </button>
              </div>
            </div>
          )}
          
          {/* AI Analysis Bar */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center">
              <div className="mr-3">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {content.status === 'Posted' ? 'AI Sentiment' : 
                   content.status === 'Scheduled' ? 'AI Prediction' : 'Completion'}
                </span>
              </div>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${
                    content.status === 'Posted' ? 'bg-gradient-to-r from-primary to-secondary' : 
                    content.status === 'Scheduled' ? 'bg-gradient-to-r from-accent to-blue-400' : 
                    'bg-gradient-to-r from-yellow-300 to-primary'
                  }`} 
                  style={{ width: `${content.aiSentiment || 65}%` }}
                ></div>
              </div>
              <span className="ml-2 text-xs font-medium">
                {content.aiSentiment || 65}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentCard;
