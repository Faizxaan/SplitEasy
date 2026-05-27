import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser, registerUser, getCurrentUser } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const persistAuth = (tokenVal, userVal) => {
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('user', JSON.stringify(userVal));
    setToken(tokenVal);
    setUser(userVal);
  };

  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleLogout = () => { clearAuth(); navigate('/login'); };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [clearAuth, navigate]);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setIsLoading(false);
      return;
    }
    getCurrentUser()
      .then((res) => {
        setUser(res.data);
        setToken(storedToken);
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => setIsLoading(false));
  }, [clearAuth]);

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    const { accessToken, userId, fullName, email: userEmail, avatarColor } = res.data;
    persistAuth(accessToken, { id: userId, fullName, email: userEmail, avatarColor });
    return res.data;
  };

  const register = async (fullName, email, password) => {
    const res = await registerUser({ fullName, email, password });
    const { accessToken, userId, fullName: name, email: userEmail, avatarColor } = res.data;
    persistAuth(accessToken, { id: userId, fullName: name, email: userEmail, avatarColor });
    return res.data;
  };

  const logout = useCallback(() => {
    clearAuth();
    toast.success('Logged out successfully');
    navigate('/');
  }, [clearAuth, navigate]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
