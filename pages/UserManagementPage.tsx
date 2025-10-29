
import React, { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import type { Department, UserProfile } from '../types';
import { Role } from '../constants';
import { supabase } from '../services/supabaseClient';

export const UserManagementPage: React.FC = () => {
  const { users, loading, fetchUsers, updateUser } = useUserStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  const refreshUsers = useCallback(() => fetchUsers(), [fetchUsers]);
  
  useEffect(() => {
    refreshUsers();
    async function getDepartments() {
        const { data } = await supabase.from('departments').select('*');
        if (data) setDepartments(data);
    }
    getDepartments();
  }, [refreshUsers]);

  const openModal = (user: UserProfile) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };
  
  const handleSave = async () => {
    if (currentUser) {
        await updateUser(currentUser.id, {
            role: currentUser.role,
            department_id: currentUser.department_id
        });
        setIsModalOpen(false);
        setCurrentUser(null);
        refreshUsers();
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <Button onClick={() => alert("'Invite User' feature not implemented.")}>Invite New User</Button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4">Loading...</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{departments.find(d => d.id === user.department_id)?.name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="secondary" onClick={() => openModal(user)}>Edit</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Edit ${currentUser?.full_name}`}>
        {currentUser && (
          <div className="space-y-4">
            <Select label="Department" value={currentUser.department_id} onChange={(e) => setCurrentUser({ ...currentUser, department_id: e.target.value })}>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
             <Select label="Role" value={currentUser.role} onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value as Role })}>
                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
            </Select>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
