import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { searchArtists } from '../services/api';

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

  const getArtistType = (type) => {
    switch(type) {
      case 'male-group': return 'Boy Group';
      case 'female-group': return 'Girl Group';
      case 'male-solo': return 'Male Soloist';
      case 'female-solo': return 'Female Soloist';
      default: return type.includes('group') ? 'Group' : 'Soloist';
    }
  };

  const getArtistLink = (artist) => {
    if (artist.type.includes('solo')) {
      return `/soloist/${artist._id}`;
    } else {
      return `/group/${artist._id}`;
    }
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1>Search Results</h1>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="row">
          {results.map(artist => (
            <div key={artist._id} className="col-md-4 mb-4">
              <Link to={getArtistLink(artist)} className="text-decoration-none">
                <div className="card">
                  <img 
                    src={artist.coverImage || artist.photo} 
                    className="card-img-top" 
                    alt={artist.name} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{artist.name}</h5>
                    <p className="card-text">{getArtistType(artist.type)}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;