
import React from 'react';
import type { WorkSchedule } from '../../types';

interface CalendarViewProps {
  currentDate: Date;
  schedules: WorkSchedule[];
  onDateClick: (date: Date) => void;
  onEventClick: (schedule: WorkSchedule) => void;
}

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({ currentDate, schedules, onDateClick, onEventClick }) => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const renderCells = () => {
    const cells = [];
    let day = 1;

    for (let i = 0; i < 6; i++) { // Max 6 weeks in a month view
      const row = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          row.push(<div key={`empty-start-${j}`} className="p-2 border-r border-b border-gray-200 bg-gray-50"></div>);
        } else if (day > daysInMonth) {
          row.push(<div key={`empty-end-${j}`} className="p-2 border-r border-b border-gray-200 bg-gray-50"></div>);
        } else {
          const date = new Date(year, month, day);
          const dateString = date.toISOString().split('T')[0];
          const todaysSchedules = schedules.filter(s => s.work_date === dateString);
          const isToday = new Date().toDateString() === date.toDateString();

          row.push(
            <div
              key={day}
              className="p-2 border-r border-b border-gray-200 min-h-[120px] cursor-pointer hover:bg-gray-100"
              onClick={() => onDateClick(date)}
            >
              <div className={`font-semibold ${isToday ? 'text-primary-600' : 'text-gray-700'}`}>{day}</div>
              <div className="mt-1 space-y-1">
                {todaysSchedules.map(schedule => (
                  <div
                    key={schedule.id}
                    className="bg-primary-500 text-white text-xs rounded-md px-2 py-1 truncate"
                    onClick={(e) => { e.stopPropagation(); onEventClick(schedule); }}
                  >
                    {schedule.user?.full_name.split(' ')[0]}: {schedule.shift?.name}
                  </div>
                ))}
              </div>
            </div>
          );
          day++;
        }
      }
      cells.push(<div key={i} className="grid grid-cols-7">{row}</div>);
      if (day > daysInMonth) break;
    }
    return cells;
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 text-center font-bold text-gray-600 border-b border-gray-200">
        {dayNames.map(day => <div key={day} className="p-3">{day}</div>)}
      </div>
      <div>
        {renderCells()}
      </div>
    </div>
  );
};
