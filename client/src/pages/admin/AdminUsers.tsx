import React from 'react';
import UserTable from '../../components/shared/UserTable';

const UsersPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-emerald-800">
        User Management
      </h1>
      <UserTable />
    </div>
  );
};

export default UsersPage;
