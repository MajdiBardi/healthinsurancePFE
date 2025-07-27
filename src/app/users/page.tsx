'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import axios from 'axios';

export default function UsersPage() {
  const { keycloak } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Création automatique utilisateur Keycloak
  useEffect(() => {
    if (keycloak?.token) {
      axios.get('http://localhost:8087/api/users/me', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
    }
  }, [keycloak?.token]);

  // Récupérer la liste des utilisateurs
  useEffect(() => {
    if (!keycloak?.token) return;
    axios.get('http://localhost:8087/api/users', {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    }).then(res => setUsers(res.data));
  }, [keycloak?.token]);

  return (
    <div
      style={{
        margin: '2rem auto',
        maxWidth: 1100,
        minHeight: 400,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32
      }}>
        <h2 style={{ color: '#1976d2', fontWeight: 700, letterSpacing: 1 }}>
          Liste des utilisateurs
        </h2>
      </div>

      {/* Conteneur scrollable et élégant */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(60,72,100,0.08)',
          padding: 24,
          maxHeight: 500,
          overflowY: 'auto',
          marginBottom: 32,
        }}
      >
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          {users.map((user: any) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              style={{
                background: selectedUser?.id === user.id ? '#e3f2fd' : '#fff',
                borderRadius: 14,
                boxShadow: selectedUser?.id === user.id
                  ? '0 4px 24px #1976d230'
                  : '0 2px 12px #1976d220',
                padding: '1.5rem',
                minWidth: 240,
                flex: '1 1 240px',
                border: selectedUser?.id === user.id
                  ? '2px solid #1976d2'
                  : '1.5px solid #e3eafc',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s, border 0.2s, background 0.2s'
              }}
            >
              <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 18, marginBottom: 6 }}>
                {user.name || user.email || user.id}
              </div>
              <div style={{ color: '#555', fontSize: 15, marginBottom: 2 }}>
                <strong>Email :</strong> {user.email}
              </div>
              <div>
                <span
                  style={{
                    background: user.role === 'ADMIN'
                      ? '#e3f2fd'
                      : user.role === 'CLIENT'
                      ? '#e8f5e9'
                      : user.role === 'INSURER'
                      ? '#fffde7'
                      : '#f3e5f5',
                    color: user.role === 'ADMIN'
                      ? '#1976d2'
                      : user.role === 'CLIENT'
                      ? '#388e3c'
                      : user.role === 'INSURER'
                      ? '#bfa100'
                      : '#8e24aa',
                    borderRadius: 8,
                    padding: '2px 12px',
                    fontWeight: 600,
                    fontSize: 13,
                  }}
                >
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modale détail utilisateur */}
      {selectedUser && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(25, 118, 210, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedUser(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 8px 40px #1976d250',
              padding: '2.5rem 2.5rem 2rem 2.5rem',
              maxWidth: 400,
              width: '90%',
              position: 'relative',
              border: '2.5px solid #1976d2',
              animation: 'popIn 0.25s cubic-bezier(.4,2,.6,1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedUser(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#f4f8fb',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontWeight: 'bold',
                fontSize: 22,
                color: '#1976d2',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #1976d220'
              }}
              aria-label="Fermer"
            >×</button>
            <h3 style={{ color: '#1976d2', marginBottom: 18, textAlign: 'center', fontSize: 24 }}>
              Détail utilisateur
            </h3>
            <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 18, marginBottom: 12 }}>
              {selectedUser.name || selectedUser.email || selectedUser.id}
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>Email :</strong> {selectedUser.email}
            </div>
            <div style={{ marginBottom: 10 }}>
              <strong>ID :</strong> {selectedUser.id}
            </div>
            <div>
              <span
                style={{
                  background: selectedUser.role === 'ADMIN'
                    ? '#e3f2fd'
                    : selectedUser.role === 'CLIENT'
                    ? '#e8f5e9'
                    : selectedUser.role === 'INSURER'
                    ? '#fffde7'
                    : '#f3e5f5',
                  color: selectedUser.role === 'ADMIN'
                    ? '#1976d2'
                    : selectedUser.role === 'CLIENT'
                    ? '#388e3c'
                    : selectedUser.role === 'INSURER'
                    ? '#bfa100'
                    : '#8e24aa',
                  borderRadius: 8,
                  padding: '2px 12px',
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                {selectedUser.role}
              </span>
            </div>
          </div>
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.85); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
