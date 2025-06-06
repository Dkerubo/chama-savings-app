import React, { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { User } from '../../types';
import {
  getUsers,
  updateUser,
  deleteUser as apiDeleteUser,
} from '../../api/userApi';

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        setUsers(res.users);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const updated = await updateUser(Number(editingUser.id), editingUser);
      setUsers((prev) =>
        prev.map((u) =>
          Number(u.id) === Number(editingUser.id) ? updated : u
        )
      );
      setEditingUser(null);
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await apiDeleteUser(id);
      setUsers((prev) => prev.filter((u) => Number(u.id) !== id));
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'member':
        return 'bg-gray-100 text-gray-800';
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="space-y-8">
      {editingUser && (
        <div className="bg-white p-4 rounded shadow border">
          <h3 className="text-lg font-semibold">Edit User</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              className="border rounded p-2"
              value={editingUser.username}
              onChange={(e) =>
                setEditingUser({ ...editingUser, username: e.target.value })
              }
            />
            <input
              type="email"
              className="border rounded p-2"
              value={editingUser.email}
              onChange={(e) =>
                setEditingUser({ ...editingUser, email: e.target.value })
              }
            />
            <select
              className="border rounded p-2"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  role: e.target.value as 'admin' | 'member' | 'superadmin',
                })
              }
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleUpdateUser}
            >
              Update
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded"
              onClick={() => setEditingUser(null)}
            >
              Cancel
            </button>
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-3 flex gap-2">
                  <button
                    className="text-indigo-600 hover:underline"
                    onClick={() => setEditingUser(user)}
                  >
                    <FiEdit2 className="inline mr-1" /> Edit
                  </button>
                  <button
                    className="text-red-600 hover:underline"
                    onClick={() => handleDeleteUser(Number(user.id))}
                  >
                    <FiTrash2 className="inline mr-1" /> Delete
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
