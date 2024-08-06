import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, getFavorites } from '../services/api';
import ProfileUpdateModal from './ProfileUpdateModal';
import { FaCog } from 'react-icons/fa';

const Profile = () => {
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const data = await getUserData();
      setProfileData(data);
      const favoritesData = await getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Errore nel caricamento del profilo:', error);
      // Qui potresti impostare un messaggio di errore da mostrare all'utente
    }
  };

  const renderFavorites = () => {
    if (!Array.isArray(favorites) || favorites.length === 0) {
      return <p>Nessun preferito trovato.</p>;
    }
    
    return favorites.map(favorite => (
      <div key={`${favorite.type}-${favorite.id}`} className="col-md-4 mb-3">
        <div className="card">
          <img src={favorite.coverImage || favorite.photo} className="card-img-top" alt={favorite.name} />
          <div className="card-body">
            <h5 className="card-title">{favorite.name}</h5>
            <p className="card-text">{favorite.type === 'Group' ? 'Gruppo' : 'Solista'}</p>
            <Link to={`/${favorite.type.toLowerCase()}/${favorite.id}`} className="btn btn-primary">Vedi dettagli</Link>
          </div>
        </div>
      </div>
    ));
  };

  const renderAvatar = () => {
    if (profileData.avatar) {
      return (
        <img 
          src={profileData.avatar} 
          alt="Avatar" 
          className="mb-3" 
          style={{maxWidth: '200px'}} 
          onError={(e) => {
            console.error("Error loading image:", e);
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200?text=Avatar+Not+Found';
          }}
        />
      );
    } else {
      console.log("No avatar found, rendering initials");
      const initials = `${profileData.nome.charAt(0)}${profileData.cognome.charAt(0)}`;
      return (
        <div className="avatar-placeholder mb-3" style={{
          width: '200px',
          height: '200px',
          backgroundColor: '#007bff',
          color: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: '48px',
          borderRadius: '50%'
        }}>
          {initials}
        </div>
      );
    }
  };

  if (loading) return <p>Caricamento...</p>;
  if (!user) return <p>Please <Link to="/login">login</Link> to view your profile.</p>;

  return (
    <div className="container mt-4">
      <h2>Profilo</h2>
      {profileData ? (
        <div>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <p>Nome: {profileData.nome}</p>
              <p>Cognome: {profileData.cognome}</p>
              <p>Email: {profileData.email}</p>
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={() => setShowUpdateModal(true)}
            >
              <FaCog /> Impostazioni Profilo
            </button>
          </div>
          {renderAvatar()}
          
          {profileData.ruolo === 'admin' && (
            <div className="mb-4">
              <h3>Pannello di Amministrazione</h3>
              <Link to="/admin" className="btn btn-primary">Gestione Gruppi e Solisti</Link>
            </div>
          )}
          
          <h3>Preferiti:</h3>
          <div className="row">
            {renderFavorites()}
          </div>

          <ProfileUpdateModal 
            show={showUpdateModal} 
            handleClose={() => setShowUpdateModal(false)} 
            profileData={profileData}
            onUpdate={fetchProfileData}
          />
        </div>
      ) : (
        <p>Caricamento del profilo...</p>
      )}
    </div>
  );
};

export default Profile;