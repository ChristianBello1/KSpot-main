import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminForms.css';

const API_URL = import.meta.env.VITE_API_URL;

const EditGroupForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    debutDate: '',
    company: '',
    fanclubName: '',
    socialMedia: {
      youtube: '',
      x: '',
      instagram: ''
    }
  });
  const [coverImage, setCoverImage] = useState(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/groups/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error('Errore nel recupero dei dati del gruppo:', error);
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
    const formDataToSend = new FormData();
    
    const updatedFormData = {
      ...formData,
      debutDate: formData.debutDate ? new Date(formData.debutDate).toISOString() : null
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
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Modifica Gruppo</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome" required />
        <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Descrizione" required />
        <input type="date" name="debutDate" value={formData.debutDate ? formData.debutDate.split('T')[0] : ''} onChange={handleChange} placeholder="Data di debutto" />
        <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Agenzia" />
        <input type="text" name="fanclubName" value={formData.fanclubName} onChange={handleChange} placeholder="Nome Fanclub" />
        <input type="file" onChange={handleImageChange} />
        <h3>Social Media</h3>
        <input type="text" name="youtube" value={formData.socialMedia.youtube} onChange={handleSocialMediaChange} placeholder="YouTube" />
        <input type="text" name="x" value={formData.socialMedia.x} onChange={handleSocialMediaChange} placeholder="X (Twitter)" />
        <input type="text" name="instagram" value={formData.socialMedia.instagram} onChange={handleSocialMediaChange} placeholder="Instagram" />
        <button type="submit">Aggiorna Gruppo</button>
      </form>
    </div>
  );
};

export default EditGroupForm;