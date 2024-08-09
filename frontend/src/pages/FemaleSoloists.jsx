import React, { useEffect, useState } from 'react';
import { getSoloistsByType } from '../services/api';
import { Link } from 'react-router-dom';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card';
import './Pages.css';
import Spinner from '../components/Spinner';

const FemaleSoloists = () => {
  const [soloists, setSoloists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSoloists = async () => {
      try {
        const response = await getSoloistsByType('female-solo');
        setSoloists(response.data);
      } catch (error) {
        console.error('Error fetching female soloists:', error);
        setError('Failed to load female soloists. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchSoloists();
  }, []);

  const capitalizeFirstLetter = (string) => {
    return string.replace(/\b\w/g, char => char.toUpperCase());
  };

  if (loading) {
    return <Spinner />;
  }
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1 className='title'>Female Soloists</h1>
      <div className="row">
      {soloists.length === 0 ? (
          <p className='notfound'>No female soloists found.</p>
        ) : (
        soloists.map(soloist => (
          <div key={soloist._id} className="col-md-4 mb-4">
            <Link to={`/soloist/${soloist._id}`} className="text-decoration-none">
            <CardContainer className="group/card h-96 w-80">
                <CardBody className="relative w-full h-full bg-black overflow-hidden">
                  <CardItem
                  translateZ="100"
                  className="w-full h-full"
                  >
                    <img 
                      src={soloist.photo} 
                      className="h-full w-full object-cover" 
                      alt={soloist.stageName} 
                    />
                  </CardItem>
                  <div id='namegroup'>
                    <CardItem 
                      translateZ="50"
                      className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-4 namegroup"
                    >
                      <h5 className="card-title">{capitalizeFirstLetter(soloist.stageName)}</h5>
                    </CardItem>
                  </div>
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

export default FemaleSoloists;
