// components/contributions/MemberContributions.tsx
import React, { useEffect, useState } from 'react';
import ContributionTable from './ContributionTable';
import MemberContributionForm from './MemberContributionForm';
import axios from 'axios';

interface Props {
  memberId: number;
  groupId: number; // Added groupId
}

const MemberContributions: React.FC<Props> = ({ memberId, groupId }) => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContributions = async () => {
    try {
      const res = await axios.get(`/api/contributions/member/${memberId}`);
      setContributions(res.data);
    } catch (err) {
      setError('Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [memberId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <MemberContributionForm 
        memberId={memberId} 
        groupId={groupId} 
        onSuccess={fetchContributions} 
      />
      <ContributionTable contributions={contributions} />
    </div>
  );
};

export default MemberContributions;