import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

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

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2>Pannello di Amministrazione</h2>
      
      <div className="mb-4">
        <Link to="/admin/add-group/male-group" className="btn btn-primary me-2">Nuovo Gruppo Maschile</Link>
        <Link to="/admin/add-group/female-group" className="btn btn-primary me-2">Nuovo Gruppo Femminile</Link>
        <Link to="/admin/add-soloist/male" className="btn btn-primary me-2">Nuovo Solista Maschile</Link>
        <Link to="/admin/add-soloist/female" className="btn btn-primary">Nuova Solista Femminile</Link>
      </div>

      <input
        type="text"
        className="form-control mb-4"
        placeholder="Cerca artista"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredArtists.map(artist => (
        <div key={artist._id} className="card mb-3">
          <div className="card-body">
            <h5 className="card-title">{artist.name}</h5>
            <p className="card-text">{artist.type}</p>
            <Link to={`/admin/edit-${artist.type.includes('solo') ? 'soloist' : 'group'}/${artist._id}`} className="btn btn-secondary me-2">Modifica</Link>
            {artist.type.includes('group') && (
              <>
                <Link to={`/admin/add-member/${artist._id}`} className="btn btn-info me-2">Aggiungi Membro</Link>
                <Link to={`/admin/edit-members/${artist._id}`} className="btn btn-warning me-2">Modifica Membri</Link>
              </>
            )}
            <button onClick={() => handleDelete(artist._id, artist.type.includes('solo') ? 'soloist' : 'group')} className="btn btn-danger">Elimina</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;