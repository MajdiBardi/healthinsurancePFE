'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import LogoutButton from './LogoutButton';
import { useState, useEffect, useRef } from 'react';

type RoleType = 'ADMIN' | 'CLIENT' | 'INSURER' | 'BENEFICIARY';

const roleLinks: Record<RoleType, { href: string; label: string }[]> = {
  ADMIN: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/users', label: 'Utilisateurs' },
    { href: '/contracts', label: 'Contrats' },
    { href: '/notifications', label: 'Notifications' },
  ],
  CLIENT: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contracts', label: 'Mes Contrats' },
    { href: '/payments', label: 'Paiements' },
    { href: '/notifications', label: 'Notifications' },
  ],
  INSURER: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/users', label: 'Utilisateurs' },
    { href: '/contracts', label: 'Contrats' },
    { href: '/notifications', label: 'Notifications' },
  ],
  BENEFICIARY: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contracts', label: 'Contrats' },
  ],
};

const roleColors: Record<RoleType, { bg: string; color: string }> = {
  ADMIN: { bg: '#e3f2fd', color: '#1976d2' },
  CLIENT: { bg: '#e8f5e9', color: '#388e3c' },
  INSURER: { bg: '#fffde7', color: '#bfa100' },
  BENEFICIARY: { bg: '#f3e5f5', color: '#8e24aa' },
};

export default function Sidebar() {
  const pathname = usePathname();
  const { userRoles, user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const userBoxRef = useRef<HTMLDivElement>(null);

  console.log('user:', user);

  const role: RoleType | undefined = userRoles
    .map((r: string) => r.toUpperCase())
    .find((r) => ['ADMIN', 'CLIENT', 'INSURER', 'BENEFICIARY'].includes(r)) as RoleType | undefined;

  const links = role ? roleLinks[role] : [];
  const roleColor = role ? roleColors[role] : { bg: '#eee', color: '#333' };

  useEffect(() => {
    if (!showLogout) return;
    const handleClick = (e: MouseEvent) => {
      if (userBoxRef.current && !userBoxRef.current.contains(e.target as Node)) {
        setShowLogout(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showLogout]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: 240,
        height: '100vh',
        background: 'linear-gradient(135deg, #f4f8fb 60%, #e3f2fd 100%)',
        overflow: 'hidden',
        boxShadow: '2px 0 16px #1976d210',
      }}
    >
      {/* Utilisateur connecté */}
      <div
        ref={userBoxRef}
        style={{
          padding: '2rem 1rem 1.5rem 1rem',
          borderBottom: '1.5px solid #e3eafc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#fff',
          position: 'relative',
        }}
      >
        <div
          style={{ cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          onClick={() => setShowLogout((v) => !v)}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: '#e3f2fd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: '#1976d2',
              marginBottom: 8,
              boxShadow: '0 2px 8px #1976d220',
              textTransform: 'uppercase',
              userSelect: 'none',
            }}
          >
            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ fontWeight: 600, color: '#1976d2', fontSize: 17, marginBottom: 2, textAlign: 'center' }}>
            {user?.name || user?.email || 'Utilisateur'}
          </div>
          {role && (
            <span
              style={{
                background: roleColor.bg,
                color: roleColor.color,
                borderRadius: 8,
                padding: '2px 12px',
                fontWeight: 600,
                fontSize: 13,
                marginTop: 2,
                letterSpacing: 1,
              }}
            >
              {role}
            </span>
          )}
        </div>
        {showLogout && (
          <div
            style={{
              position: 'absolute',
              top: 90,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              border: '1.5px solid #e3eafc',
              borderRadius: 12,
              boxShadow: '0 4px 24px #1976d230',
              padding: '1rem 1.5rem',
              zIndex: 10,
              minWidth: 180,
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <LogoutButton
              style={{
                width: '100%',
                padding: '12px 0',
                borderRadius: 10,
                background: '#e53935',
                color: '#fff',
                fontWeight: 700,
                fontSize: 16,
                border: 'none',
                boxShadow: '0 2px 8px #e5393520',
                cursor: 'pointer',
                letterSpacing: 1,
                transition: 'background 0.18s',
              }}
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '2rem 1rem 1rem 1rem',
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {links.map((link) => (
            <li key={link.href} style={{ marginBottom: '1.2rem' }}>
              <Link
                href={link.href}
                style={{
                  display: 'block',
                  padding: '12px 20px',
                  borderRadius: 10,
                  background: pathname === link.href ? '#1976d2' : '#f7fbff',
                  color: pathname === link.href ? '#fff' : '#1976d2',
                  fontWeight: pathname === link.href ? 700 : 500,
                  fontSize: 16,
                  letterSpacing: 0.5,
                  boxShadow: pathname === link.href ? '0 2px 8px #1976d220' : 'none',
                  border: pathname === link.href ? '2px solid #1976d2' : '1.5px solid #e3eafc',
                  transition: 'all 0.18s',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
