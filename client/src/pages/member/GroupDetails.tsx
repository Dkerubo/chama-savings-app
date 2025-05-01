import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import InviteMemberForm from "../../components/member/InviteMemberForm";
import GroupMemberTable from "../../components/member/GroupMemberTable";

const GroupDetails = () => {
  const { id } = useParams();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroup = async () => {
      const res = await fetch(`/api/groups/${id}`);
      const data = await res.json();
      setGroup(data);
      setLoading(false);
    };

    if (id) fetchGroup();
  }, [id]);

  if (!id) {
    return <p className="p-6 text-red-600">Invalid group ID</p>;
  }

  if (loading) {
    return <p className="p-6">Loading group details...</p>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">
          Group: {group?.name || `ID: ${id}`}
        </h1>
        <Link
          to="/member/groups"
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to My Groups
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Invite a Member</h2>
          <InviteMemberForm groupId={id} />
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Group Members</h2>
          <GroupMemberTable groupId={id} />
        </div>
      </div>
    </div>
  );
};

export default GroupDetails;
