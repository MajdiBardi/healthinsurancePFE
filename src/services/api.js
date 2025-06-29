import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8222/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Injecte le token JWT dans tous les appels
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Récupère les contrats selon le rôle stocké dans localStorage
export const getContracts = async () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const endpoint = role === 'CLIENT'
    ? '/contracts/my-contracts'
    : '/contracts';

  return API.get(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createContract = (data) => API.post('/contracts', data);
export const updateContract = (id, data) => API.put(`/contracts/${id}`, data);
export const deleteContract = (id) => API.delete(`/contracts/${id}`);
