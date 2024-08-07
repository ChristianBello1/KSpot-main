import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const EditSoloistForm = () => {
  const { id } = useParams();
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
    socialMedia: {
      youtube: '',
      x: '',
      instagram: ''
    }
  });
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    const fetchSoloistData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/soloists/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = response.data;
        data.birthday = data.birthday ? data.birthday.split('T')[0] : '';
        data.debutDate = data.debutDate ? data.debutDate.split('T')[0] : '';
        setFormData(data);
      } catch (error) {
        console.error('Errore nel recupero dei dati del solista:', error);
      }
    };

    fetchSoloistData();
  }, [id]);

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
    
    const updatedFormData = {
      ...formData,
      birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
      debutDate: formData.debutDate ? new Date(formData.debutDate).toISOString() : null
    };
    
    Object.keys(updatedFormData).forEach(key => {
      if (typeof updatedFormData[key] === 'object') {
        formDataToSend.append(key, JSON.stringify(updatedFormData[key]));
      } else {
        formDataToSend.append(key, updatedFormData[key]);
      }
    });

    if (photo) {
      formDataToSend.append('photo', photo);
    }
  
    try {
      const response = await axios.put(`${API_URL}/api/soloists/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      console.log('Risposta del server:', response.data);
      if (response.data) {
        alert('Solista aggiornato con successo!');
        navigate('/admin');
      } else {
        alert('Errore nell\'aggiornamento del solista');
      }
    } catch (error) {
      console.error('Errore nella modifica del solista:', error.response ? error.response.data : error);
      alert('Errore nella modifica del solista: ' + (error.response ? error.response.data.message : error.message));
    }
  };

  return (
    <div className="container mt-4">
      <h2>Modifica Solista</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name">Nome</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="stageName">Nome d'Arte</label>
          <input
            type="text"
            className="form-control"
            id="stageName"
            name="stageName"
            value={formData.stageName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="birthday">Data di Nascita</label>
          <input
            type="date"
            className="form-control"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="zodiacSign">Segno Zodiacale</label>
          <input
            type="text"
            className="form-control"
            id="zodiacSign"
            name="zodiacSign"
            value={formData.zodiacSign}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="height">Altezza</label>
          <input
            type="text"
            className="form-control"
            id="height"
            name="height"
            value={formData.height}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="weight">Peso</label>
          <input
            type="text"
            className="form-control"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="mbtiType">Tipo MBTI</label>
          <input
            type="text"
            className="form-control"
            id="mbtiType"
            name="mbtiType"
            value={formData.mbtiType}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="nationality">Nazionalità</label>
          <input
            type="text"
            className="form-control"
            id="nationality"
            name="nationality"
            value={formData.nationality}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="bio">Biografia</label>
          <textarea
            className="form-control"
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="company">Azienda</label>
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
          <label htmlFor="debutDate">Data di Debutto</label>
          <input
            type="date"
            className="form-control"
            id="debutDate"
            name="debutDate"
            value={formData.debutDate}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="photo">Foto</label>
          <input
            type="file"
            className="form-control"
            id="photo"
            onChange={handlePhotoChange}
          />
        </div>
        <h3>Social Media</h3>
<div className="mb-3">
  <label htmlFor="youtube">YouTube</label>
  <input
    type="text"
    className="form-control"
    id="youtube"
    name="socialMedia.youtube"
    value={formData.socialMedia?.youtube || ''}
    onChange={handleChange}
  />
</div>
<div className="mb-3">
  <label htmlFor="x">X (Twitter)</label>
  <input
    type="text"
    className="form-control"
    id="x"
    name="socialMedia.x"
    value={formData.socialMedia?.x || ''}
    onChange={handleChange}
  />
</div>
<div className="mb-3">
  <label htmlFor="instagram">Instagram</label>
  <input
    type="text"
    className="form-control"
    id="instagram"
    name="socialMedia.instagram"
    value={formData.socialMedia?.instagram || ''}
    onChange={handleChange}
  />
</div>
        <button type="submit" className="btn btn-primary">Aggiorna Solista</button>
      </form>
    </div>
  );
};

export default EditSoloistForm;