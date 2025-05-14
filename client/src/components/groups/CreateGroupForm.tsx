// src/components/groups/CreateGroupForm.tsx

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types/index';

interface Props {
  onSuccess: () => void;
  onClose: () => void;
}

const CreateGroupForm = ({ onSuccess, onClose }: Props) => {
  const auth = useAuth();
  const user = auth.user as User | null;
  const token = localStorage.getItem('token');

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
    const newValue =
      type === 'checkbox' && 'checked' in e.target
        ? (e.target as HTMLInputElement).checked
        : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return alert('You must be logged in to create a group.');

    try {
      const payload = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        admin_id: user.id,
      };

      await axios.post(
        'http://localhost:5000/api/groups/',
        payload,
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
    } catch (err) {
      console.error('Create group failed:', err);
      alert('Failed to create group. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold text-emerald-700 mb-4">Create Group</h2>
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
