import { createContext, useState, useEffect, useCallback } from 'react';
import { MOCK_USERS } from '../api/mockData';

export const AuthContext = createContext(null);

const DEV_PASSWORD = '123456';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('mock_user');

    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem('mock_user');
      }
    }

    setLoading(false);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 400));

    const account = MOCK_USERS.find(
      (item) => item.email === email && password === DEV_PASSWORD
    );

    if (!account) {
      throw new Error('Sai email hoặc mật khẩu');
    }

    const { password: _password, ...userData } = account;

    localStorage.setItem('mock_user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('mock_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((payload) => {
    setUser((prev) => {
      const updatedUser = {
        ...prev,
        ...payload,
      };

      localStorage.setItem('mock_user', JSON.stringify(updatedUser));

      const index = MOCK_USERS.findIndex(
        (item) => item.id === updatedUser.id
      );

      if (index !== -1) {
        MOCK_USERS[index] = {
          ...MOCK_USERS[index],
          ...updatedUser,
          updatedAt: new Date().toISOString(),
        };
      }

      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}