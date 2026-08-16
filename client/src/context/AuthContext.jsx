import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('waitless_jwt_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('waitless_refresh_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json();
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            await handleRefreshToken();
          }
        } catch (err) {
          console.warn('Auth init failed, offline mode:', err);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleRefreshToken = async () => {
    if (!refreshToken) {
      logout();
      return false;
    }
    try {
      const res = await fetch('/api/auth/refresh-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      const data = await res.json();
      if (data.success && data.accessToken) {
        setToken(data.accessToken);
        localStorage.setItem('waitless_jwt_token', data.accessToken);
        if (data.refreshToken) {
          setRefreshToken(data.refreshToken);
          localStorage.setItem('waitless_refresh_token', data.refreshToken);
        }
        const userRes = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${data.accessToken}` }
        });
        const userData = await userRes.json();
        if (userData.success) setUser(userData.user);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (e) {
      logout();
      return false;
    }
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Invalid email or password.');
        return false;
      }

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);

      localStorage.setItem('waitless_jwt_token', data.accessToken);
      localStorage.setItem('waitless_refresh_token', data.refreshToken);
      localStorage.setItem('waitless_auth_v2', 'true');

      return true;
    } catch (err) {
      setAuthError('Unable to connect to server. Please check your connection.');
      return false;
    }
  };

  const signup = async (name, email, password, role = 'customer') => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuthError(data.message || 'Registration failed.');
        return false;
      }

      setToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setUser(data.user);

      localStorage.setItem('waitless_jwt_token', data.accessToken);
      localStorage.setItem('waitless_refresh_token', data.refreshToken);
      localStorage.setItem('waitless_auth_v2', 'true');

      return true;
    } catch (err) {
      setAuthError('Server error during registration.');
      return false;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ refreshToken })
        });
      } catch (e) {
        // Ignore logout network errors
      }
    }
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('waitless_jwt_token');
    localStorage.removeItem('waitless_refresh_token');
    localStorage.removeItem('waitless_auth_v2');
  };

  const forgotPassword = async (email) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: 'Network error processing reset request.' };
    }
  };

  const resetPassword = async (token, newPassword) => {
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      return { success: false, message: 'Network error resetting password.' };
    }
  };

  const updateProfile = async (profileData) => {
    if (!token) return false;
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setUser(prev => ({ ...prev, ...data.data }));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user || localStorage.getItem('waitless_auth_v2') === 'true',
    loading,
    authError,
    setAuthError,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
