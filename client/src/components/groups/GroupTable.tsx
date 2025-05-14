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
const API_BASE_URL = 'http://localhost:5000/api/groups';

const GroupTable = () => {

  const auth = useAuth();
  const user = auth.user as User | null;
  const [groups, setGroups] = useState<Group[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [inviteGroupId, setInviteGroupId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const fetchGroups = useCallback(async () => {
    try {
      const res = await axios.get(API_BASE_URL, {
        withCredentials: true,
      });
      setGroups(res.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this group?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/${id}`, {
        withCredentials: true,
      });
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

 const filteredGroups = groups
  .filter(group => {
    if (!user) return false;
    if (selectedTab === 0 && user.role !== 'admin') {
      return group.admin_id === user.id; 
    }
    return true;
  })
    .filter(group => 
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const totalPages = Math.ceil(filteredGroups.length / pageSize);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-center text-emerald-700">Loading groups...</p>
      </div>
    );
  }

  const renderStatusBadge = (status: Group['status']) => {
    const statusClasses = {
      active: 'bg-emerald-100 text-emerald-800',
      inactive: 'bg-gray-300 text-gray-700',
      completed: 'bg-blue-100 text-blue-800'
    };

    return (
      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const renderActionButtons = (group: Group) => {
    if (!user || !(user.role === 'admin' || user.id === group.admin_id)) {
      return null;
    }

    return (
      <>
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
      </>
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
              className="border border-emerald-700 text-emerald-700 px-4 py-2 rounded hover:bg-emerald-50 whitespace-nowrap"
            >
              Export CSV
            </button>
            {(user?.role === 'admin' || user?.id) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-700 text-white px-4 py-2 rounded hover:bg-emerald-800 whitespace-nowrap"
              >
                + Create Group
              </button>
            )}
          </div>
        </div>
      </div>

      {user?.role !== 'admin' && (
        <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
          <Tab.List className="flex gap-4 mb-6">
            <Tab
              className={({ selected }) =>
                classNames(
                  'px-4 py-2 rounded-full border text-sm',
                  selected
                    ? 'bg-emerald-700 text-white'
                    : 'border-emerald-700 text-emerald-700 hover:bg-emerald-100'
                )
              }
            >
              Your Groups
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'px-4 py-2 rounded-full border text-sm',
                  selected
                    ? 'bg-emerald-700 text-white'
                    : 'border-emerald-700 text-emerald-700 hover:bg-emerald-100'
                )
              }
            >
              All Groups
            </Tab>
          </Tab.List>
        </Tab.Group>
      )}

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
                    <span>{group.name}</span>
                  </td>
                  <td className="py-3 px-4">{group.admin_name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-emerald-700 mr-2" />
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
                      <FiUsers className="text-emerald-700 mr-2" />
                      {group.member_count}
                    </div>
                  </td>
                  <td className="py-3 px-4">{group.meeting_schedule || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <FiMapPin className="text-emerald-700 mr-2" />
                      {group.location || 'N/A'}
                    </div>
                  </td>
                  <td className="py-3 px-4">{renderStatusBadge(group.status)}</td>
                  <td className="py-3 px-4 space-x-2">
                    {renderActionButtons(group)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="py-8 text-center text-gray-500">
                  No groups found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded border-emerald-700 text-emerald-700 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = currentPage <= 3
              ? i + 1
              : currentPage >= totalPages - 2
                ? totalPages - 4 + i
                : currentPage - 2 + i;
            return (
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
            );
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded border-emerald-700 text-emerald-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateGroupForm
          onSuccess={() => {
            fetchGroups();
            setShowCreateModal(false);
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editGroup && (
        <EditGroupForm
          group={editGroup}
          onSuccess={() => {
            fetchGroups();
            setEditGroup(null);
          }}
          onClose={() => setEditGroup(null)}
        />
      )}

      {inviteGroupId && (
        <InviteMemberForm
          groupId={inviteGroupId}
          onSuccess={() => {
            fetchGroups();
            setInviteGroupId(null);
          }}
          onClose={() => setInviteGroupId(null)}
        />
      )}
    </div>
  );
};

export default GroupTable;