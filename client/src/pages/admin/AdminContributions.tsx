import { useEffect, useState } from "react";
import ContributionTable from "../../components/admin/ContributionTable";

const AdminContributions = () => {
  const [contributions, setContributions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/contributions");
        const data = await res.json();
        setContributions(data);
      } catch (error) {
        console.error("Failed to fetch contributions", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Member Contributions</h1>
      <ContributionTable contributions={contributions} />
    </div>
  );
};

export default AdminContributions;
