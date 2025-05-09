import { useState, useEffect } from 'react';
import GroupTable from '../../components/groups/GroupTable';
import CreateGroupForm from '../../components/groups/CreateGroupForm';
import { useAuth } from '../../context/AuthContext';
import { useGroupApi } from '../../context/GroupApiContext';
import { Group, CreateGroupPayload } from '../../types/group';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateGroup = () => {
  const { user } = useAuth();
  const { getAllGroups, getUserGroups, createGroup, deleteGroup } = useGroupApi();

  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchGroups = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response =
        user.role === 'admin' ? await getAllGroups() : await getUserGroups(user.id);
      setGroups(response.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch groups';
      toast.error(errorMessage, { toastId: 'fetch-groups-error' });
      console.error('Error fetching groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const handleCreateGroup = async (data: CreateGroupPayload) => {
    if (!user) return;

    try {
      setIsCreating(true);
      const response = await createGroup(data);
      toast.success('Group created successfully!', { toastId: 'create-group-success' });
      setIsFormOpen(false);
      await fetchGroups();
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to create group';
      toast.error(errorMessage, { toastId: 'create-group-error' });
      console.error('Error creating group:', err);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;

    try {
      setIsDeleting(true);
      await deleteGroup(groupId);
      toast.success('Group deleted successfully!', { toastId: 'delete-group-success' });
      await fetchGroups();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to delete group';
      toast.error(errorMessage, { toastId: 'delete-group-error' });
      console.error('Error deleting group:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-emerald-700 mb-4">Manage Your Groups</h1>

      <button
        onClick={() => setIsFormOpen(true)}
        className="bg-emerald-700 text-white px-4 py-2 rounded mb-4 hover:bg-emerald-800 transition-colors disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Loading...' : 'Create New Group'}
      </button>

      <CreateGroupForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreateGroup}
        isSubmitting={isCreating}
      />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          <span className="ml-3 text-gray-600">Loading groups...</span>
        </div>
      ) : (
        <GroupTable
          groups={groups}
          onDelete={handleDeleteGroup}
          isAdmin={user?.role === 'admin'}
          user={user}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
};

export default CreateGroup;
