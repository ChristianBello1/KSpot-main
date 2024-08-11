import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminForms.css';
import CustomDatePicker from './CustomDatePicker';

const API_URL = import.meta.env.VITE_API_URL;

const EditGroupForm = () => {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchGroupData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/groups/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = response.data;
        setFormData({
          ...data,
          debutDate: data.debutDate ? new Date(data.debutDate) : null
        });
      } catch (error) {
        console.error('Errore nel recupero dei dati del gruppo:', error);
        alert('Errore nel recupero dei dati del gruppo');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchGroupData();
  }, [id]);

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
    
    const updatedFormData = {
      ...formData,
      debutDate: formData.debutDate ? formData.debutDate.toISOString() : null
    };
    
    formDataToSend.append('groupData', JSON.stringify(updatedFormData));
    if (coverImage) {
      formDataToSend.append('coverImage', coverImage);
    }
  
    try {
      const response = await axios.put(`${API_URL}/api/groups/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Risposta del server:', response.data);
      if (response.data) {
        alert('Gruppo aggiornato con successo!');
        navigate('/admin');
      } else {
        alert('Errore nell\'aggiornamento del gruppo');
      }
    } catch (error) {
      console.error('Errore nella modifica del gruppo:', error.response ? error.response.data : error);
      alert('Errore nella modifica del gruppo: ' + (error.response ? error.response.data.message : error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Modifica Gruppo</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrizione" required />
        <CustomDatePicker
          selected={formData.debutDate}
          onChange={handleDateChange}
          placeholderText="Data di debutto"
        />
        <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Agenzia" />
        <input type="text" name="fanclubName" value={formData.fanclubName} onChange={handleChange} placeholder="Nome Fanclub" />
        <input type="file" onChange={handleImageChange} />
        <h3>Social Media</h3>
        <input type="text" name="youtube" value={formData.socialMedia.youtube} onChange={handleSocialMediaChange} placeholder="YouTube" />
        <input type="text" name="x" value={formData.socialMedia.x} onChange={handleSocialMediaChange} placeholder="X (Twitter)" />
        <input type="text" name="instagram" value={formData.socialMedia.instagram} onChange={handleSocialMediaChange} placeholder="Instagram" />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Aggiornamento in corso...' : 'Aggiorna Gruppo'}
        </button>
      </form>
    </div>
  );
};

export default EditGroupForm;