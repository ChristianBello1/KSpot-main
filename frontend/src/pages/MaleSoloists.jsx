import React, { useEffect, useState } from 'react';
import { getSoloistsByType } from '../services/api';
import { Link } from 'react-router-dom';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card'; // Assicurati che il percorso sia corretto

const MaleSoloists = () => {
  const [soloists, setSoloists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSoloists = async () => {
      try {
        const response = await getSoloistsByType('male-solo');
        setSoloists(response.data);
      } catch (error) {
        console.error('Error fetching male soloists:', error);
        setError('Failed to load male soloists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSoloists();
  }, []);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1 className='title'>Male Soloists</h1>
      <div className="row">
      {soloists.length === 0 ? (
          <p className='notfound'>No male soloists found.</p>
        ) : (
        soloists.map(soloist => (
          <div key={soloist._id} className="col-md-4 mb-4">
            <Link to={`/soloist/${soloist._id}`} className="text-decoration-none">
              <CardContainer className="h-96 w-80"> {/* Cambiato da w-72 a w-80 */}
                <CardBody className="relative w-full h-full">
                  <CardItem className="absolute inset-0">
                    <img 
                      src={soloist.photo} 
                      className="h-full w-full object-cover" 
                      alt={soloist.name} 
                    />
                  </CardItem>
                  <CardItem 
                    className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-4"
                    translateZ={30}
                  >
                    <h5 className="card-title">{soloist.name}</h5>
                    <p className="card-text">{soloist.bio ? soloist.bio.substring(0, 100) + '...' : 'No bio available'}</p>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </Link>
          </div>
        ))
      )}
      </div>
    </div>
  );
};

export default MaleSoloists;
