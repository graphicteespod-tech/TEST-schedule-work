
import React, { useEffect, useState, useMemo } from 'react';
import { CalendarView } from '../components/ui/CalendarView';
import { useScheduleStore } from '../stores/useScheduleStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import type { Department, WorkSchedule } from '../types';
import { supabase } from '../services/supabaseClient';

export const OrgSchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  
  const { schedules, loading, fetchSchedules } = useScheduleStore();
  
  useEffect(() => {
    async function getDepartments() {
      const { data } = await supabase.from('departments').select('*');
      if (data) setDepartments(data);
    }
    getDepartments();
  }, []);

  useEffect(() => {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      fetchSchedules({
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      });
  }, [currentDate, fetchSchedules]);

  const filteredSchedules = useMemo(() => {
    if (selectedDept === 'ALL') return schedules;
    return schedules.filter(s => s.user?.department_id === selectedDept);
  }, [schedules, selectedDept]);
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  
  const handleEventClick = (schedule: WorkSchedule) => setSelectedSchedule(schedule);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
            <h2 className="text-xl font-bold">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="w-64">
                <Select value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                    <option value="ALL">All Departments</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </Select>
            </div>
        </div>
        <div className="space-x-2">
          <Button onClick={handlePrevMonth}>&lt; Prev</Button>
          <Button onClick={handleNextMonth}>Next &gt;</Button>
        </div>
      </div>
      
      {loading ? <p>Loading schedule...</p> : (
        <CalendarView
          currentDate={currentDate}
          schedules={filteredSchedules}
          onDateClick={() => {}}
          onEventClick={handleEventClick}
        />
      )}

      <Modal isOpen={!!selectedSchedule} onClose={() => setSelectedSchedule(null)} title="Shift Details">
        {selectedSchedule && (
          <div className="space-y-4 text-gray-700">
             <p><strong>Employee:</strong> {selectedSchedule.user?.full_name}</p>
             <p><strong>Department:</strong> {departments.find(d => d.id === selectedSchedule.user?.department_id)?.name}</p>
             <p><strong>Date:</strong> {selectedSchedule.work_date}</p>
             <p><strong>Shift:</strong> {selectedSchedule.shift?.name} ({selectedSchedule.shift?.start_time} - {selectedSchedule.shift?.end_time})</p>
             <p><strong>Notes:</strong> {selectedSchedule.notes || 'N/A'}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};
