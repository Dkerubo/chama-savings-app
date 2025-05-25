// src/pages/admin/UsersPage.tsx
import React, { useEffect, useState } from 'react';
import { getUsers } from '../../api/userApi';
import { User } from '../../types';
import UserTable from '../../components/shared/UserTable';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getUsers(); // No pagination
        setUsers(response.users);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-emerald-800">User Management</h1>
      {loading ? (
        <p className="text-gray-600">Loading users...</p>
      ) : (
        <UserTable users={users} setUsers={setUsers} />
      )}
    </div>
  );
};

export default UsersPage;
