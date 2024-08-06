import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberById, updateMember } from '../services/api';

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
          formDataToSend.append(key, formData[key].split(',').map(item => item.trim()));
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
      console.error('Errore nella modifica del membro:', error);
      setError('Impossibile aggiornare il membro. Riprova più tardi.');
    }
  };

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h2>Modifica Membro</h2>
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
          <input type="date" className="form-control" id="birthday" name="birthday" value={formData.birthday ? formData.birthday.split('T')[0] : ''} onChange={handleChange} />
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
          <input 
            type="text" 
            className="form-control" 
            id="position" 
            name="position" 
            value={Array.isArray(formData.position) ? formData.position.join(', ') : formData.position} 
            onChange={handleChange} 
          />
        </div>
        <div className="mb-3">
          <label htmlFor="photo" className="form-label">Nuova Foto (lascia vuoto per mantenere quella attuale)</label>
          <input type="file" className="form-control" id="photo" onChange={handlePhotoChange} />
        </div>
        <button type="submit" className="btn btn-primary">Aggiorna Membro</button>
      </form>
    </div>
  );
};

export default EditMemberForm;