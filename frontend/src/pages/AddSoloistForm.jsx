import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AddSoloistForm = () => {
  const { gender } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    stageName: '',
    birthday: '',
    zodiacSign: '',
    height: '',
    weight: '',
    mbtiType: '',
    nationality: '',
    instagram: '',
    bio: '',
    company: '',
    debutDate: '',
    type: `${gender}-solo`  // Aggiungi il tipo direttamente nel formData
  });
  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Aggiungi tutti i campi del formData al FormData
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });

    // Aggiungi la foto se presente
    if (photo) {
      formDataToSend.append('photo', photo);
    }

    try {
      const response = await axios.post(`${API_URL}/api/soloists`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Solista creato con successo:', response.data);
      navigate('/admin');
    } catch (error) {
      console.error('Errore nella creazione del solista:', error.response ? error.response.data : error.message);
      // Mostra un messaggio di errore all'utente
      alert('Errore nella creazione del solista. Per favore, controlla i dati e riprova.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Aggiungi Solista {gender === 'male' ? 'Maschile' : 'Femminile'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome</label>
          <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="stageName" className="form-label">Nome d'arte</label>
          <input type="text" className="form-control" id="stageName" name="stageName" value={formData.stageName} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="birthday" className="form-label">Data di nascita</label>
          <input type="date" className="form-control" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="zodiacSign" className="form-label">Segno zodiacale</label>
          <input type="text" className="form-control" id="zodiacSign" name="zodiacSign" value={formData.zodiacSign} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="height" className="form-label">Altezza (cm)</label>
          <input type="number" className="form-control" id="height" name="height" value={formData.height} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="weight" className="form-label">Peso (kg)</label>
          <input type="number" className="form-control" id="weight" name="weight" value={formData.weight} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="mbtiType" className="form-label">Tipo MBTI</label>
          <input type="text" className="form-control" id="mbtiType" name="mbtiType" value={formData.mbtiType} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="nationality" className="form-label">Nazionalità</label>
          <input type="text" className="form-control" id="nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="instagram" className="form-label">Instagram</label>
          <input type="text" className="form-control" id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="bio" className="form-label">Biografia</label>
          <textarea className="form-control" id="bio" name="bio" value={formData.bio} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="company" className="form-label">Agenzia</label>
          <input type="text" className="form-control" id="company" name="company" value={formData.company} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="debutDate" className="form-label">Data di debutto</label>
          <input type="date" className="form-control" id="debutDate" name="debutDate" value={formData.debutDate} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">Foto</label>
          <input type="file" className="form-control" id="photo" onChange={handlePhotoChange} />
        </div>
        <button type="submit" className="btn btn-primary">Crea Solista</button>
      </form>
    </div>
  );
};

export default AddSoloistForm;