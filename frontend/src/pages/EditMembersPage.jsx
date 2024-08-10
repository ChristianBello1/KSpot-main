import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './AdminForms.css';

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
    <div className="admin-form-container">
      <h2>Membri del Gruppo</h2>
      {members.length > 0 ? (
        <ul className="member-list">
          {members.map((member) => (
            <li key={member._id} className="member-item">
              <span className="member-name">{member.stageName}</span>
              <Link to={`/admin/edit-member/${groupId}/${member._id}`} className="edit-button">
                Modifica
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nessun membro trovato per questo gruppo.</p>
      )}
      <Link to={`/admin/add-member/${groupId}`} className="add-button">
        Aggiungi Nuovo Membro
      </Link>
    </div>
  );
};

export default EditMembersPage;
