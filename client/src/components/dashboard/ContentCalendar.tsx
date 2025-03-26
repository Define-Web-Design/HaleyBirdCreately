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
    <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-['SF_Pro_Display'] font-semibold">Upcoming Schedule</h2>
        <button className="text-sm text-primary hover:text-primary/80 transition-colors">
          View Calendar <i className="fas fa-calendar-alt ml-1"></i>
        </button>
      </div>
      
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary mr-4 transition-colors"
              onClick={onPrevMonth}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h3 className="font-medium">{currentMonth}</h3>
            <button 
              className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary ml-4 transition-colors"
              onClick={onNextMonth}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className={`${
                viewMode === 'week' 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } px-3 py-1 rounded-lg text-sm font-medium transition-colors`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`${
                viewMode === 'month' 
                  ? 'bg-primary/10 text-primary' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              } px-3 py-1 rounded-lg text-sm font-medium transition-colors`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
          </div>
        </div>
        
        <div className="p-4 overflow-x-auto">
          <div className="min-w-max">
            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">Mon</div>
              <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">Tue</div>
              <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">Wed</div>
              <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">Thu</div>
              <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">Fri</div>
              <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">Sat</div>
              <div className="text-center text-sm font-medium text-gray-500 dark:text-gray-400">Sun</div>
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
