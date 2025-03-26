import { CalendarDay, ScheduledContent } from '@/lib/types';

interface CalendarDayProps {
  day: CalendarDay;
  onClick?: (day: CalendarDay) => void;
}

const CalendarDayComponent = ({ day, onClick }: CalendarDayProps) => {
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

  // Content type to color mapping
  const getContentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'product': return 'bg-primary/10 text-primary';
      case 'creative': return 'bg-secondary/10 text-secondary';
      case 'inspiration': return 'bg-accent/10 text-accent';
      case 'qa': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
    }
  };

  // Handle click
  const handleClick = () => {
    if (onClick) onClick(day);
  };

  const isInactive = !day.isCurrentMonth;
  
  return (
    <div 
      className={`
        h-24 p-1 rounded-lg 
        ${day.isToday 
          ? 'border-2 border-primary bg-primary/5' 
          : `border border-gray-100 dark:border-gray-800 ${isInactive ? 'text-gray-400 dark:text-gray-600' : ''}`
        }
        ${!isInactive ? 'cursor-pointer hover:border-gray-300 dark:hover:border-gray-700' : ''}
        transition-colors
      `}
      onClick={!isInactive ? handleClick : undefined}
    >
      <div className={`text-xs p-1 ${day.isToday ? 'font-medium text-primary' : ''}`}>
        {day.date}{day.isToday ? ' (Today)' : ''}
      </div>
      
      {day.scheduledContent && day.scheduledContent.length > 0 && day.isCurrentMonth && (
        <div className="mt-1 space-y-1">
          {day.scheduledContent.slice(0, 2).map((content) => (
            <div 
              key={content.id} 
              className={`text-xs rounded ${getContentTypeColor(content.type)} p-1 truncate`}
            >
              <i className={`${getPlatformIcon(content.platform)} text-xs mr-1`}></i> {content.title}
            </div>
          ))}
          
          {day.scheduledContent.length > 2 && (
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              +{day.scheduledContent.length - 2} more
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarDayComponent;
