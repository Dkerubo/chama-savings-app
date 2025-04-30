import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface LoginFormState {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [form, setForm] = useState<LoginFormState>({
    username: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', form);
      const token = res.data.access_token;

      // Store token in localStorage/sessionStorage or handle it as needed
      localStorage.setItem('token', token);

      // Redirect to home page after login
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-brfrom-emerald-900 via-emerald-600 to-emerald-700">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-4">Login to Your Account</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="w-full bg-emerald-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don't have an account?{' '}
          <a href="/register" className="text-emerald-600 hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
