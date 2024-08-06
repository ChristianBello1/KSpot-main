import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const AddMemberForm = () => {
  const { groupId } = useParams();
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
    position: ''
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
    Object.keys(formData).forEach(key => {
      formDataToSend.append(key, formData[key]);
    });
    if (photo) {
      formDataToSend.append('photo', photo);
    }

    try {
      await axios.post(`${API_URL}/api/groups/${groupId}/members`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      navigate('/admin');
    } catch (error) {
      console.error('Errore nell\'aggiunta del membro:', error);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Aggiungi Membro al Gruppo</h2>
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
          <input type="text" className="form-control" id="height" name="height" value={formData.height} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="weight" className="form-label">Peso (kg)</label>
          <input type="text" className="form-control" id="weight" name="weight" value={formData.weight} onChange={handleChange} />
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
          <label htmlFor="position" className="form-label">Posizione</label>
          <input type="text" className="form-control" id="position" name="position" value={formData.position} onChange={handleChange} />
        </div>
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">Foto</label>
          <input type="file" className="form-control" id="photo" onChange={handlePhotoChange} />
        </div>
        <button type="submit" className="btn btn-primary">Aggiungi Membro</button>
      </form>
    </div>
  );
};

export default AddMemberForm;