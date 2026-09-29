import { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('mv_user'));
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const { token, user: u } = await api.login(email, password);
    localStorage.setItem('mv_token', token);
    localStorage.setItem('mv_user', JSON.stringify(u));
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('mv_token');
    localStorage.removeItem('mv_user');
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
