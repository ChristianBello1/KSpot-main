import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchArtists } from '../services/api';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card';
import './Pages.css';

const SearchResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('q');

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await searchArtists(query);
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setError('An error occurred while fetching results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [location.search]);

  const getArtistLink = (artist) => {
    if (artist.type.includes('solo')) {
      return `/soloist/${artist._id}`;
    } else {
      return `/group/${artist._id}`;
    }
  };

  const getArtistName = (artist) => {
    if (artist.type === 'group') {
      return artist.name;
    } else {
      return artist.stageName;
    }
  };

  const capitalizeFirstLetter = (string) => {
    return string.replace(/\b\w/g, char => char.toUpperCase());
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1 className='title'>Search Results</h1>
      {results.length === 0 ? (
        <p className='notfound'>No results found.</p>
      ) : (
        <div className="row">
          {results.map(artist => (
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
                        alt={artist.name} 
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
      )}
    </div>
  );
};

export default SearchResults;
