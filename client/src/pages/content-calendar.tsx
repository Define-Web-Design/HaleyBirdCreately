import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import ContentCalendar from '@/components/dashboard/ContentCalendar';
import { CalendarDay } from '@/lib/types';

const ContentCalendarPage = () => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    toast({
      title: "Selected Date",
      description: `Selected ${day.date}/${day.month + 1}/${day.year}`,
    });
  };
  
  // Handle month navigation
  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    
    toast({
      title: "Calendar Navigation",
      description: "Navigated to previous month",
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    
    toast({
      title: "Calendar Navigation",
      description: "Navigated to next month",
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-['SF_Pro_Display'] font-bold mb-2">Content Calendar</h1>
        <p className="text-gray-600 dark:text-gray-300">Schedule and manage your content publishing timeline</p>
      </div>
      
      <ContentCalendar 
        onDayClick={handleDayClick}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />
    </div>
  );
};

export default ContentCalendarPage;
