import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      twitter: '',
      facebook: ''
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
    
    // Converti le date in formato ISO
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
    <div className="container mt-4">
      <h2>Modifica Gruppo</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Descrizione</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="debutDate" className="form-label">Data di debutto</label>
          <input
            type="date"
            className="form-control"
            id="debutDate"
            name="debutDate"
            value={formData.debutDate ? formData.debutDate.split('T')[0] : ''}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="company" className="form-label">Agenzia</label>
          <input
            type="text"
            className="form-control"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="fanclubName" className="form-label">Nome Fanclub</label>
          <input
            type="text"
            className="form-control"
            id="fanclubName"
            name="fanclubName"
            value={formData.fanclubName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="coverImage" className="form-label">Immagine di copertina</label>
          <input
            type="file"
            className="form-control"
            id="coverImage"
            name="coverImage"
            onChange={handleImageChange}
          />
        </div>
        <h3>Social Media</h3>
        <div className="mb-3">
          <label htmlFor="youtube" className="form-label">YouTube</label>
          <input
            type="text"
            className="form-control"
            id="youtube"
            name="youtube"
            value={formData.socialMedia.youtube}
            onChange={handleSocialMediaChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="twitter" className="form-label">Twitter</label>
          <input
            type="text"
            className="form-control"
            id="twitter"
            name="twitter"
            value={formData.socialMedia.twitter}
            onChange={handleSocialMediaChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="facebook" className="form-label">Facebook</label>
          <input
            type="text"
            className="form-control"
            id="facebook"
            name="facebook"
            value={formData.socialMedia.facebook}
            onChange={handleSocialMediaChange}
          />
        </div>
        <button type="submit" className="btn btn-primary">Aggiorna Gruppo</button>
      </form>
    </div>
  );
};

export default EditGroupForm;