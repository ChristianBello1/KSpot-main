import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { updateUserProfile, deleteUserAccount } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProfileUpdateModal = ({ show, handleClose, profileData, onUpdate }) => {
  const [formData, setFormData] = useState({
    nome: profileData.nome,
    cognome: profileData.cognome,
    email: profileData.email,
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => formDataToSend.append(key, formData[key]));
    if (avatar) {
      formDataToSend.append('avatar', avatar);
    }

    try {
      await updateUserProfile(formDataToSend);
      onUpdate();
      handleClose();
    } catch (error) {
      console.error("Errore nell'aggiornamento del profilo:", error);
      setError("Si è verificato un errore durante l'aggiornamento del profilo. Riprova più tardi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirmed = window.confirm(
      "Sei sicuro di voler eliminare il tuo account? Questa azione è irreversibile e comporterà la perdita di tutti i tuoi dati, inclusi commenti e preferiti."
    );
    if (isConfirmed) {
      setLoading(true);
      setError('');
      try {
        await deleteUserAccount();
        logout();
        navigate('/');
        // Opzionale: mostra un messaggio di conferma all'utente
        alert("Il tuo account è stato eliminato con successo.");
      } catch (error) {
        console.error("Errore nell'eliminazione dell'account:", error);
        setError("Si è verificato un errore durante l'eliminazione dell'account. Riprova più tardi.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Aggiorna Profilo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Cognome</Form.Label>
            <Form.Control
              type="text"
              name="cognome"
              value={formData.cognome}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Nuova Immagine Profilo</Form.Label>
            <Form.Control
              type="file"
              onChange={handleFileChange}
              accept="image/*"
            />
          </Form.Group>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Salva Modifiche'}
          </Button>
        </Form>
        <hr />
        <div className="d-flex justify-content-between align-items-center">
          <Button 
            variant="danger" 
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Elimina Account'}
          </Button>
          <small className="text-muted">Questa azione è irreversibile</small>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileUpdateModal;