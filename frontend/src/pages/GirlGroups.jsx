import React, { useEffect, useState } from 'react';
import { getGroupsByType } from '../services/api';
import { Link } from 'react-router-dom';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card'; // Assicurati che il percorso sia corretto

const GirlGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await getGroupsByType('female-group');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching girl groups:', error);
        setError('Failed to load girl groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1>Girl Groups</h1>
      <div className="row">
        {groups.length === 0 ? (
          <p>No girl groups found.</p>
        ) : (
          groups.map(group => (
            <div key={group._id} className="col-md-4 mb-4">
              <Link to={`/group/${group._id}`} className="text-decoration-none">
                <CardContainer className="h-96 w-80"> {/* Cambiato da w-72 a w-80 */}
                  <CardBody className="relative w-full h-full">
                    <CardItem className="absolute inset-0">
                      <img 
                        src={group.coverImage} 
                        className="h-full w-full object-cover" 
                        alt={group.name} 
                      />
                    </CardItem>
                    <CardItem 
                      className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-4"
                      translateZ={30}
                    >
                      <h5 className="card-title">{group.name}</h5>
                      <p className="card-text">{group.description.substring(0, 100)}...</p>
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

export default GirlGroups;
