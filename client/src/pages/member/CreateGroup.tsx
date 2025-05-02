import { useEffect, useState } from "react";
import CreateGroupForm from "../../components/groups/CreateGroupForm";
import GroupTable from "../../components/groups/GroupTable";

type Group = {
  id: number;
  name: string;
  description: string;
  target_amount: number;
  current_amount?: number;
  admin_name?: string;
};

const CreateGroup: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  const fetchGroups = async () => {
    const res = await fetch("/api/groups/my-groups");
    if (res.ok) setGroups(await res.json());
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
      <h2 className="text-2xl font-bold text-left">Create a New Group</h2>
      <CreateGroupForm onSuccess={fetchGroups} />   {/* now matches prop */}
      <h2 className="text-2xl font-bold text-left">Group Details</h2>
      <GroupTable
        groups={groups}
        onDelete={deleteGroup}
        onEdit={(g) => console.log("Edit", g)}
      />
    </div>
  );
};

export default CreateGroup;
