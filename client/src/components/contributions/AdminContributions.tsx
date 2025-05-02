import React, { useEffect, useState } from 'react';
import ContributionForm, { ContributionFormData } from './ContributionForm';
import ContributionTable, { Contribution } from './ContributionTable';
import axios from 'axios';

const AdminContributions: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const fetchContributions = async () => {
    const res = await axios.get('/api/contributions');
    setContributions(res.data);
  };

  const handleAdd = async (formData: ContributionFormData) => {
    await axios.post('/api/contributions', formData);
    fetchContributions();
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold text-emerald-700 mb-4">All Contributions</h2>
      <ContributionForm onSubmit={handleAdd} />
      <ContributionTable contributions={contributions} />
    </div>
  );
};

export default AdminContributions;
