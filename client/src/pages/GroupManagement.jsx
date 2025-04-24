import { useState, useEffect } from 'react';
import api from '../api/apiClient';

export default function GroupManagement() {
  const [groups, setGroups] = useState([]);
  const [newGroup, setNewGroup] = useState('');

  useEffect(() => {
    async function fetchGroups() {
      const res = await api.get('/groups');
      setGroups(res.data);
    }
    fetchGroups();
  }, []);

  const handleAddGroup = async () => {
    if (!newGroup) return;
    await api.post('/groups', { name: newGroup });
    setGroups([...groups, { name: newGroup }]);
    setNewGroup('');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Group Management</h1>
      <div className="flex items-center space-x-4">
        <input
          type="text"
          className="border-gray-300 p-2 rounded"
          placeholder="New Group"
          value={newGroup}
          onChange={(e) => setNewGroup(e.target.value)}
        />
        <button
          className="py-2 px-4 bg-primary text-white rounded hover:bg-green-700"
          onClick={handleAddGroup}
        >
          Add Group
        </button>
      </div>
      <div className="mt-4">
        <h2 className="text-xl">Existing Groups</h2>
        <ul className="list-disc list-inside mt-2">
          {groups.map((group, index) => (
            <li key={index}>{group.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
