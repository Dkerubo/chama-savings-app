import React, { useEffect, useState } from 'react';
import ContributionTable, { Contribution } from './ContributionTable';
import axios from 'axios';

interface Props {
  memberId: number;
}

const MemberContributions: React.FC<Props> = ({ memberId }) => {
  const [contributions, setContributions] = useState<Contribution[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get(`/api/contributions/member/${memberId}`);
      setContributions(res.data);
    };
    fetchData();
  }, [memberId]);

  return (
    <ContributionTable contributions={contributions} />
  );
};

export default MemberContributions;
