// components/contributions/AdminContributions.tsx
import React, { useEffect, useState } from 'react';
import ContributionForm from './ContributionForm';
import ContributionTable from './ContributionTable';
import axios from 'axios';

const AdminContributions: React.FC = () => {
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContributions = async () => {
    try {
      const res = await axios.get('/api/contributions');
      setContributions(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (formData: any) => {
    await axios.post('/api/contributions', formData);
    fetchContributions();
  };

  const handleStatusChange = async (id: number, status: string) => {
    await axios.patch(`/api/contributions/${id}/status`, { status });
    fetchContributions();
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Manage Contributions</h2>
      <ContributionForm onSubmit={handleAdd} />
      <ContributionTable 
        contributions={contributions} 
        onStatusChange={handleStatusChange}
        isAdmin={true}
      />
    </div>
  );
};

export default AdminContributions;