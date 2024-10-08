import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { addMemberToGroup } from '../services/api';
import './AdminForms.css';
import CustomDatePicker from './CustomDatePicker';

const AddMemberForm = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    stageName: '',
    birthday: null,
    zodiacSign: '',
    height: '',
    weight: '',
    mbtiType: '',
    nationality: '',
    instagram: '',
    bio: '',
    position: ''
  });
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState('');
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
      birthday: date
    }));
  };

  const handlePhotoChange = (e) => {
    setPhoto(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
  
    const requiredFields = ['name', 'stageName', 'birthday', 'position'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    if (missingFields.length > 0) {
      setError(`I seguenti campi sono obbligatori: ${missingFields.join(', ')}`);
      setIsLoading(false);
      return;
    }
  
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'position') {
        formDataToSend.append(key, formData[key].split(',').map(item => item.trim()));
      } else if (key === 'weight' || key === 'height') {
        const value = formData[key];
        if (value === 'N/A' || value === '') {
          formDataToSend.append(key, 'N/A');
        } else {
          const numValue = parseFloat(value);
          formDataToSend.append(key, isNaN(numValue) ? 'N/A' : numValue.toString());
        }
      } else if (key === 'birthday') {
        formDataToSend.append(key, formData[key] ? formData[key].toISOString() : null);
      } else {
        formDataToSend.append(key, formData[key]);
      }
    });
    if (photo) {
      formDataToSend.append('photo', photo);
    }
  
    try {
      const response = await addMemberToGroup(groupId, formDataToSend);
      console.log('Risposta del server:', response.data);
      navigate('/admin');
    } catch (error) {
      console.error('Errore nell\'aggiunta del membro:', error.response?.data || error.message);
      setError('Errore nell\'aggiunta del membro. Riprova più tardi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-form-container">
      <h2>Aggiungi Membro al Gruppo</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome" required />
        <input type="text" name="stageName" value={formData.stageName} onChange={handleChange} placeholder="Nome d'arte" required />
        <CustomDatePicker
          selected={formData.birthday}
          onChange={handleDateChange}
          placeholderText="Data di nascita"
          required
        />
        <input type="text" name="zodiacSign" value={formData.zodiacSign} onChange={handleChange} placeholder="Segno zodiacale" />
        <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="Altezza (cm) o N/A" />
        <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="Peso (kg) o N/A" />
        <input type="text" name="mbtiType" value={formData.mbtiType} onChange={handleChange} placeholder="Tipo MBTI" />
        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nazionalità" />
        <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Biografia" />
        <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="Posizione" required />
        <input type="file" onChange={handlePhotoChange} />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Aggiunta in corso...' : 'Aggiungi Membro'}
        </button>
      </form>
    </div>
  );
};

export default AddMemberForm;