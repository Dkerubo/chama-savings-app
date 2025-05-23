// src/components/shared/UserTable.tsx
import React, { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { User } from '../../types';

interface Props {
  users: User[];
}

const UserTable: React.FC<Props> = ({ users }) => {
  const [localUsers, setLocalUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<User>({
    id: '',
    username: '',
    email: '',
    role: 'member',
  });

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const generateUniqueId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  const addUser = () => {
    if (!newUser.username || !newUser.email) {
      alert('Fill all fields');
      return;
    }

    const userToAdd: User = {
      ...newUser,
      id: generateUniqueId(),
    };

    setLocalUsers([...localUsers, userToAdd]);

    setNewUser({
      id: '',
      username: '',
      email: '',
      role: 'member',
    });
  };

  const updateUser = () => {
    if (!editingUser) return;
    setLocalUsers(
      localUsers.map((u) => (u.id === editingUser.id ? editingUser : u))
    );
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    setLocalUsers(localUsers.filter((u) => u.id !== id));
  };

  const getRoleBadgeColor = (role: 'admin' | 'member') => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h2 className="text-2xl font-bold text-emerald-700">User Management</h2>

      {/* Add User */}
      <div className="bg-white p-4 shadow rounded-lg border space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Add New User</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Username"
            className="border rounded px-3 py-2"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="border rounded px-3 py-2"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <select
            className="border rounded px-3 py-2"
            value={newUser.role}
            onChange={(e) =>
              setNewUser({ ...newUser, role: e.target.value as 'admin' | 'member' })
            }
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button
            className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 flex items-center justify-center"
            onClick={addUser}
          >
            <FiPlus className="mr-1" /> Add
          </button>
        </div>
      </div>

      {/* Edit User */}
      {editingUser && (
        <div className="bg-white p-4 shadow rounded-lg border space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Edit User</h3>
          <div className="grid md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Username"
              className="border rounded px-3 py-2"
              value={editingUser.username}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
            />
            <input
              type="email"
              placeholder="Email"
              className="border rounded px-3 py-2"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
            <select
              className="border rounded px-3 py-2"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  role: e.target.value as 'admin' | 'member',
                })
              }
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={updateUser}
            >
              Update
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* User Table */}
      <div className="bg-white shadow rounded-lg overflow-x-auto border">
        <table className="min-w-full text-sm">
          <thead className="bg-emerald-50 text-emerald-800 uppercase text-xs font-semibold">
            <tr>
              <th className="px-6 py-3 text-left">Username</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Role</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {localUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-3">{user.username}</td>
                <td className="px-6 py-3">{user.email}</td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-3 flex gap-4 items-center">
                  <button
                    onClick={() => setEditingUser(user)}
                    className="text-indigo-600 hover:underline flex items-center text-sm"
                  >
                    <FiEdit2 className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    className="text-red-600 hover:underline flex items-center text-sm"
                  >
                    <FiTrash2 className="mr-1" /> Delete
                  </button>
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
