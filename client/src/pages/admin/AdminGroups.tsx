import { useEffect, useState } from "react";
import GroupForm from "../../components/shared/GroupForm";
import GroupTable from "../../components/shared/GroupTable";

const AdminGroups = () => {
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    const res = await fetch("/api/groups");
    const data = await res.json();
    setGroups(data);
  };

  const createGroup = async (group: any) => {
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
    <div>
      <h2 className="text-2xl font-bold mb-4">All Groups</h2>
      <GroupForm onCreate={createGroup} />
      <GroupTable groups={groups} onDelete={deleteGroup} />
    </div>
  );
};

export default AdminGroups;
