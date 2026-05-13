import { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    authApi.getProfile()
      .then((profile) => setUser(profile))
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    // authApi.login trả { token, user } sau khi axiosClient unwrap data
    const result = await authApi.login({ email, password });
    localStorage.setItem('token', result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch { /* stateless — ignore */ }
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const updateUser = useCallback((payload) => {
    setUser((prev) => ({ ...prev, ...payload }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
