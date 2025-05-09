// src/pages/admin/UsersPage.tsx
import React, { useEffect, useState } from 'react';
import { getUsers } from '../../api/userApi';
import { User } from '../../types';
import UserTable from '../../components/shared/UserTable';

const UsersPage: React.FC = () => {
  const [user, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers(1, 100); // Get first 100 users
        setUsers(data.users);
      } catch (err) {
        console.error('Failed to fetch users');
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User List</h1>
      <UserTable />
    </div>
  );
};

export default UsersPage;
