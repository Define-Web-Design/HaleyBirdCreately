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
        h-auto min-h-[6rem] p-1.5 rounded-lg relative
        ${day.isToday 
          ? 'border-2 border-primary ring-2 ring-primary/20 bg-primary/5' 
          : `border ${isInactive 
              ? 'border-gray-100 dark:border-gray-800/60 bg-gray-50/80 dark:bg-gray-800/20 text-gray-400 dark:text-gray-600' 
              : 'border-gray-200 dark:border-gray-700/80 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/40'
            }`
        }
        ${!isInactive ? 'cursor-pointer hover:shadow-sm' : ''}
        transition-all
      `}
      onClick={!isInactive ? handleClick : undefined}
      role={!isInactive ? "button" : undefined}
      aria-label={!isInactive ? `Select ${day.date}` : undefined}
    >
      <div className={`text-xs font-medium p-1 rounded-sm inline-flex items-center ${
        day.isToday 
          ? 'text-primary bg-primary/10 px-1.5' 
          : isInactive 
            ? 'text-gray-400 dark:text-gray-500' 
            : 'text-gray-700 dark:text-gray-300'
      }`}>
        {day.date}
        {day.isToday && (
          <span className="ml-1 text-[0.65rem] opacity-80">Today</span>
        )}
      </div>
      
      {day.scheduledContent && day.scheduledContent.length > 0 && day.isCurrentMonth && (
        <div className="mt-1.5 space-y-1.5">
          {day.scheduledContent.slice(0, 2).map((content) => (
            <div 
              key={content.id} 
              className={`text-[0.7rem] leading-tight font-medium rounded-sm ${getContentTypeColor(content.type)} py-1 px-1.5 truncate shadow-sm`}
              title={content.title}
            >
              <i className={`${getPlatformIcon(content.platform)} mr-1`}></i>
              <span className="align-middle">{content.title}</span>
            </div>
          ))}
          
          {day.scheduledContent.length > 2 && (
            <div className="text-[0.65rem] text-center font-medium text-gray-500 dark:text-gray-400 mt-1 py-0.5 bg-gray-100/80 dark:bg-gray-700/50 rounded-sm">
              +{day.scheduledContent.length - 2} more
            </div>
          )}
        </div>
      )}
      
      {/* Empty state for empty days with subtle visual indicator */}
      {(!day.scheduledContent || day.scheduledContent.length === 0) && day.isCurrentMonth && (
        <div className="flex items-center justify-center h-10 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 opacity-50"></div>
        </div>
      )}
    </div>
  );
};

export default CalendarDayComponent;
