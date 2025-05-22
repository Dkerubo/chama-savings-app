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
    phone_number: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'username':
        if (!value.match(/^[a-zA-Z0-9_]{3,20}$/)) {
          newErrors.username = '3-20 characters (letters, numbers, underscores)';
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
          newErrors.password = 'Must be at least 8 characters';
        } else {
          delete newErrors.password;
        }

        if (form.confirm_password && form.confirm_password !== value) {
          newErrors.confirm_password = 'Passwords do not match';
        } else {
          delete newErrors.confirm_password;
        }
        break;
      case 'confirm_password':
        if (value !== form.password) {
          newErrors.confirm_password = 'Passwords do not match';
        } else {
          delete newErrors.confirm_password;
        }
        break;
      case 'phone_number':
        if (!value.match(/^\+?\d{9,15}$/)) {
          newErrors.phone_number = 'Enter a valid phone number';
        } else {
          delete newErrors.phone_number;
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

    const isValid = Object.entries(form).every(([name, value]) =>
      validateField(name, value)
    );

    if (!isValid || Object.keys(errors).length > 0) {
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }

      toast.success('Registration successful! Logging in...', { id: toastId });

      const loginResponse = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      let loginData: any = null;

      try {
        loginData = await loginResponse.clone().json(); // try parsing as JSON
      } catch {
        const text = await loginResponse.text(); // fallback to text
        console.error('Unexpected response:', text);
        throw new Error('Failed to parse login response JSON.');
      }

      if (!loginResponse.ok) {
        throw new Error(loginData?.error || 'Login failed after registration');
      }

      const { access_token, refresh_token, user } = loginData;

      localStorage.setItem('token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      navigate(
        user.role === 'superadmin' ? '/admin/AdminDashboard' : '/member/Dashboard',
        { state: { registrationSuccess: true }, replace: true }
      );
    } catch (err: any) {
      toast.error('Registration failed.', { id: toastId });
      setErrors({
        form: err.message || 'Something went wrong.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-emerald-900 via-emerald-600 to-emerald-700">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-emerald-700 mb-6">Sign Up</h2>

        {errors.form && (
          <div className="mb-4 bg-red-100 text-red-700 p-3 rounded text-sm">{errors.form}</div>
        )}

        <form onSubmit={handleRegister} className="space-y-5" noValidate>
          {[
            { id: 'username', label: 'Username', type: 'text', placeholder: 'Your username' },
            { id: 'email', label: 'Email Address', type: 'email', placeholder: 'Your email' },
            { id: 'password', label: 'Password', type: 'password', placeholder: 'Minimum 8 characters' },
            { id: 'confirm_password', label: 'Confirm Password', type: 'password', placeholder: 'Re-enter password' },
            { id: 'phone_number', label: 'Phone Number', type: 'tel', placeholder: 'e.g. +254712345678' }
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
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
              {errors[id] && <p className="mt-1 text-sm text-red-600">{errors[id]}</p>}
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
          <a href="/login" className="text-emerald-600 font-medium hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
