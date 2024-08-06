import React, { useState } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';
import { updateUserProfile } from '../services/api';

const ProfileUpdateModal = ({ show, handleClose, profileData, onUpdate }) => {
  const [formData, setFormData] = useState({
    nome: profileData.nome,
    cognome: profileData.cognome,
    email: profileData.email,
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

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
      // Qui puoi gestire l'errore, ad esempio mostrando un messaggio all'utente
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Aggiorna Profilo</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
    </Modal>
  );
};

export default ProfileUpdateModal;