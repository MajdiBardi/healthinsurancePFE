import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8222/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export const getContracts = () => API.get('/contracts');
export const createContract = (data) => API.post('/contracts', data);
export const updateContract = (id, data) => API.put(`/contracts/${id}`, data);
export const deleteContract = (id) => API.delete(`/contracts/${id}`);
