import { useState } from 'react';
import InvestmentList from '../components/InvestmentList';
import PaymentForm from '../components/PaymentForm';

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>

      <section>
        <h2 className="text-xl font-semibold">Investments</h2>
        {/* key forces re-mount to re-fetch */}
        <InvestmentList key={refreshKey} />
      </section>

      <section>
        <h2 className="text-xl font-semibold">Add Payment</h2>
        <PaymentForm onPayment={() => setRefreshKey(k => k + 1)} />
      </section>
    </div>
  );
}
