import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberById, updateMember } from '../services/api';
import './AdminForms.css';

const EditMemberForm = () => {
  const { groupId, memberId } = useParams();
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
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemberData();
  }, [groupId, memberId]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      const response = await getMemberById(groupId, memberId);
      console.log('Dati del membro ricevuti:', response.data); // Per debug
      if (response.data) {
        setFormData({
          name: response.data.name || '',
          stageName: response.data.stageName || '',
          birthday: response.data.birthday ? response.data.birthday.split('T')[0] : '',
          zodiacSign: response.data.zodiacSign || '',
          height: response.data.height || '',
          weight: response.data.weight || '',
          mbtiType: response.data.mbtiType || '',
          nationality: response.data.nationality || '',
          instagram: response.data.instagram || '',
          bio: response.data.bio || '',
          position: Array.isArray(response.data.position) ? response.data.position.join(', ') : response.data.position || ''
        });
      } else {
        throw new Error('Dati del membro non trovati');
      }
      setError(null);
    } catch (error) {
      console.error('Errore nel recupero dei dati del membro:', error);
      setError('Impossibile recuperare i dati del membro. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  };

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
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'position') {
          formDataToSend.append(key, formData[key].split(',').map(item => item.trim()).join(','));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      if (photo) {
        formDataToSend.append('photo', photo);
      }
  
      await updateMember(groupId, memberId, formDataToSend);
      navigate(`/admin/edit-members/${groupId}`);
    } catch (error) {
      console.error('Errore nella modifica del membro:', error.response?.data || error.message);
      setError('Impossibile aggiornare il membro. Riprova più tardi.');
    }
  };

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="admin-form-container">
      <h2>Modifica Membro</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nome" required />
        <input type="text" name="stageName" value={formData.stageName} onChange={handleChange} placeholder="Nome d'arte" />
        <input type="date" name="birthday" value={formData.birthday ? formData.birthday.split('T')[0] : ''} onChange={handleChange} placeholder="Data di nascita" />
        <input type="text" name="zodiacSign" value={formData.zodiacSign} onChange={handleChange} placeholder="Segno zodiacale" />
        <input type="text" name="height" value={formData.height} onChange={handleChange} placeholder="Altezza (cm)" />
        <input type="text" name="weight" value={formData.weight} onChange={handleChange} placeholder="Peso (kg)" />
        <input type="text" name="mbtiType" value={formData.mbtiType} onChange={handleChange} placeholder="Tipo MBTI" />
        <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} placeholder="Nazionalità" />
        <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram" />
        <textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Biografia" />
        <input type="text" name="position" value={Array.isArray(formData.position) ? formData.position.join(', ') : formData.position} onChange={handleChange} placeholder="Posizione" />
        <input type="file" onChange={handlePhotoChange} />
        <button type="submit">Aggiorna Membro</button>
      </form>
    </div>
  );
};

export default EditMemberForm;