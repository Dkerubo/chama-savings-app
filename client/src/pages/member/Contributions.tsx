// pages/member/contributions.tsx
import React from 'react';
import MemberContributions from '../../components/contributions/MemberContributions';

interface ContributionsPageProps {
  // If you plan to pass props in the future
}

const ContributionsPage: React.FC<ContributionsPageProps> = () => {
  // In a real app, these would come from authentication context or props
  const memberId = 2; // TODO: Replace with actual member ID from context
  const groupId = 2;  // TODO: Replace with actual group ID from context

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Contributions</h1>
        <p className="text-gray-600 mt-2">
          View and manage your group contributions
        </p>
      </header>
      
      <section className="bg-white rounded-lg shadow p-6">
        <MemberContributions 
          memberId={memberId} 
          groupId={groupId} 
        />
      </section>
    </main>
  );
};

export default ContributionsPage;