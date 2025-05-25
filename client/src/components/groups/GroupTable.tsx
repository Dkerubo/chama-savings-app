import { useEffect, useState, useCallback } from 'react';
import { FiUsers, FiMapPin, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { FaMoneyBillWave } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import CreateGroupForm from './CreateGroupForm';
import EditGroupForm from './EditGroupForm';
import InviteMemberForm from './InviteMemberForm';
import { User } from '../../types/index';

interface Group {
  id: number;
  name: string;
  description: string;
  created_at: string;
  target_amount: number;
  current_amount: number;
  is_public: boolean;
  status: 'active' | 'inactive' | 'completed';
  admin_name: string;
  admin_id: number;
  meeting_schedule: string;
  location: string;
  logo_url: string;
  progress: number;
  member_count: number;
}

const API_BASE_URL = 'https://chama-savings-app.onrender.com/api/groups';

const GroupTable = () => {
  const { user } = useAuth() as { user: User | null };
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [inviteGroupId, setInviteGroupId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchGroups = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL, { withCredentials: true });
      const all = res.data;
      if (!user) return;

      const filtered =
        user.role === 'admin'
          ? all
          : all.filter(
              (g: Group) => g.is_public || g.admin_id === user.id
            );

      setGroups(filtered);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, { withCredentials: true });
      setGroups(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete group. Please try again.');
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'ID', 'Name', 'Admin Name', 'Target Amount', 'Current Amount',
      'Status', 'Location', 'Meeting Schedule', 'Progress', 'Members Count'
    ];

    const rows = groups.map(group => [
      group.id,
      group.name,
      group.admin_name,
      group.target_amount,
      group.current_amount,
      group.status,
      group.location || 'N/A',
      group.meeting_schedule || 'N/A',
      `${group.progress.toFixed(1)}%`,
      group.member_count
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const encodedUri = encodeURI(`data:text/csv;charset=utf-8,${csvContent}`);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'groups.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGroups.length / pageSize);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderStatusBadge = (status: Group['status']) => {
    const statusClasses = {
      active: 'bg-emerald-100 text-emerald-800',
      inactive: 'bg-gray-300 text-gray-700',
      completed: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${statusClasses[status]}`}>{status}</span>
    );
  };

  const renderActionButtons = (group: Group) => {
    if (!user || (user.role !== 'admin' && user.id !== group.admin_id)) return null;

    return (
      <div className="flex gap-2">
        <button
          className="text-emerald-700 hover:text-emerald-900"
          onClick={() => setEditGroup(group)}
          aria-label="Edit group"
        >
          <FiEdit2 />
        </button>
        <button
          className="text-red-600 hover:text-red-800"
          onClick={() => handleDelete(group.id)}
          aria-label="Delete group"
        >
          <FiTrash2 />
        </button>
        <button
          className="text-blue-600 hover:text-blue-800"
          onClick={() => setInviteGroupId(group.id)}
          aria-label="Invite to group"
        >
          Invite
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-emerald-700">Group Dashboard</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search group..."
            className="border rounded px-3 py-2 text-sm w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="border border-emerald-700 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-50"
            >
              Export CSV
            </button>
            {(user?.role === 'admin' || user?.id) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800"
              >
                + Create Group
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full bg-white border">
          <thead className="bg-emerald-700 text-white">
            <tr>
              <th className="py-3 px-4 text-left">#</th>
              <th className="py-3 px-4 text-left">Name</th>
              <th className="py-3 px-4 text-left">Admin</th>
              <th className="py-3 px-4 text-left">Target</th>
              <th className="py-3 px-4 text-left">Progress</th>
              <th className="py-3 px-4 text-left">Members</th>
              <th className="py-3 px-4 text-left">Meeting</th>
              <th className="py-3 px-4 text-left">Location</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedGroups.length > 0 ? (
              paginatedGroups.map((group, index) => (
                <tr key={group.id} className="border-b hover:bg-emerald-50">
                  <td className="py-3 px-4">{(currentPage - 1) * pageSize + index + 1}</td>
                  <td className="py-3 px-4 font-medium flex gap-2 items-center">
                    {group.logo_url && (
                      <img
                        src={group.logo_url}
                        alt={`${group.name} logo`}
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    {group.name}
                  </td>
                  <td className="py-3 px-4">{group.admin_name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-emerald-700 mr-1" />
                      {group.target_amount.toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      <div className="bg-gray-200 rounded-full h-2 w-36">
                        <div
                          className="bg-emerald-700 h-2 rounded-full"
                          style={{ width: `${Math.min(100, group.progress)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {group.progress.toFixed(1)}% ({group.current_amount.toLocaleString()})
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FiUsers className="text-emerald-700 mr-1" />
                      {group.member_count}
                    </div>
                  </td>
                  <td className="py-3 px-4">{group.meeting_schedule || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FiMapPin className="text-emerald-700 mr-1" />
                      {group.location || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4">{renderStatusBadge(group.status)}</td>
                  <td className="py-3 px-4">{renderActionButtons(group)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  No groups found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded border-emerald-700 text-emerald-700 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 border rounded ${
                currentPage === page
                  ? 'bg-emerald-700 text-white'
                  : 'border-emerald-700 text-emerald-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded border-emerald-700 text-emerald-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupForm onSuccess={fetchGroups} onClose={() => setShowCreateModal(false)} />
      )}

      {editGroup && (
        <EditGroupForm group={editGroup} onSuccess={fetchGroups} onClose={() => setEditGroup(null)} />
      )}

      {inviteGroupId && (
        <InviteMemberForm groupId={inviteGroupId} onSuccess={fetchGroups} onClose={() => setInviteGroupId(null)} />
      )}
    </div>
  );
};

export default GroupTable;
