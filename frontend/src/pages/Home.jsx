import React, { useEffect, useState } from 'react';
import { getAllArtists } from '../services/api';
import { Link } from 'react-router-dom';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card';  // Assicurati che il percorso sia corretto

const Home = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const data = await getAllArtists();
        setArtists(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching artists:', error);
        setError('Failed to load artists. Please try again later.');
        setLoading(false);
      }
    };
    fetchArtists();
  }, []);

  const getArtistLink = (artist) => {
    if (artist.type.includes('group')) {
      return `/group/${artist._id}`;
    } else {
      return `/soloist/${artist._id}`;
    }
  };

  const getArtistType = (type) => {
    switch(type) {
      case 'male-group': return 'Boy Group';
      case 'female-group': return 'Girl Group';
      case 'male-solo': return 'Male Soloist';
      case 'female-solo': return 'Female Soloist';
      default: return 'Artist';
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1>All K-Pop Artists</h1>
      <div className="row">
        {artists.map(artist => (
          <div key={artist._id} className="col-md-4 mb-4">
            <Link to={getArtistLink(artist)} className="text-decoration-none">
              <CardContainer className="h-96 w-80"> {/* Cambiato da w-72 a w-80 */}
                <CardBody className="relative w-full h-full">
                  <CardItem className="absolute inset-0">
                    <img 
                      src={artist.coverImage || artist.photo} 
                      className="h-full w-full object-cover" 
                      alt={artist.name} 
                    />
                  </CardItem>
                  <CardItem 
                    className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-4"
                    translateZ={30}
                  >
                    <h5 className="card-title">{artist.name}</h5>
                    <p className="card-text">{getArtistType(artist.type)}</p>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;