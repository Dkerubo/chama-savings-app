import { useEffect, useState } from "react";
import GroupForm from "../../components/groups/GroupForm";
import GroupTable from "../../components/groups/GroupTable";

type Group = {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  current_amount?: number;
  admin_name?: string;
};

const AdminGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    const data: Group[] = await res.json();
    setGroups(data);
  };

  const createGroup = async (group: Omit<Group, "id" | "current_amount" | "admin_name">) => {
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    });
    if (res.ok) fetchGroups();
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
      <h2 className="text-2xl font-bold">All Groups</h2>
      <GroupForm onCreate={createGroup} />
      <GroupTable
        groups={groups}
        onDelete={deleteGroup}
        onEdit={(group) => {
          /* TODO: hook up admin edit flow */
          console.log("Admin edit:", group);
        }}
      />
    </div>
  );
};

export default AdminGroups;
