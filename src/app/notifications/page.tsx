// ✅ Page: src/app/notifications/page.tsx
'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';

export default function NotificationsPage() {
  const { keycloak } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeContracts, setActiveContracts] = useState<any[]>([]);

  // Charger notifications classiques
  useEffect(() => {
    axios.get('http://localhost:8222/api/notifications', {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    }).then(res => setNotifications(res.data));
  }, [keycloak.token]);

  // Charger contrats actifs pour le client
  useEffect(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (roles.includes('CLIENT')) {
      axios.get('http://localhost:8222/api/contracts/my-contracts', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      }).then(res => {
        // Filtrer les contrats actifs
        const today = new Date();
        const actives = res.data.filter(
          (c: any) => new Date(c.endDate) >= today && c.status?.toUpperCase() === 'ACTIVE'
        );
        setActiveContracts(actives);
      });
    }
  }, [keycloak.token]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Notifications</h2>
      <ul>
        {/* Notifications classiques */}
        {notifications.map((n: any) => (
          <li key={n.id}>{n.message} – {new Date(n.date).toLocaleString()}</li>
        ))}
        {/* Notification personnalisée pour chaque contrat actif */}
        {activeContracts.map((c) => (
          <li key={c.id} style={{ color: '#1976d2', fontWeight: 600 }}>
            Votre contrat #{c.id} est <span style={{ color: '#388e3c' }}>actif</span> jusqu'au <b>{c.endDate}</b>.
          </li>
        ))}
      </ul>
    </div>
  );
}
