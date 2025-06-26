import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8222/api/v1',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // si tu utilises des cookies ou tokens
});

export const getContracts = () => API.get('/contracts');
export const createContract = (data) => API.post('/contracts', data);
 