// import React, { useState } from 'react';
import MemberContributions from '../../components/contributions/MemberContributions';

const Contributions = () => {
  // You'll probably get member ID from session or props
  const memberId = 1;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-emerald-700 mb-4 text-left">My Contributions</h2>
      <MemberContributions memberId={memberId} />
    </div>
  );
};

export default Contributions;
