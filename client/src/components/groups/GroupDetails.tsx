import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

type Member = {
  id: number;
  username: string;
  avatar_url?: string;
};

type Group = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'archived';
  target_amount: number;
  current_amount: number;
  members: Member[];
};

const GroupDetails: React.FC = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios.get(`/api/groups/${groupId}`)
      .then(res => {
        setGroup(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load group details:', err);
        setLoading(false);
      });
  }, [groupId]);

  if (loading) return <div className="text-center mt-10">Loading group details...</div>;
  if (!group) return <div className="text-center mt-10 text-red-500">Group not found</div>;

  const progress = Math.min((group.current_amount / group.target_amount) * 100, 100);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold mb-2">{group.name}</h2>
        <p className="text-gray-600 mb-4">{group.description}</p>

        <div className="mb-4">
          <div className="text-sm text-gray-700 mb-1">Fundraising Progress</div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            ${group.current_amount} raised of ${group.target_amount}
          </p>
        </div>

        <div className="mb-4">
          <div className="font-semibold text-lg mb-2">Members</div>
          <div className="flex flex-wrap gap-4">
            {group.members.map(member => (
              <div key={member.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded shadow-sm">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt={member.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
                    {member.username[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm">{member.username}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Future Modal buttons for invite/remove here */}
        {/* <InviteMemberModal groupId={group.id} /> */}
        {/* <RemoveMemberModal groupId={group.id} /> */}
      </div>
    </div>
  );
};

export default GroupDetails;
