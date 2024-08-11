import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminForms.css';
import CustomDatePicker from './CustomDatePicker';

const API_URL = import.meta.env.VITE_API_URL;

const AddGroupForm = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    debutDate: null,
    company: '',
    fanclubName: '',
    socialMedia: {
      youtube: '',
      x: '',
      instagram: ''
    }
  });
  const [coverImage, setCoverImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleDateChange = (date) => {
    setFormData(prevState => ({
      ...prevState,
      debutDate: date
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      socialMedia: {
        ...prevState.socialMedia,
        [name]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formDataToSend = new FormData();
    const groupData = {
      ...formData,
      type: type,
      debutDate: formData.debutDate ? formData.debutDate.toISOString() : null
    };
    console.log("Dati del gruppo da inviare:", groupData);
    formDataToSend.append('groupData', JSON.stringify(groupData));
    if (coverImage) {
      formDataToSend.append('coverImage', coverImage);
      console.log("Immagine di copertina allegata");
    }
  
    try {
      const response = await axios.post(`${API_URL}/api/groups`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Gruppo creato con successo:', response.data);
      navigate('/admin');
    } catch (error) {
      console.error('Errore nella creazione del gruppo:', error);
      alert('Errore nella creazione del gruppo: ' + (error.response ? error.response.data.message : error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Aggiungi Gruppo {type === 'male-group' ? 'Maschile' : 'Femminile'}</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Nome</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />

        <label htmlFor="description">Descrizione</label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} required />

        <label htmlFor="debutDate">Data di debutto</label>
        <CustomDatePicker
          selected={formData.debutDate}
          onChange={handleDateChange}
          placeholderText="Seleziona la data di debutto"
        />

        <label htmlFor="company">Agenzia</label>
        <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} />

        <label htmlFor="fanclubName">Nome Fanclub</label>
        <input type="text" id="fanclubName" name="fanclubName" value={formData.fanclubName} onChange={handleChange} />

        <label htmlFor="coverImage">Immagine di copertina</label>
        <input type="file" id="coverImage" name="coverImage" onChange={handleImageChange} />

        <h3>Social Media</h3>
        <label htmlFor="youtube">YouTube</label>
        <input type="text" id="youtube" name="youtube" value={formData.socialMedia.youtube} onChange={handleSocialMediaChange} />

        <label htmlFor="x">X (Twitter)</label>
        <input type="text" id="x" name="x" value={formData.socialMedia.x} onChange={handleSocialMediaChange} />

        <label htmlFor="instagram">Instagram</label>
        <input type="text" id="instagram" name="instagram" value={formData.socialMedia.instagram} onChange={handleSocialMediaChange} />

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creazione in corso...' : 'Crea Gruppo'}
        </button>
      </form>
    </div>
  );
};

export default AddGroupForm;