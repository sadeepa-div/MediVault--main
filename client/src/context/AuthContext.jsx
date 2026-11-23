import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshCart = useCallback(async (u = user) => {
    if (u?.role !== 'customer') return setCart([]);
    try { setCart(await api('/me/cart')); } catch { /* ignore */ }
  }, [user]);

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then(async (u) => { setUser(u); await refreshCart(u); })
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (username, password) => {
    const { token, user: u } = await api('/auth/login', { method: 'POST', body: { username, password } });
    setToken(token);
    setUser(u);
    refreshCart(u);
    return u;
  };

  const register = async (data) => {
    const { token, user: u } = await api('/auth/register', { method: 'POST', body: data });
    setToken(token);
    setUser(u);
    return u;
  };

  const logout = () => { setToken(null); setUser(null); setCart([]); };

  const addToCart = async (medicine_id, quantity = 1) => {
    const rows = await api('/me/cart', { method: 'POST', body: { medicine_id, quantity } });
    setCart(rows);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, cart, setCart, refreshCart, addToCart, toast, showToast }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
