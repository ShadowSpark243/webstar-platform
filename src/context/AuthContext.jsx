import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
      const [loading, setLoading] = useState(true);

      // Initial load: Check for saved token and fetch real user data
      useEffect(() => {
            const fetchUser = async () => {
                  const token = localStorage.getItem('webstar_token');
                  if (token) {
                        try {
                              const response = await api.get('/auth/me');
                              if (response.data.success) {
                                    setUser(response.data.user);
                              } else {
                                    logout();
                              }
                        } catch (error) {
                              console.error('Failed to authenticate token:', error);
                              logout();
                        }
                  }
                  setLoading(false);
            };
            fetchUser();
      }, []);

      // Auto-open modal when referral link is visited (?ref=CODE) and user is not logged in
      useEffect(() => {
            const params = new URLSearchParams(window.location.search);
            if (params.get('ref')) {
                  const timer = setTimeout(() => {
                        const token = localStorage.getItem('webstar_token');
                        if (!token) setIsAuthModalOpen(true);
                  }, 600); // Wait for auth check to finish first
                  return () => clearTimeout(timer);
            }
      }, []);

      const login = async (email, password) => {
            try {
                  const response = await api.post('/auth/login', { email, password });
                  const { token, user: userData } = response.data;

                  localStorage.setItem('webstar_token', token);
                  setUser(userData);
                  setIsAuthModalOpen(false);
                  return { success: true };
            } catch (error) {
                  console.error('Login Error:', error.response?.data || error.message);
                  return { success: false, message: error.response?.data?.message || 'Login failed.' };
            }
      };

      const register = async (fullName, email, username, phone, password, referralCode) => {
            try {
                  const response = await api.post('/auth/register', {
                        fullName, email, username, password, referralCode, phone
                  });
                  const { token, user: userData } = response.data;

                  localStorage.setItem('webstar_token', token);
                  setUser(userData);
                  setIsAuthModalOpen(false);
                  return { success: true };
            } catch (error) {
                  console.error('Registration Error:', error.response?.data || error.message);
                  return { success: false, message: error.response?.data?.message || 'Registration failed.' };
            }
      };

      const logout = () => {
            setUser(null);
            localStorage.removeItem('webstar_token');
            localStorage.removeItem('webstar_dummy_user'); // Clean up old data just in case
      };

      return (
            <AuthContext.Provider value={{
                  user,
                  setUser,
                  loading,
                  login,
                  register,
                  logout,
                  isAuthModalOpen,
                  setIsAuthModalOpen
            }}>
                  {children}
            </AuthContext.Provider>
      );
};
