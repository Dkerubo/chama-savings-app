import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UserGroupIcon, PencilIcon, TrashIcon, EyeIcon, PlusIcon 
} from '@heroicons/react/outline';
import { getGroups, deleteGroup } from '../../services/groupService';
import { useAuth } from '../../context/AuthContext';

const GroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await getGroups(isSuperAdmin);
        setGroups(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch groups');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [isSuperAdmin]);

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(groupId);
        setGroups(groups.filter(g => g.id !== groupId));
      } catch (err) {
        setError(err.message || 'Failed to delete group');
      }
    }
  };

  if (loading) return <div>Loading groups...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isSuperAdmin ? 'All Groups' : 'My Groups'}
        </h1>
        {!isSuperAdmin && (
          <button 
            onClick={() => navigate('/dashboard/groups/create')}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Group
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full">
          {/* Table headers */}
          <thead>
            <tr>
              <th>Name</th>
              <th>Balance</th>
              <th>Members</th>
              <th>Actions</th>
            </tr>
          </thead>
          {/* Table body */}
          <tbody>
            {groups.map(group => (
              <tr key={group.id}>
                <td>{group.name}</td>
                <td>KES {group.balance.toLocaleString()}</td>
                <td>{group.member_count}</td>
                <td>
                  <button onClick={() => navigate(`/dashboard/groups/${group.id}`)}>
                    <EyeIcon className="h-5 w-5 text-blue-500" />
                  </button>
                  {isSuperAdmin && (
                    <>
                      <button onClick={() => navigate(`/dashboard/groups/${group.id}/edit`)}>
                        <PencilIcon className="h-5 w-5 text-yellow-500 mx-2" />
                      </button>
                      <button onClick={() => handleDelete(group.id)}>
                        <TrashIcon className="h-5 w-5 text-red-500" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GroupManagement;