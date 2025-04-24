import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await login(username, password);
    } catch {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
     <form
  onSubmit={handleSubmit}
  className="bg-white p-8 rounded shadow w-full max-w-md mx-auto mt-12"
>
  <h2 className="text-2xl font-bold text-primary mb-6 text-center">Login</h2>
  {error && (
    <p className="text-red-500 text-sm mb-4">{error}</p>
  )}
  <div className="mb-4">
    <label className="block text-sm font-medium">Username</label>
    <input
      type="text"
      className="mt-1 block w-full border-gray-300 rounded p-2"
      value={username}
      onChange={e => setUsername(e.target.value)}
      required
    />
  </div>
  <div className="mb-6">
    <label className="block text-sm font-medium">Password</label>
    <input
      type="password"
      className="mt-1 block w-full border-gray-300 rounded p-2"
      value={password}
      onChange={e => setPassword(e.target.value)}
      required
    />
  </div>
  <button
    type="submit"
    className="w-full py-2 bg-primary text-white rounded hover:bg-green-700"
  >
    Sign In
  </button>
</form>

    </div>
  );
}
