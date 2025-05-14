// pages/member/contributions.tsx
import ContributionTable from '../../components/contributions/ContributionTable';
import { Toaster } from 'react-hot-toast';



const ContributionPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <ContributionTable />
    </div>
  );
};



export default ContributionPage;