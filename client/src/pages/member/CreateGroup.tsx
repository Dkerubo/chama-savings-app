import { useEffect, useState } from "react";
import axios from "axios";
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

const CreateGroupPage: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  // Fetch the user's groups from the backend
  const fetchGroups = async () => {
    try {
      const response = await axios.get("/api/groups/my-groups");
      setGroups(response.data);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
    }
  };

  // Delete a group by its ID
  const handleDelete = async (groupId: number) => {
    try {
      await axios.delete(`/api/groups/${groupId}`);
      await fetchGroups();
    } catch (error) {
      console.error("Failed to delete group:", error);
    }
  };

  // Placeholder for editing a group
  const handleEdit = (group: Group) => {
    console.log("Edit group:", group);
    // TODO: Open edit form/modal with group data
  };

  // Load groups on component mount
  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="p-6 space-y-10">
      {/* Create Group Section */}
      <section>
        <h2 className="text-2xl font-semibold text-emerald-700 mb-2">Create A New Group</h2>
        <p className="text-gray-700 mb-4">
          As a registered member, you can create your own Chama group, invite others to join,
          and manage all aspects of your group's activities.
        </p>
        <CreateGroupForm onSuccess={fetchGroups} />
      </section>

      {/* Group Table Section */}
      <section>
        <h2 className="text-2xl font-semibold text-emerald-700 mb-4">Your Groups</h2>
        <GroupTable groups={groups} onDelete={handleDelete} onEdit={handleEdit} />
      </section>
    </div>
  );
};

export default CreateGroupPage;
