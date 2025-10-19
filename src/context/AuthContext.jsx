import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, registerUser, getCurrentUser } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const result = loginUser(email, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const register = (username, email, password) => {
    const result = registerUser(username, email, password);
    if (result.success) {
      setUser(result.user);
      localStorage.setItem('currentUser', JSON.stringify(result.user));
    }
    return result;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};