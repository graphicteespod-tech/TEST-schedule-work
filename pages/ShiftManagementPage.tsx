
import React, { useEffect, useState, useCallback } from 'react';
import { useShiftStore } from '../stores/useShiftStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import type { Shift } from '../types';

export const ShiftManagementPage: React.FC = () => {
  const { user } = useAuthStore();
  const { shifts, loading, fetchShifts, createShift, updateShift, deleteShift } = useShiftStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift> | null>(null);

  const departmentId = user?.department_id;
  
  const refreshShifts = useCallback(() => {
    if (departmentId) {
      fetchShifts(departmentId);
    }
  }, [departmentId, fetchShifts]);

  useEffect(() => {
    refreshShifts();
  }, [refreshShifts]);

  const openModal = (shift: Partial<Shift> | null = null) => {
    setCurrentShift(shift || { name: '', start_time: '09:00', end_time: '17:00' });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (currentShift && departmentId) {
      if (currentShift.id) {
        await updateShift(currentShift.id, currentShift);
      } else {
        await createShift({
          name: currentShift.name || '',
          start_time: currentShift.start_time || '',
          end_time: currentShift.end_time || '',
          department_id: departmentId
        });
      }
      setIsModalOpen(false);
      setCurrentShift(null);
      refreshShifts();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shift?')) {
        await deleteShift(id);
        refreshShifts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Shifts</h1>
        <Button onClick={() => openModal()}>Add New Shift</Button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-4">Loading...</td></tr>
            ) : (
              shifts.map((shift) => (
                <tr key={shift.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{shift.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{shift.start_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{shift.end_time}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="secondary" onClick={() => openModal(shift)}>Edit</Button>
                    <Button variant="danger" onClick={() => handleDelete(shift.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={currentShift?.id ? 'Edit Shift' : 'Add Shift'}>
        {currentShift && (
          <div className="space-y-4">
            <Input label="Shift Name" value={currentShift.name} onChange={(e) => setCurrentShift({ ...currentShift, name: e.target.value })} />
            <Input label="Start Time" type="time" value={currentShift.start_time} onChange={(e) => setCurrentShift({ ...currentShift, start_time: e.target.value })} />
            <Input label="End Time" type="time" value={currentShift.end_time} onChange={(e) => setCurrentShift({ ...currentShift, end_time: e.target.value })} />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
