import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import styles from './Register.module.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    password: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }
      const response = await registerUser(formDataToSend);
      if (response.user && response.token) {
        login(response.user, response.token);
        navigate('/profile');
      } else {
        throw new Error("Dati di registrazione non validi");
      }
    } catch (error) {
      console.error('Errore nella registrazione:', error);
      setError(error.message || 'Errore durante la registrazione. Riprova.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.h2}>Registrazione</h2>
      {error && <div className={styles.error}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          onChange={handleChange}
          className={styles.form}
          required
        />
        <input
          type="text"
          name="cognome"
          placeholder="Cognome"
          onChange={handleChange}
          className={styles.form}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          className={styles.form}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          className={styles.form}
          required
        />
        <div className={styles.fileInputContainer}>
          <label htmlFor="avatar" className={styles.fileInputLabel}>Scegli una foto profilo</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            onChange={handleFileChange}
            className={styles.fileInput}
            accept="image/*"
            required
          />
        </div>
        <button type="submit" className={styles.button}>Registrati</button>
      </form>
    </div>
  );
};

export default Register;
