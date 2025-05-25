// src/components/shared/UserTable.tsx
import React, { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { User } from '../../types';
import { createUser, updateUser, deleteUser as apiDeleteUser } from '../../api/userApi';

interface Props {
  users: User[];
  setUsers: (users: User[]) => void;
}

const UserTable: React.FC<Props> = ({ users, setUsers }) => {
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User & { password: string }>({
    id: '',
    username: '',
    email: '',
    role: 'member',
    password: '',
  });

  useEffect(() => {
    setUsers(users);
  }, [users]);

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      alert('Please fill all fields including password');
      return;
    }
    try {
      const created = await createUser(newUser);
      setUsers([...users, created]);
      setNewUser({ id: '', username: '', email: '', role: 'member', password: '' });
    } catch (err) {
      alert('Failed to create user');
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      await updateUser(Number(editingUser.id), editingUser);
      setUsers(users.map(u => (u.id === editingUser.id ? editingUser : u)));
      setEditingUser(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await apiDeleteUser(Number(id));
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-4 rounded shadow border">
        <h3 className="text-lg font-semibold">Add New User</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input type="text" placeholder="Username" className="border rounded p-2" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
          <input type="email" placeholder="Email" className="border rounded p-2" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          <input type="password" placeholder="Password" className="border rounded p-2" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          <select className="border rounded p-2" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button className="bg-emerald-700 text-white px-4 py-2 rounded" onClick={handleAddUser}><FiPlus /> Add</button>
        </div>
      </div>

      {editingUser && (
        <div className="bg-white p-4 rounded shadow border">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input type="text" className="border rounded p-2" value={editingUser.username} onChange={e => setEditingUser({ ...editingUser, username: e.target.value })} />
            <input type="email" className="border rounded p-2" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
            <select className="border rounded p-2" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}>
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleUpdateUser}>Update</button>
            <button className="bg-gray-400 text-white px-4 py-2 rounded" onClick={() => setEditingUser(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow border overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-emerald-50 text-emerald-800 font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">{user.username}</td>
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>{user.role}</span>
                </td>
                <td className="px-6 py-3 flex gap-2">
                  <button className="text-indigo-600 hover:underline" onClick={() => setEditingUser(user)}><FiEdit2 className="inline mr-1" />Edit</button>
                  <button className="text-red-600 hover:underline" onClick={() => handleDeleteUser(user.id)}><FiTrash2 className="inline mr-1" />Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserTable;
