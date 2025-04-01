import { useState } from 'react';
import CalendarDayComponent from '@/components/ui/calendar-day';
import { CalendarDay } from '@/lib/types';

interface ContentCalendarProps {
  calendarDays?: CalendarDay[];
  onDayClick?: (day: CalendarDay) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

const ContentCalendar = ({ 
  calendarDays, 
  onDayClick,
  onPrevMonth,
  onNextMonth 
}: ContentCalendarProps) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  
  // Generate current month days if not provided
  const generateDaysIfNeeded = (): CalendarDay[] => {
    if (calendarDays && calendarDays.length > 0) return calendarDays;
    
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const currentDate = today.getDate();
    
    // Get first day of month and calculate offset
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Get days from last month to fill first row
    const firstDayOfWeek = firstDayOfMonth.getDay() || 7; // Convert Sunday from 0 to 7
    const daysFromLastMonth = firstDayOfWeek - 1;
    
    // Generate calendar days
    const days: CalendarDay[] = [];
    
    // Add days from previous month
    const lastMonth = new Date(year, month, 0);
    const daysInLastMonth = lastMonth.getDate();
    
    for (let i = daysInLastMonth - daysFromLastMonth + 1; i <= daysInLastMonth; i++) {
      days.push({
        date: i,
        month: month - 1,
        year,
        isCurrentMonth: false,
        isToday: false,
        scheduledContent: []
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        month,
        year,
        isCurrentMonth: true,
        isToday: i === currentDate,
        scheduledContent: i === 1 ? [
          { id: 1, title: 'Product Launch', platform: 'instagram', type: 'product' }
        ] : i === 2 ? [
          { id: 2, title: 'Creative Process', platform: 'tiktok', type: 'creative' },
          { id: 3, title: 'Inspiration Board', platform: 'pinterest', type: 'inspiration' }
        ] : i === 4 ? [
          { id: 4, title: 'Workspace Tour', platform: 'instagram', type: 'creative' }
        ] : i === 6 ? [
          { id: 5, title: 'Q&A Session', platform: 'twitter', type: 'qa' }
        ] : []
      });
    }
    
    // Add days from next month to complete grid (if needed)
    const remainingDays = 7 - (days.length % 7 || 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          month: month + 1,
          year,
          isCurrentMonth: false,
          isToday: false,
          scheduledContent: []
        });
      }
    }
    
    return days;
  };

  const days = generateDaysIfNeeded();
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    if (onDayClick) onDayClick(day);
  };

  return (
    <section className="animate-slide-up mb-8" style={{ animationDelay: '0.4s' }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
        <h2 className="text-xl font-['SF_Pro_Display'] font-semibold text-gray-900 dark:text-white">Upcoming Schedule</h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center self-start sm:self-auto">
          View Full Calendar <i className="fas fa-calendar-alt ml-2"></i>
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary mr-4 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onPrevMonth}
              aria-label="Previous month"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h3 className="font-medium text-lg">{currentMonth}</h3>
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary ml-4 transition-colors p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={onNextMonth}
              aria-label="Next month"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="flex space-x-1.5 p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg self-start sm:self-auto">
            <button 
              className={`${
                viewMode === 'week' 
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                  : 'hover:bg-gray-200/70 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300'
              } px-3.5 py-1.5 rounded-md text-sm font-medium transition-all`}
              onClick={() => setViewMode('week')}
              aria-label="Week view"
              aria-pressed={viewMode === 'week'}
            >
              Week
            </button>
            <button 
              className={`${
                viewMode === 'month' 
                  ? 'bg-white dark:bg-gray-700 text-primary shadow-sm' 
                  : 'hover:bg-gray-200/70 dark:hover:bg-gray-700/70 text-gray-700 dark:text-gray-300'
              } px-3.5 py-1.5 rounded-md text-sm font-medium transition-all`}
              onClick={() => setViewMode('month')}
              aria-label="Month view"
              aria-pressed={viewMode === 'month'}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-5 overflow-x-auto scrollbar-thin">
          <div className="min-w-max">
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {days.slice(0, viewMode === 'week' ? 7 : days.length).map((day, index) => (
                <CalendarDayComponent
                  key={`${day.month}-${day.date}-${index}`}
                  day={day}
                  onClick={handleDayClick}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContentCalendar;
