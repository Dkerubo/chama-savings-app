// pages/member/contributions.tsx
import React from 'react';

interface createGroupPageProps {
  // If you plan to pass props in the future
}

const createGroupPage: React.FC<createGroupPageProps> = () => {
  // In a real app, these would come from authentication context or props

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Groups</h1>
        <p className="text-gray-600 mt-2">
          View and manage your group 
        </p>
      </header>
      
      <section className="bg-white rounded-lg shadow p-6">
       
      </section>
    </main>
  );
};

export default createGroupPage;