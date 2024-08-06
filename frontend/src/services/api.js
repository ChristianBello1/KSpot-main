import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.log("Nessun token trovato in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getAllArtists = async () => {
  try {
    const [groupsResponse, soloistsResponse] = await Promise.all([
      api.get('/groups'),
      api.get('/soloists')
    ]);
    return [...groupsResponse.data, ...soloistsResponse.data];
  } catch (error) {
    console.error("Errore nel recupero degli artisti:", error);
    return [];
  }
};

export const getGroupById = (id) => api.get(`/groups/${id}`);
export const getSoloistById = (id) => api.get(`/soloists/${id}`);
export const getMemberById = (groupId, memberId) => api.get(`/groups/${groupId}/members/${memberId}`);
export const getGroupsByType = (type) => api.get(`/groups?type=${type}`);
export const getSoloistsByType = (type) => api.get(`/soloists?type=${type}`);
export const addFavorite = (artistId, artistType) => 
  api.post('/favorites', { artistId, artistType });

export const removeFavorite = (artistId, artistType) => 
  api.delete('/favorites', { data: { artistId, artistType } });

export const getFavorites = async () => {
  try {
    const response = await api.get('/favorites');
    return response.data;
  } catch (error) {
    console.error('Errore nel recupero dei preferiti:', error);
    if (error.response && error.response.data) {
      console.error('Dettagli errore:', error.response.data);
    }
    throw error;
  }
};

export const searchArtists = async (query) => {
  try {
    const response = await api.get(`/search?q=${query}`);
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("Errore nella ricerca degli artisti:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
      const response = await api.post("/auth/login", credentials);
      console.log("Risposta API login:", response.data);
      if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          return response.data;
      } else {
          throw new Error("Token non ricevuto dal server");
      }
  } catch (error) {
      console.error("Errore nella chiamata API di login:", error);
      throw error;
  }
};

export const registerUser = async (formData) => {
  try {
    const response = await api.post("/auth/register", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log("Risposta API registrazione:", response.data);
    if (response.data.token && typeof response.data.token === 'string') {
      localStorage.setItem("token", response.data.token);
      return response.data;
    } else {
      console.error("Token non valido ricevuto:", response.data.token);
      throw new Error("Token non valido ricevuto dal server durante la registrazione");
    }
  } catch (error) {
    console.error("Errore nella chiamata API di registrazione:", error);
    throw error;
  }
};

export const getUserData = async () => {
    try {
        const response = await api.get('/auth/me');
        console.log("Dati utente ricevuti:", response.data);
        console.log("Avatar URL:", response.data.avatar);
        return response.data;
    } catch (error) {
        console.error('Errore nel recupero dei dati utente:', error);
        throw error;
    }
};

export const updateUserProfile = async (formData) => {
  try {
    const response = await api.patch('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    console.log("Profilo aggiornato:", response.data);
    return response.data;
  } catch (error) {
    console.error("Errore nell'aggiornamento del profilo:", error);
    throw error;
  }
};

export const updateMember = (groupId, memberId, formData) => 
  api.put(`/groups/${groupId}/members/${memberId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const getGroupMembers = (groupId) => api.get(`/groups/${groupId}/members`);

export const createGroup = (formData) => 
  api.post('/groups', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateGroup = (groupId, formData) => 
  api.put(`/groups/${groupId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const deleteGroup = (groupId) => api.delete(`/groups/${groupId}`);

export const createSoloist = (formData) => 
  api.post('/soloists', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const updateSoloist = (soloistId, formData) => 
  api.put(`/soloists/${soloistId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

export const deleteSoloist = (soloistId) => api.delete(`/soloists/${soloistId}`);

export const addComment = (artistId, comment, isGroup = true) => {
  const endpoint = isGroup ? `/groups/${artistId}/comments` : `/soloists/${artistId}/comments`;
  return api.post(endpoint, { text: comment.text, parentCommentId: comment.parentCommentId });
};

export const deleteComment = (artistId, commentId, isGroup = true) => {
  const endpoint = isGroup ? `/groups/${artistId}/comments/${commentId}` : `/soloists/${artistId}/comments/${commentId}`;
  return api.delete(endpoint);
};

export const likeComment = (artistId, commentId, isGroup = true) => {
  const endpoint = isGroup ? `/groups/${artistId}/comments/${commentId}/like` : `/soloists/${artistId}/comments/${commentId}/like`;
  return api.post(endpoint);
};



export default api;