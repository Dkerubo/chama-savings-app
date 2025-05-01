import { useEffect, useState } from "react";
import TransactionTable from "../../components/member/TransactionTable";

type Transaction = {
  id: number;
  type: string;
  amount: number;
  date: string;
  status: string;
};

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/member/transactions");
        const data = await res.json();

        // Optional: ensure data matches expected shape
        const cleaned = data.map((txn: any) => ({
          id: txn.id,
          type: txn.type,
          amount: txn.amount,
          date: txn.date,
          status: txn.status,
        }));

        setTransactions(cleaned);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Transactions</h1>
      <TransactionTable transactions={transactions} />
    </div>
  );
};

export default Transactions;
