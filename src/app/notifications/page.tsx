// ✅ Page: src/app/notifications/page.tsx
'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';

export default function NotificationsPage() {
  const { keycloak } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8222/api/notifications', {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    }).then(res => setNotifications(res.data));
  }, [keycloak.token]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((n: any) => (
          <li key={n.id}>{n.message} – {new Date(n.date).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
