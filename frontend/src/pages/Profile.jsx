import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getUserData, getFavorites } from '../services/api';
import ProfileUpdateModal from './ProfileUpdateModal';
import { FaCog } from 'react-icons/fa';
import './Profile.css';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card';
import Spinner from './Spinner'; // Assicurati che questo componente esista

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const data = await getUserData();
      setProfileData(data);
      const favoritesData = await getFavorites();
      setFavorites(favoritesData);
    } catch (error) {
      console.error('Errore nel caricamento del profilo:', error);
      // Qui potresti impostare un messaggio di errore da mostrare all'utente
    } finally {
      setLoading(false);
    }
  };

  const renderFavorites = () => {
    if (!Array.isArray(favorites) || favorites.length === 0) {
      return <p className='favoritesno'>Nessun preferito trovato.</p>;
    }
    
    return favorites.map(favorite => (
      <div key={`${favorite.type}-${favorite.id}`} className="col-md-4 mb-3">
        <Link to={`/${favorite.type.toLowerCase()}/${favorite.id}`} className="text-decoration-none">
          <CardContainer className="group-card h-96 w-80">
            <CardBody className="relative w-full h-full bg-black overflow-hidden">
              <CardItem
                translateZ="100"
                className="w-full h-full"
              >
                <img 
                  src={favorite.coverImage || favorite.photo} 
                  className="h-full w-full object-cover"
                  alt={favorite.name} 
                />
              </CardItem>
              <div id='namegroup'>
                <CardItem 
                  translateZ={30}
                  className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-4 namegroup"
                >
                  <h5 className="card-title">{favorite.name}</h5>
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        </Link>
      </div>
    ));
  };

  const renderAvatar = () => {
    if (profileData && profileData.avatar) {
      return (
        <img 
          src={profileData.avatar} 
          alt="Avatar" 
          className="profile-avatar" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/200?text=Avatar+Not+Found';
          }}
        />
      );
    } else if (profileData) {
      const initials = `${profileData.nome.charAt(0)}${profileData.cognome.charAt(0)}`;
      return (
        <div className="profile-avatar">
          {initials}
        </div>
      );
    }
    return null;
  };

  if (authLoading || loading) {
    return (
      <div className="container mt-4 text-white d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-4 text-white">
        <p>Please <Link to="/login">login</Link> to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 text-white">
      {profileData ? (
        <div>
          <div className="profile-info">
            <div className="profile-avatar-container">
              {renderAvatar()}
            </div>
            <div className="profile-details">
              <p>Name: {profileData.nome}</p>
              <p>Surname: {profileData.cognome}</p>
              <p>Email: {profileData.email}</p>
            </div>
            <div className="profile-settings">
              <FaCog 
                className="settings-icon" 
                onClick={() => setShowUpdateModal(true)}
              />
            </div>
          </div>
          
          {profileData.ruolo === 'admin' && (
            <div className="mb-4">
              <Link to="/admin" className="btn btn-primary">Pannello di Amministrazione</Link>
            </div>
          )}
          
          <h1 className='h1'>Favorites:</h1>
          <div className="row favorites">
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
        <div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}>
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default Profile;