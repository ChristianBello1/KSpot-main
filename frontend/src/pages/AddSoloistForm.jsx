import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminForms.css';

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
    bio: '',
    company: '',
    debutDate: '',
    type: `${gender}-solo`,
    socialMedia: {
      youtube: '',
      x: '',
      instagram: ''
    }
  });
  const [photo, setPhoto] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prevState => ({
        ...prevState,
        [parent]: {
          ...prevState[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();

    // Converti l'oggetto formData in un oggetto semplice
    const dataToSend = {
      ...formData,
      socialMedia: {
        youtube: formData.socialMedia.youtube,
        x: formData.socialMedia.x,
        instagram: formData.socialMedia.instagram
      }
    };

    // Aggiungi tutti i campi al FormData
    Object.keys(dataToSend).forEach(key => {
      if (typeof dataToSend[key] === 'object') {
        formDataToSend.append(key, JSON.stringify(dataToSend[key]));
      } else {
        formDataToSend.append(key, dataToSend[key]);
      }
    });

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
      alert('Errore nella creazione del solista. Per favore, controlla i dati e riprova.');
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Aggiungi Solista {gender === 'male' ? 'Maschile' : 'Femminile'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome" required />
        <input type="text" name="stageName" value={formData.stageName} onChange={handleChange} placeholder="Nome d'arte" />
        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} placeholder="Data di nascita" />
        <input type="text" name="zodiacSign" value={formData.zodiacSign} onChange={handleChange} placeholder="Segno zodiacale" />
        <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="Altezza (cm)" />
        <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="Peso (kg)" />
        <input type="text" name="mbtiType" value={formData.mbtiType} onChange={handleChange} placeholder="Tipo MBTI" />
        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nazionalità" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Biografia" />
        <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Agenzia" />
        <input type="date" name="debutDate" value={formData.debutDate} onChange={handleChange} placeholder="Data di debutto" />
        <input type="file" onChange={handlePhotoChange} />
        <h3>Social Media</h3>
        <input type="text" name="socialMedia.youtube" value={formData.socialMedia.youtube} onChange={handleChange} placeholder="YouTube" />
        <input type="text" name="socialMedia.x" value={formData.socialMedia.x} onChange={handleChange} placeholder="X (Twitter)" />
        <input type="text" name="socialMedia.instagram" value={formData.socialMedia.instagram} onChange={handleChange} placeholder="Instagram" />
        <button type="submit">Crea Solista</button>
      </form>
    </div>
  );
};

export default AddSoloistForm;