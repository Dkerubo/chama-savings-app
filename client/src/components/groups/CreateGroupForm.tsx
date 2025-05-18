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

    setFormData((prev) => ({
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

    const trimmedAmount = formData.target_amount.trim();
    const amount = parseFloat(trimmedAmount);

    if (!trimmedAmount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid target amount.');
      return;
    }

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      target_amount: amount,
      meeting_schedule: formData.meeting_schedule.trim() || null,
      location: formData.location.trim() || null,
      logo_url: formData.logo_url.trim() || null,
      is_public: formData.is_public,
    };

    try {
      await axios.post('http://localhost:5000/api/groups/', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      toast.success('Group created successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Create group failed:', error.response?.data || error.message);
      toast.error(
        error.response?.data?.error ||
          'Failed to create group. Please check your input and try again.'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">
          Create Group
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Group Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="target_amount"
            placeholder="Target Amount"
            value={formData.target_amount}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="text"
            name="meeting_schedule"
            placeholder="Meeting Schedule"
            value={formData.meeting_schedule}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="logo_url"
            placeholder="Logo URL"
            value={formData.logo_url}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="accent-emerald-700"
            />
            Public Group
          </label>
          <div className="flex justify-end gap-2">
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
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupForm;
