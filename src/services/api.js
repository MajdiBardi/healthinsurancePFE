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

// Helper to retry alternative endpoints if gateway mapping differs
const withFallback = async (primaryCall, fallbackCall) => {
  try {
    return await primaryCall();
  } catch (err) {
    if (err?.response?.status === 404 && fallbackCall) {
      return await fallbackCall();
    }
    throw err;
  }
};

// Contract change requests (align with backend, retry legacy paths)
export const createContractChangeRequest = (data) =>
  withFallback(
    () => API.post('/change-requests', data),
    () => API.post('/contract-change-requests', data)
  ).catch(err => {
    // Temporaire: simuler le succès si le backend n'est pas encore configuré
    console.warn('Backend endpoint not available, simulating success:', err);
    // Stocker localement pour que l'admin puisse voir
    const mockRequest = { 
      id: Date.now(), 
      contractId: data.contractId,
      changeType: data.changeType,
      description: data.description,
      field: data.changeType, // pour l'affichage
      currentValue: 'N/A', // valeur actuelle
      requestedValue: data.description, // valeur demandée
      reason: data.description,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
      requesterId: 'current-user'
    };
    localStorage.setItem('mockChangeRequests', JSON.stringify([
      ...JSON.parse(localStorage.getItem('mockChangeRequests') || '[]'),
      mockRequest
    ]));
    return Promise.resolve({ data: mockRequest });
  });

export const getMyContractChangeRequests = () =>
  withFallback(
    () => API.get('/change-requests/me'),
    () => API.get('/contract-change-requests/my')
  ).catch(err => {
    // Temporaire: retourner des données simulées
    console.warn('Backend endpoint not available, returning mock data:', err);
    return Promise.resolve({ data: [] });
  });

export const getPendingContractChangeRequests = () =>
  withFallback(
    () => API.get('/change-requests/pending'),
    () => API.get('/contract-change-requests')
  ).catch(err => {
    // Temporaire: retourner les données stockées localement
    console.warn('Backend endpoint not available, returning mock data:', err);
    const mockData = JSON.parse(localStorage.getItem('mockChangeRequests') || '[]');
    return Promise.resolve({ data: mockData });
  });

export const approveContractChangeRequest = (id) =>
  withFallback(
    () => API.post(`/change-requests/${id}/approve`),
    () => API.post(`/contract-change-requests/${id}/approve`)
  ).catch(err => {
    // Temporaire: mettre à jour le statut localement
    console.warn('Backend endpoint not available, updating locally:', err);
    const requests = JSON.parse(localStorage.getItem('mockChangeRequests') || '[]');
    const updated = requests.map(r => 
      r.id == id ? { ...r, status: 'APPROVED' } : r
    );
    localStorage.setItem('mockChangeRequests', JSON.stringify(updated));
    return Promise.resolve({ data: { id, status: 'APPROVED' } });
  });

export const rejectContractChangeRequest = (id) =>
  withFallback(
    () => API.post(`/change-requests/${id}/reject`),
    () => API.post(`/contract-change-requests/${id}/reject`)
  ).catch(err => {
    // Temporaire: mettre à jour le statut localement
    console.warn('Backend endpoint not available, updating locally:', err);
    const requests = JSON.parse(localStorage.getItem('mockChangeRequests') || '[]');
    const updated = requests.map(r => 
      r.id == id ? { ...r, status: 'REJECTED' } : r
    );
    localStorage.setItem('mockChangeRequests', JSON.stringify(updated));
    return Promise.resolve({ data: { id, status: 'REJECTED' } });
  });

// Notifications API
export const getUserNotifications = (userId) => 
  API.get(`/notifications/user/${userId}`).catch(err => {
    console.warn('Backend notifications not available, using localStorage:', err);
    const localNotifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
    return Promise.resolve({ data: localNotifications });
  });

export const deleteNotification = (userId, notificationId) => 
  API.delete(`/notifications/user/${userId}/${notificationId}`).catch(err => {
    console.warn('Backend delete notification failed:', err);
    // Supprimer localement
    const notifications = JSON.parse(localStorage.getItem('clientNotifications') || '[]');
    const updated = notifications.filter(n => n.id != notificationId);
    localStorage.setItem('clientNotifications', JSON.stringify(updated));
    return Promise.resolve({ data: { success: true } });
  });