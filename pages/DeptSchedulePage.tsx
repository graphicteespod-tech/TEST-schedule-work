
import React, { useEffect, useState, useCallback } from 'react';
import { CalendarView } from '../components/ui/CalendarView';
import { useScheduleStore } from '../stores/useScheduleStore';
import { useAuthStore } from '../stores/useAuthStore';
import { useUserStore } from '../stores/useUserStore';
import { useShiftStore } from '../stores/useShiftStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import type { WorkSchedule } from '../types';

export const DeptSchedulePage: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<WorkSchedule | null>(null);
  
  const [userId, setUserId] = useState('');
  const [shiftId, setShiftId] = useState('');
  const [notes, setNotes] = useState('');

  const { user } = useAuthStore();
  const { schedules, loading, fetchSchedules, createSchedule, deleteSchedule } = useScheduleStore();
  const { users, fetchUsers } = useUserStore();
  const { shifts, fetchShifts } = useShiftStore();

  const departmentId = user?.department_id;
  
  const refreshData = useCallback(() => {
    if (departmentId) {
      const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      fetchSchedules({ departmentId, startDate: start.toISOString().split('T')[0], endDate: end.toISOString().split('T')[0] });
      fetchUsers(departmentId);
      fetchShifts(departmentId);
    }
  }, [departmentId, currentDate, fetchSchedules, fetchUsers, fetchShifts]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const openAddModal = (date: Date) => {
    setSelectedDate(date);
    setSelectedSchedule(null);
    setUserId('');
    setShiftId('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (schedule: WorkSchedule) => {
    setSelectedSchedule(schedule);
    setSelectedDate(new Date(schedule.work_date));
    setUserId(schedule.user_id);
    setShiftId(schedule.shift_id);
    setNotes(schedule.notes || '');
    setIsModalOpen(true);
  };
  
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
    setSelectedSchedule(null);
  };
  
  const handleSave = async () => {
    if (!selectedDate || !userId || !shiftId || !user) return;

    if (selectedSchedule) {
      // update logic here
    } else {
      await createSchedule({
        user_id: userId,
        shift_id: shiftId,
        work_date: selectedDate.toISOString().split('T')[0],
        notes,
        created_by: user.id
      });
    }
    handleModalClose();
    refreshData();
  };
  
  const handleDelete = async () => {
    if (selectedSchedule) {
        await deleteSchedule(selectedSchedule.id);
        handleModalClose();
        refreshData();
    }
  }
  
  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

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
      
      {loading ? <p>Loading schedule...</p> : (
        <CalendarView
          currentDate={currentDate}
          schedules={schedules}
          onDateClick={openAddModal}
          onEventClick={openEditModal}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedSchedule ? "Edit Schedule" : "Add Schedule"}
      >
        <div className="space-y-4">
            <p className="font-semibold">{selectedDate?.toDateString()}</p>
            <Select label="Member" value={userId} onChange={e => setUserId(e.target.value)}>
                <option value="">Select a member</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name}</option>)}
            </Select>
            <Select label="Shift" value={shiftId} onChange={e => setShiftId(e.target.value)}>
                <option value="">Select a shift</option>
                {shifts.map(s => <option key={s.id} value={s.id}>{s.name} ({s.start_time} - {s.end_time})</option>)}
            </Select>
            <Input label="Notes" value={notes} onChange={e => setNotes(e.target.value)} />
            <div className="flex justify-end space-x-2 pt-4">
                {selectedSchedule && <Button variant="danger" onClick={handleDelete}>Delete</Button>}
                <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                <Button onClick={handleSave}>Save</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
