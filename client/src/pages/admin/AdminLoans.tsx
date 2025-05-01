import { useEffect, useState } from "react";
import LoanTable from "../../components/admin/LoanTable";

const AdminLoans = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const response = await fetch("/api/admin/loans");
        const data = await response.json();
        setLoans(data);
      } catch (error) {
        console.error("Failed to fetch loans:", error);
      }
    };

    fetchLoans();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Loan Management</h1>
      <LoanTable loans={loans} />
    </div>
  );
};

export default AdminLoans;
