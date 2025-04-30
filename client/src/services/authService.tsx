const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const login = async (credentials:any) => {
  const response = await fetch(`${API_URL}/auth/login`,{
    method: "POST",
    headers: {
      "accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(credentials)
  });
  if (!response.ok) {
    throw new Error('Login failed');
  }
  const data = await response.json();
 
  return data;
};

export const register = async (userData:any) => {
  const response = await fetch(`${API_URL}/auth/register`,{
    method: "POST",
    headers: {
      "accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    throw new Error('Register failed');
  }
  const data = await response.json();
 
  return data;
};

export const getCurrentUser = async (userData:any) => {
  const response = await fetch(`${API_URL}/auth/me`,{
    method: "POST",
    headers: {
      "accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(userData)
  });
  if (!response.ok) {
    throw new Error('Fetch failed');
  }
  const data = await response.json();
 
  return data;
};