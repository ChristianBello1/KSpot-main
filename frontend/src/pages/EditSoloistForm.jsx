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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSoloistData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_URL}/api/soloists/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = response.data;
        data.birthday = data.birthday ? data.birthday.split('T')[0] : '';
        data.debutDate = data.debutDate ? data.debutDate.split('T')[0] : '';
        data.socialMedia = data.socialMedia || { youtube: '', x: '', instagram: '' };
        setFormData(data);
      } catch (error) {
        console.error('Errore nel recupero dei dati del solista:', error);
        alert('Errore nel recupero dei dati del solista');
      } finally {
        setIsLoading(false);
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
    setIsLoading(true);
    const formDataToSend = new FormData();
    
    const updatedFormData = {
      ...formData,
      birthday: formData.birthday ? new Date(formData.birthday).toISOString() : null,
      debutDate: formData.debutDate ? new Date(formData.debutDate).toISOString() : null,
      socialMedia: {
        youtube: formData.socialMedia?.youtube || '',
        x: formData.socialMedia?.x || '',
        instagram: formData.socialMedia?.instagram || ''
      }
    };
    
    const soloistDataJSON = JSON.stringify(updatedFormData);
    formDataToSend.append('soloistData', soloistDataJSON);
  
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Modifica Solista</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome" />
        <input type="text" name="stageName" value={formData.stageName} onChange={handleChange} placeholder="Nome d'Arte" />
        <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} placeholder="Data di Nascita" />
        <input type="text" name="zodiacSign" value={formData.zodiacSign} onChange={handleChange} placeholder="Segno Zodiacale" />
        <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="Altezza" />
        <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="Peso" />
        <input type="text" name="mbtiType" value={formData.mbtiType} onChange={handleChange} placeholder="Tipo MBTI" />
        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nazionalità" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Biografia" />
        <input type="text" name="company" value={formData.company} onChange={handleChange} placeholder="Azienda" />
        <input type="date" name="debutDate" value={formData.debutDate} onChange={handleChange} placeholder="Data di Debutto" />
        <input type="file" onChange={handlePhotoChange} />
        <h3>Social Media</h3>
        <input type="text" name="socialMedia.youtube" value={formData.socialMedia?.youtube || ''} onChange={handleChange} placeholder="YouTube" />
        <input type="text" name="socialMedia.x" value={formData.socialMedia?.x || ''} onChange={handleChange} placeholder="X (Twitter)" />
        <input type="text" name="socialMedia.instagram" value={formData.socialMedia?.instagram || ''} onChange={handleChange} placeholder="Instagram" />
        <button type="submit" disabled={isLoading}>
        {isLoading ? 'Aggiornamento in corso...' : 'Aggiorna Solista'}
        </button>
      </form>
    </div>
  );
};

export default EditSoloistForm;