import { createContext, useContext, useEffect, useState } from 'react';
import api from './api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api.get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = (data) => {
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };
  const login = async (email, password) =>
    authenticate((await api.post('/auth/login', { email, password })).data);
  const register = async (form) =>
    authenticate((await api.post('/auth/register', form)).data);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
