import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import toast from 'react-hot-toast';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const CreateGroupForm: React.FC<Props> = ({ onSuccess, onClose }) => {
  const { user, token } = useAuth() as {
    user: User | null;
    token: string | null;
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    target_amount: '',
    meeting_schedule: '',
    location: '',
    logo_url: '',
    is_public: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!user || !token) {
      toast.error('You must be logged in to create a group.');
      return;
    }

    const target = parseFloat(formData.target_amount);
    if (isNaN(target) || target <= 0) {
      toast.error('Please enter a valid target amount.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      target_amount: target,
      meeting_schedule: formData.meeting_schedule.trim() || null,
      location: formData.location.trim() || null,
      logo_url: formData.logo_url.trim() || null,
      is_public: formData.is_public,
    };

    try {
      const res = await axios.post('http://localhost:5000/api/groups/', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      if (res.status === 201) {
        toast.success('Group created successfully!');
        onSuccess();
        onClose();
      } else {
        toast.error('Unexpected server response. Try again.');
      }
    } catch (err: any) {
      console.error('Create group failed:', err.response?.data || err.message);
      toast.error(
        err.response?.data?.error ||
          'Failed to create group. Please check your input and try again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">Create New Group</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-1">Group Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Umoja Savings"
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What is this group about?"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Target Amount (KES)</label>
            <input
              type="number"
              name="target_amount"
              value={formData.target_amount}
              onChange={handleChange}
              placeholder="e.g. 50000"
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Meeting Schedule</label>
            <input
              type="text"
              name="meeting_schedule"
              value={formData.meeting_schedule}
              onChange={handleChange}
              placeholder="e.g. Every first Saturday"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Nairobi, Kenya"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="text-sm text-gray-700 block mb-1">Logo URL</label>
            <input
              type="text"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              placeholder="e.g. https://example.com/logo.png"
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="accent-emerald-700"
            />
            <label className="text-sm text-gray-700">Make group public</label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupForm;
