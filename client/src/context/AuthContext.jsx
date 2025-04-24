import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('userId'),
  });

  useEffect(() => {
    if (auth.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [auth.token]);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const { token, role, user_id } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', user_id);
    setAuth({ token, role, userId: user_id });
    // redirect based on role
    navigate(role === 'admin' ? '/admin' : '/member');
  };

  const logout = () => {
    localStorage.clear();
    setAuth({ token: null, role: null, userId: null });
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
