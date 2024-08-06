import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const EditMembersPage = () => {
  const { groupId } = useParams();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/groups/${groupId}/members`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setMembers(response.data);
      } catch (error) {
        console.error('Errore nel recupero dei membri:', error);
      }
    };
    fetchMembers();
  }, [groupId]);

  return (
    <div className="container mt-4">
      <h2>Membri del Gruppo</h2>
      <ul>
        {members.map((member) => (
          <li key={member._id}>
            {member.name} ({member.stageName})
            <Link to={`/admin/edit-member/${groupId}/${member._id}`} className="btn btn-primary ml-2">
              Modifica
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EditMembersPage;
