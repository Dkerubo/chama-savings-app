import React, { useState, ChangeEvent, FormEvent } from 'react';
import api from '../../api';

interface FormState {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
}

const UserForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    phone_number: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (!value.match(/^[a-zA-Z0-9_]{3,20}$/)) {
          newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscores)';
        } else {
          delete newErrors.username;
        }
        break;
      case 'email':
        if (!value.match(/^[^@]+@[^@]+\.[^@]+$/)) {
          newErrors.email = 'Invalid email format';
        } else {
          delete newErrors.email;
        }
        break;
      case 'password':
        if (value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    const isValid = Object.entries(form).every(([name, value]) => {
      if (name === 'phone_number') return true;
      return validateField(name, value);
    });

    if (!isValid || Object.keys(errors).length > 0) return;

    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number || undefined
      });

      if (response.status === 201) {
        setSuccess(`User "${form.username}" created successfully!`);
        setForm({
          username: '',
          email: '',
          password: '',
          phone_number: ''
        });

        // Optional page refresh after delay
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (err: any) {
      const backendData = err.response?.data;

      if (backendData?.details) {
        if (typeof backendData.details === 'string') {
          setErrors({ form: backendData.details });
        } else if (typeof backendData.details === 'object') {
          setErrors(backendData.details);
        } else {
          setErrors({ form: 'Unexpected error format from server.' });
        }
      } else {
        setErrors({
          form: backendData?.error || err.message || 'Failed to create user.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">{success}</div>
      )}

      {errors.form && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{errors.form}</div>
      )}

      <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" noValidate>
        {/* Username */}
        <div className="flex flex-col">
          <label htmlFor="username" className="text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.username ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500'
            }`}
            placeholder="e.g. admin123"
            value={form.username}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.username && <p className="text-sm text-red-600 mt-1">{errors.username}</p>}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500'
            }`}
            placeholder="e.g. user@example.com"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label htmlFor="password" className="text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500'
            }`}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
        </div>

        {/* Phone Number */}
        <div className="flex flex-col">
          <label htmlFor="phone_number" className="text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="e.g. +123456789"
            value={form.phone_number}
            onChange={handleChange}
          />
        </div>

        {/* Submit button spans both columns */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 disabled:bg-emerald-400"
          >
            {isLoading ? 'Creating...' : 'Add User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
