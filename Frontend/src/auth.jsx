import { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from './api.js';
import { clearAuthSession, readAuthUser, writeAuthSession } from './session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readAuthUser());

  async function login(email, password) {
    const { token, user: u } = await api.login(email, password);
    writeAuthSession(token, u);
    setUser(u);
  }

  function logout() {
    clearAuthSession();
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
