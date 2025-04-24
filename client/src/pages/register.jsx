import { useState } from 'react';
import api from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'member',
    groupId: '', // optional for admin
    groupName: '', // only if creating new group
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        role: formData.role,
        groupId: formData.role === 'member' ? formData.groupId : undefined,
        groupName: formData.role === 'admin' ? formData.groupName : undefined,
      };
      await api.post('/auth/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">Username</label>
          <input
            type="text"
            name="username"
            className="w-full p-2 border rounded"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block">Password</label>
          <input
            type="password"
            name="password"
            className="w-full p-2 border rounded"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label className="block">Role</label>
          <select
            name="role"
            className="w-full p-2 border rounded"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="admin">Admin (Create Group)</option>
            <option value="member">Member (Join Group)</option>
          </select>
        </div>
        {formData.role === 'admin' ? (
          <div>
            <label className="block">Group Name</label>
            <input
              type="text"
              name="groupName"
              className="w-full p-2 border rounded"
              value={formData.groupName}
              onChange={handleChange}
              required
            />
          </div>
        ) : (
          <div>
            <label className="block">Group ID</label>
            <input
              type="text"
              name="groupId"
              className="w-full p-2 border rounded"
              value={formData.groupId}
              onChange={handleChange}
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full py-2 bg-primary text-white rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>
    </div>
  );
}
