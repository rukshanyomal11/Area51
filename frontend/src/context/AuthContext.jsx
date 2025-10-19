import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/users/profile', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            localStorage.removeItem('token');
            setToken(null);
          }
        } catch (error) {
          console.error('Auth error:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('cart'); // Clear cart on logout
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
