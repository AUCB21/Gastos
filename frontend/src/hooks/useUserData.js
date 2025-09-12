import { useState, useEffect } from 'react';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';

export const useUserData = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/user/");
      setUser(response.data);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    setUser(null);
  };

  useEffect(() => {
    // Only fetch user if we have a token
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  return {
    user,
    loading,
    error,
    fetchUser,
    clearUser,
    setUser
  };
};