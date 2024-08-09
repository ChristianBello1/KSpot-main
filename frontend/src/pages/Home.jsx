import React, { useEffect, useState } from 'react';
import { getAllArtists } from '../services/api';
import { Link } from 'react-router-dom';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card';
import Spinner from '../components/Spinner';

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const Home = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        setLoading(true);
        const data = await getAllArtists();
        setArtists(shuffleArray(data)); // Mescola l'array solo all'inizio
        setLoading(false);
      } catch (error) {
        console.error('Error fetching artists:', error);
        setError('Failed to load artists. Please try again later.');
        setLoading(false);
      }
    };
    fetchArtists();
  }, []); // Dipendenze vuote, quindi viene eseguito solo al montaggio del componente

  const getArtistLink = (artist) => {
    if (artist.type.includes('group')) {
      return `/group/${artist._id}`;
    } else {
      return `/soloist/${artist._id}`;
    }
  };

  const getArtistName = (artist) => {
    if (artist.type.includes('group')) {
      return artist.name;
    } else {
      return artist.stageName || artist.name; // Usa stageName se disponibile, altrimenti usa name
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.replace(/\b\w/g, char => char.toUpperCase());
  };

  if (loading) {
    return <Spinner />;
  }
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <div className="row">
        {artists.map(artist => (
          <div key={artist._id} className="col-md-4 mb-4">
            <Link to={getArtistLink(artist)} className="text-decoration-none">
              <CardContainer className="group-card h-96 w-80">
                <CardBody className="relative w-full h-full bg-black overflow-hidden">
                  <CardItem
                    translateZ="100"
                    className="w-full h-full"
                  >
                    <img 
                      src={artist.coverImage || artist.photo} 
                      className="h-full w-full object-cover"
                      alt={getArtistName(artist)} // Usa la nuova funzione qui
                    />
                  </CardItem>
                  <div id='namegroup'>
                    <CardItem 
                      translateZ={30}
                      className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-4 namegroup"
                    >
                      <h5 className="card-title">{capitalizeFirstLetter(getArtistName(artist))}</h5>
                    </CardItem>
                  </div>
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