import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { addFavorite as apiFavorite, removeFavorite as apiRemoveFavorite, getUserData } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Errore nella verifica del token:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = (userData, token) => {
    console.log("Login user data:", userData); // Aggiungi questo log
    setUser({...userData, avatar: userData.avatar}); // Assicurati che l'avatar sia incluso
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
  };

  const addFavorite = async (artistId, artistType) => {
    try {
      await apiFavorite(artistId, artistType);
      const updatedUser = await getUserData();
      setUser(updatedUser);
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  };
  
  const removeFavorite = async (artistId, artistType) => {
    try {
      await apiRemoveFavorite(artistId, artistType);
      const updatedUser = await getUserData();
      setUser(updatedUser);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  };

  const updateUser = (userData) => {
    console.log("Updating user data:", userData);
    setUser({...userData, avatar: userData.avatar});
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, loading, addFavorite, removeFavorite, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};