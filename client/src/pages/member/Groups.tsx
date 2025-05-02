import { useEffect, useState } from "react";
import GroupTable from "../../components/groups/GroupTable";

type Group = {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  current_amount?: number;
  admin_name?: string;
};

const MemberGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    const res = await fetch("/api/groups/my-groups");
    const data: Group[] = await res.json();
    setGroups(data);
  };

  const deleteGroup = async (id: number) => {
    const res = await fetch(`/api/groups/${id}`, { method: "DELETE" });
    if (res.ok) fetchGroups();
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-semibold text-emerald-700 mb-4 text-left">My Groups</h2>
      <GroupTable
        groups={groups}
        onDelete={deleteGroup}
        onEdit={(group) => {
          // Placeholder for editing functionality
          console.log("Edit clicked for group", group);
        }}
      />
    </div>
  );
};

export default MemberGroups;
