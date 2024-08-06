import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Register.css';

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
    <div className="container mt-4">
      <h2 className='text1'>Registrazione</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="text"
            name="nome"
            placeholder="Nome"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="text"
            name="cognome"
            placeholder="Cognome"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="avatar" className="form-label text1">Foto profilo</label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            onChange={handleFileChange}
            className="form-control"
            accept="image/*"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Registrati</button>
      </form>
    </div>
  );
};

export default Register;