
import React, { useEffect, useState } from 'react';
import { CalendarView } from '../components/ui/CalendarView';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import type { WorkSchedule } from '../types';

export const DashboardPage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
  const { schedules, loading, fetchSchedules } = useScheduleStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      fetchSchedules({
        userId: user.id,
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      });
    }
  }, [user, currentDate, fetchSchedules]);
  
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  
  const handleEventClick = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
  };
  
  const handleDateClick = (date: Date) => {
    console.log("Date clicked:", date);
    // Could implement creating a new entry here if needed.
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <h2 className="text-xl font-bold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="space-x-2">
          <Button onClick={handlePrevMonth}>&lt; Prev</Button>
          <Button onClick={handleNextMonth}>Next &gt;</Button>
        </div>
      </div>
      
      {loading ? (
        <p>Loading schedule...</p>
      ) : (
        <CalendarView
          currentDate={currentDate}
          schedules={schedules}
          onDateClick={handleDateClick}
          onEventClick={handleEventClick}
        />
      )}

      <Modal
        isOpen={!!selectedSchedule}
        onClose={() => setSelectedSchedule(null)}
        title="Shift Details"
      >
        {selectedSchedule && (
          <div className="space-y-4 text-gray-700">
             <p><strong>Date:</strong> {selectedSchedule.work_date}</p>
             <p><strong>Shift:</strong> {selectedSchedule.shift?.name}</p>
             <p><strong>Time:</strong> {selectedSchedule.shift?.start_time} - {selectedSchedule.shift?.end_time}</p>
             <p><strong>Notes:</strong> {selectedSchedule.notes || 'N/A'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
