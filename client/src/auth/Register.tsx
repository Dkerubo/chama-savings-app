import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface FormState {
  username: string;
  email: string;
  password: string;
  phone_number?: string;
}

const Register: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    username: '',
    email: '',
    password: '',
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
    
    // Validate all fields before submission
    const isValid = Object.entries(form).every(([name, value]) => {
      if (name === 'phone_number') return true; // Skip optional field
      return validateField(name, value);
    });

    if (!isValid || Object.keys(errors).length > 0) {
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password,
        phone_number: form.phone_number || undefined
      });

      if (response.status === 201) {
        navigate('/login', {
          state: {
            registrationSuccess: true,
            email: form.email,
          },
          replace: true
        });
      }
    } catch (err: any) {
      if (err.response?.data?.details) {
        // Handle backend validation errors
        const backendErrors = err.response.data.details;
        if (typeof backendErrors === 'string') {
          setErrors({ form: backendErrors });
        } else {
          setErrors(backendErrors);
        }
      } else {
        setErrors({
          form: err.response?.data?.error || 
               err.message || 
               'Registration failed. Please try again.'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-emerald-900 via-emerald-600 to-emerald-700">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Create an Account</h2>

        {errors.form && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Enter your username (3-20 characters)"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.username ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500'
              }`}
              value={form.username}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength={3}
              maxLength={20}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="username"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500'
              }`}
              value={form.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              autoComplete="email"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password (min 8 characters)"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-emerald-500'
              }`}
              value={form.password}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              minLength={8}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              placeholder="Enter your phone number"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={form.phone_number}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || Object.keys(errors).length > 0}
            className={`w-full py-2 rounded-lg transition flex justify-center items-center ${
              isLoading || Object.keys(errors).length > 0
                ? 'bg-emerald-400 cursor-not-allowed' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            } text-white`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Account...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-4 text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-emerald-600 hover:underline font-medium">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;