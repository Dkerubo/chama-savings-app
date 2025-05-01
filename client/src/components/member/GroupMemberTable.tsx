import { useEffect, useState } from "react";

interface GroupMemberTableProps {
  groupId: string;
}

const GroupMemberTable = ({ groupId }: GroupMemberTableProps) => {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      const res = await fetch(`/api/groups/${groupId}/members`);
      const data = await res.json();
      setMembers(data);
      setLoading(false);
    };

    fetchMembers();
  }, [groupId]);

  if (loading) {
    return <p>Loading members...</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b">Name</th>
            <th className="py-2 px-4 border-b">Email</th>
            <th className="py-2 px-4 border-b">Role</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b">
              <td className="py-2 px-4">{member.name}</td>
              <td className="py-2 px-4">{member.email}</td>
              <td className="py-2 px-4">{member.role}</td>
              <td className="py-2 px-4">
                {/* Here you can add more action buttons if needed */}
                <button className="text-blue-600 hover:underline">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupMemberTable;
