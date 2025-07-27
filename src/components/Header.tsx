'use client';

import { useRouter } from 'next/navigation';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircle from '@mui/icons-material/CheckCircle';
import WarningAmber from '@mui/icons-material/WarningAmber';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthProvider';

export default function Header() {
  const router = useRouter();
  const { keycloak } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLButtonElement>(null);

  // Charger les contrats du client
  useEffect(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
    if (roles.includes('CLIENT')) {
      axios.get('http://localhost:8222/api/contracts/my-contracts', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      }).then(res => setContracts(res.data));
    }
  }, [keycloak?.token]);

  // Fermer la liste si on clique ailleurs
  useEffect(() => {
    if (!notifOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [notifOpen]);

  return (
    <header
      style={{
        width: '100%',
        height: 64,
        background: 'linear-gradient(90deg, #1976d2 70%, #42a5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 12px #1976d220',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1100,
      }}
    >
      <div style={{
        maxWidth: 1200,
        width: '100%',
        margin: '0 auto',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        justifyContent: 'space-between'
      }}>
        {/* Logo et titre à gauche */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" fill="#fff" opacity="0.15"/>
            <path d="M24 12L30 36H18L24 12Z" fill="#fff"/>
            <circle cx="24" cy="24" r="8" fill="#42a5f5" opacity="0.7"/>
          </svg>
          <span style={{
            color: '#fff',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: 1.5,
            fontFamily: 'Segoe UI, Arial, sans-serif',
            textShadow: '0 2px 8px #1976d250'
          }}>
            Vermeg Life Insurance
          </span>
        </div>
        {/* Bouton notifications à droite */}
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <button
            ref={notifRef}
            onClick={() => setNotifOpen((v) => !v)}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 18,
              boxShadow: '0 2px 8px #1976d220',
              cursor: 'pointer',
              transition: 'background 0.2s',
              outline: 'none',
              position: 'relative'
            }}
            title="Notifications"
          >
            <NotificationsIcon style={{
              color: '#1976d2',
              fontSize: 28
            }} />
            {contracts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: 8,
                right: 8,
                background: '#43a047',
                color: '#fff',
                borderRadius: '50%',
                width: 12,
                height: 12,
                fontSize: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                border: '2px solid #fff'
              }} />
            )}
          </button>
          {/* Liste notifications */}
          {notifOpen && (
            <div
              style={{
                position: 'absolute',
                top: 60,
                right: 0,
                minWidth: 320,
                background: '#fff',
                borderRadius: 14,
                boxShadow: '0 8px 32px #1976d230',
                padding: '1rem 0.5rem',
                zIndex: 2000,
                animation: 'popIn 0.18s cubic-bezier(.4,2,.6,1)'
              }}
            >
              <div style={{ fontWeight: 700, color: '#1976d2', fontSize: 17, marginBottom: 10, paddingLeft: 12 }}>
                Mes contrats
              </div>
              {contracts.length === 0 && (
                <div style={{ color: '#888', padding: 12 }}>Aucun contrat trouvé.</div>
              )}
              {contracts.map((c) => {
                const isActive = new Date(c.endDate) >= new Date() && c.status?.toUpperCase() === 'ACTIVE';
                return (
                  <div
                    key={c.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: isActive ? '#e8f5e9' : '#fffde7',
                      marginBottom: 6,
                      fontSize: 15,
                      color: isActive ? '#388e3c' : '#bfa100',
                      fontWeight: 500
                    }}
                  >
                    {isActive
                      ? <CheckCircle style={{ color: '#43a047', fontSize: 20 }} />
                      : <WarningAmber style={{ color: '#ffa726', fontSize: 20 }} />}
                    Contrat #{c.id} : {isActive ? 'Actif' : 'Inactif'}
                    <span style={{ marginLeft: 'auto', color: '#888', fontWeight: 400, fontSize: 13 }}>
                      {isActive ? `Jusqu'au ${c.endDate}` : `Expiré le ${c.endDate}`}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.85); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </header>
  );
}