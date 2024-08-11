import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

const API_URL = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [artists, setArtists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const [groupsResponse, soloistsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/groups`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get(`${API_URL}/api/soloists`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);
      setArtists([...groupsResponse.data, ...soloistsResponse.data]);
    } catch (error) {
      console.error('Errore nel recupero degli artisti:', error);
    }
  };

  const handleDelete = async (id, type) => {
    if (window.confirm('Sei sicuro di voler eliminare questo artista?')) {
      try {
        await axios.delete(`${API_URL}/api/${type}s/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchArtists(); // Ricarica la lista degli artisti dopo l'eliminazione
      } catch (error) {
        console.error('Errore nell\'eliminazione:', error);
        alert('Si è verificato un errore durante l\'eliminazione. Riprova.');
      }
    }
  };

  const getArtistName = (artist) => {
    return artist.type.includes('group') ? artist.name : (artist.stageName || artist.name);
  };

  const filteredArtists = artists.filter(artist =>
    getArtistName(artist).toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <h2>Pannello di Amministrazione</h2>
      
      <div className="mb-4 btngroups">
        <Link to="/admin/add-group/male-group" className="btn btn-primary">Gruppo Maschile</Link>
        <Link to="/admin/add-group/female-group" className="btn btn-primary">Gruppo Femminile</Link>
        <Link to="/admin/add-soloist/male" className="btn btn-primary">Solista Maschile</Link>
        <Link to="/admin/add-soloist/female" className="btn btn-primary">Solista Femminile</Link>
      </div>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Cerca artista"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="card-container">
        {filteredArtists.map(artist => (
          <div key={artist._id} className="card-wrapper">
            <div className="card">
              <div className="card-body">
                <div>
                  <h5 className="card-title">{getArtistName(artist)}</h5>
                </div>
                <div className="card-actions">
                  <Link to={`/admin/edit-${artist.type.includes('solo') ? 'soloist' : 'group'}/${artist._id}`} className="btn btn-secondary">Modifica</Link>
                  {artist.type.includes('group') && (
                    <>
                      <Link to={`/admin/add-member/${artist._id}`} className="btn btn-info">Aggiungi Membro</Link>
                      <Link to={`/admin/edit-members/${artist._id}`} className="btn btn-warning">Modifica Membri</Link>
                    </>
                  )}
                  <button onClick={() => handleDelete(artist._id, artist.type.includes('solo') ? 'soloist' : 'group')} className="btn btn-danger">Elimina</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;