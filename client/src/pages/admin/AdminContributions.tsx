// pages/admin/contributions.tsx
import React from 'react';
import AdminContributions from '../../components/contributions/AdminContributions';


const AdminContributionsPage: React.FC = () => {
  // Set title in a universal way
  if (typeof document !== 'undefined') {
    document.title = 'Manage Contributions | Admin Dashboard';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
            Manage Contributions
          </h1>
          <p className="text-gray-600 mt-2">
            View, approve, and manage all member contributions
          </p>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <AdminContributions />
        </div>
      </div>
    </div>
  );
};

export default AdminContributionsPage;