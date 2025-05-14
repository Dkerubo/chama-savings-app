// src/components/groups/InviteMemberForm.tsx

import { useState } from 'react';
import axios from 'axios';

interface Props {
  groupId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const InviteMemberForm = ({ groupId, onClose, onSuccess }: Props) => {
  const [email, setEmail] = useState('');
  const token = localStorage.getItem('token');

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Authentication token missing. Please log in again.');
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/members/invite`,
        { group_id: groupId, email },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Invitation failed', error);
      alert('Failed to send invitation. Please check the email and try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-emerald-700">Invite Member</h2>
        <form onSubmit={handleInvite} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Member Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border text-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Send Invite
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberForm;