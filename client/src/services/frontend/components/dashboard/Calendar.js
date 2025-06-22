import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Names of months and days
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  // Generate dates for the current month view
  const generateDates = () => {
    const dates = [];
    
    // First day of the month
    const firstDay = new Date(currentYear, currentMonth, 1);
    
    // Last day of the month
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Adjust for Monday as first day
    
    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = prevMonthLastDay - firstDayOfWeek + i + 1;
      dates.push({
        day,
        month: currentMonth - 1,
        year: currentMonth === 0 ? currentYear - 1 : currentYear,
        isCurrentMonth: false,
      });
    }
    
    // Add days of the current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({
        day: i,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
      });
    }
    
    // Add days from next month to complete the last week
    const remainingDays = 7 - (dates.length % 7 || 7);
    
    for (let i = 1; i <= remainingDays; i++) {
      dates.push({
        day: i,
        month: currentMonth + 1,
        year: currentMonth === 11 ? currentYear + 1 : currentYear,
        isCurrentMonth: false,
      });
    }
    
    return dates;
  };
  
  const dates = generateDates();
  
  // Check if a date is selected
  const isSelectedDate = (date) => {
    return (
      date.day === selectedDate.getDate() &&
      date.month === selectedDate.getMonth() &&
      date.year === selectedDate.getFullYear() &&
      date.isCurrentMonth
    );
  };
  
  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.day === today.getDate() &&
      date.month === today.getMonth() &&
      date.year === today.getFullYear()
    );
  };
  
  // Handle date selection
  const handleDateClick = (date) => {
    if (date.isCurrentMonth) {
      setSelectedDate(new Date(date.year, date.month, date.day));
    }
  };
  
  return (
    <div className="calendar">
      <div className="calendar-header">
        <button className="calendar-nav-btn" onClick={prevMonth}>
          <FaChevronLeft />
        </button>
        <h2 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h2>
        <button className="calendar-nav-btn" onClick={nextMonth}>
          <FaChevronRight />
        </button>
      </div>
      
      <div className="calendar-days">
        {dayNames.map((day) => (
          <div key={day} className="calendar-day-name">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-dates">
        {dates.map((date, index) => (
          <div
            key={index}
            className={`calendar-date ${!date.isCurrentMonth ? 'other-month' : ''} ${isSelectedDate(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
            onClick={() => handleDateClick(date)}
          >
            <span>{date.day}</span>
            {isSelectedDate(date) && <div className="date-indicator"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar; 