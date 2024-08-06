import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AddGroupForm = () => {
  const { type } = useParams();
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
    const groupData = {
      ...formData,
      type: type // Assicuriamoci che il tipo sia incluso
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
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      console.error('Error config:', error.config);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Aggiungi Gruppo {type === 'male-group' ? 'Maschile' : 'Femminile'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome</label>
          <input type="text" className="form-control" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Descrizione</label>
          <textarea className="form-control" id="description" name="description" value={formData.description} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="debutDate" className="form-label">Data di debutto</label>
          <input type="date" className="form-control" id="debutDate" name="debutDate" value={formData.debutDate} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="company" className="form-label">Agenzia</label>
          <input type="text" className="form-control" id="company" name="company" value={formData.company} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="fanclubName" className="form-label">Nome Fanclub</label>
          <input type="text" className="form-control" id="fanclubName" name="fanclubName" value={formData.fanclubName} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="coverImage" className="form-label">Immagine di copertina</label>
          <input type="file" className="form-control" id="coverImage" name="coverImage" onChange={handleImageChange} />
        </div>
        <h3>Social Media</h3>
        <div className="mb-3">
          <label htmlFor="youtube" className="form-label">YouTube</label>
          <input type="text" className="form-control" id="youtube" name="youtube" value={formData.socialMedia.youtube} onChange={handleSocialMediaChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="twitter" className="form-label">Twitter</label>
          <input type="text" className="form-control" id="twitter" name="twitter" value={formData.socialMedia.twitter} onChange={handleSocialMediaChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="facebook" className="form-label">Facebook</label>
          <input type="text" className="form-control" id="facebook" name="facebook" value={formData.socialMedia.facebook} onChange={handleSocialMediaChange} />
        </div>
        <button type="submit" className="btn btn-primary">Crea Gruppo</button>
      </form>
    </div>
  );
};

export default AddGroupForm;