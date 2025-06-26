'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import axios from 'axios';

export default function UsersPage() {
  const { keycloak } = useAuth();
  const [users, setUsers] = useState([]);

  // 🔹 Étape 1 : Créer automatiquement l'utilisateur à partir du token Keycloak
  useEffect(() => {
    if (keycloak?.token) {
      axios.get('http://localhost:8087/api/users/me', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      }).then(res => {
        console.log("👤 Utilisateur Keycloak créé ou existant :", res.data);
      }).catch(err => {
        console.error("❌ Erreur lors de la création de l'utilisateur :", err);
      });
    }
  }, [keycloak?.token]);

  // 🔹 Étape 2 : Récupérer la liste des utilisateurs
  useEffect(() => {
    console.log("🧪 TOKEN:", keycloak?.token);

    if (!keycloak?.token) {
      console.warn("No token available");
      return;
    }

    axios.get('http://localhost:8087/api/users', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`
      }
    }).then(res => {
      console.log("✅ API users response:", res.data);
      setUsers(res.data);
    }).catch(err => {
      console.error("❌ API error:", err);
    });
  }, [keycloak?.token]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Utilisateurs</h2>
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>
            {user.name} – {user.email} – {user.role}
          </li>
        ))}
      </ul>
    </div>
  );
}
