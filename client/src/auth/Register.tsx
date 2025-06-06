import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface FormState {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
  phone_number: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        newErrors.username = /^[a-zA-Z0-9_]{3,20}$/.test(value)
          ? ''
          : '3-20 characters (letters, numbers, underscores)';
        break;
      case 'email':
        newErrors.email = /^[^@]+@[^@]+\.[^@]+$/.test(value)
          ? ''
          : 'Invalid email format';
        break;
      case 'password':
        newErrors.password = value.length < 8 ? 'Must be at least 8 characters' : '';
        if (form.confirm_password && form.confirm_password !== value) {
          newErrors.confirm_password = 'Passwords do not match';
        }
        break;
      case 'confirm_password':
        newErrors.confirm_password = value !== form.password ? 'Passwords do not match' : '';
        break;
      case 'phone_number':
        newErrors.phone_number = /^\+?\d{9,15}$/.test(value)
          ? ''
          : 'Enter a valid phone number';
        break;
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((err) => err === '');
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();

    const isValid = Object.entries(form).every(([name, value]) => validateField(name, value));
    if (!isValid) {
      toast.error('Please correct the highlighted errors.');
      return;
    }

    setErrors({});
    setIsLoading(true);
    const toastId = toast.loading('Registering your account...');

    try {
      const { confirm_password, ...formData } = form;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || 'Registration failed');
      }

      toast.success('Registration successful! Logging in...', { id: toastId });

      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        throw new Error(loginData?.error || 'Login failed after registration');
      }

      const { access_token, refresh_token, user } = loginData;

      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'superadmin' || user.role === 'admin') {
        navigate('/admin/dashboard', { state: { registrationSuccess: true }, replace: true });
      } else {
        navigate('/member/dashboard', { state: { registrationSuccess: true }, replace: true });
      }

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Registration failed.', { id: toastId });
      setErrors({ form: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-emerald-900 via-emerald-600 to-emerald-700">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-emerald-700 mb-6">Sign Up</h2>

        {errors.form && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-sm">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          {[
            { id: 'username', label: 'Username', type: 'text', placeholder: 'Your username' },
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'Your email' },
            { id: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 8 characters' },
            { id: 'confirm_password', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter password' },
            { id: 'phone_number', label: 'Phone Number', type: 'tel', placeholder: 'e.g. +254712345678' },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
              </label>
              <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                value={(form as any)[id]}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                  errors[id] ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500'
                }`}
              />
              {errors[id] && (
                <p className="mt-1 text-sm text-red-600">{errors[id]}</p>
              )}
            </div>
          ))}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white font-semibold py-2 rounded hover:bg-emerald-700 disabled:bg-emerald-400 transition"
          >
            {isLoading ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-600">
          Already registered?{' '}
          <a href="/login" className="text-emerald-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
