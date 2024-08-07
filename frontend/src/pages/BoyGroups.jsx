import React, { useEffect, useState } from 'react';
import { getGroupsByType } from '../services/api';
import { Link } from 'react-router-dom';
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card';
import './Pages.css';

const BoyGroups = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        const response = await getGroupsByType('male-group');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching boy groups:', error);
        setError('Failed to load boy groups. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const capitalizeFirstLetter = (string) => {
    return string.replace(/\b\w/g, char => char.toUpperCase());
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4 text-danger">{error}</div>;

  return (
    <div className="container mt-4">
      <h1 className='title'>Boy Groups</h1>
      {groups.length === 0 ? (
        <p className='notfound'>No boy groups found.</p>
      ) : (
        <div className="row">
          {groups.map(group => (
            <div key={group._id} className="col-md-4 mb-4">
              <Link to={`/group/${group._id}`} className="text-decoration-none">
                <CardContainer className="group-card h-96 w-80">
                  <CardBody className="relative w-full h-full bg-black overflow-hidden">
                    <CardItem
                      translateZ="100"
                      className="w-full h-full"
                    >
                      <img 
                        src={group.coverImage} 
                        className="h-full w-full object-cover"
                        alt={group.name} 
                      />
                    </CardItem>
                    <div id='namegroup'>
                    <CardItem 
                      translateZ={30}
                      className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 p-4 namegroup"
                    >
                      <h5 className="card-title">{capitalizeFirstLetter(group.name)}</h5>
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

export default BoyGroups;