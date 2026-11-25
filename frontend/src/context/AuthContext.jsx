import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { getToken, setToken, clearToken } from '../services/storage';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const homeFor = (role) => (role === 'hr' ? '/hr' : '/employee');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  const refresh = useCallback(async () => {
    try {
      setUser(await authApi.me());
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getToken()) refresh();
  }, [refresh]);

  const login = async ({ email, password, role, remember }) => {
    const data = await authApi.login({ email, password, role });
    setToken(data.token, remember);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await authApi.logout();
    clearToken();
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>;
}
