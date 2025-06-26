'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthProvider';
import LogoutButton from './LogoutButton';

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
    { href: '/contracts', label: 'Contrats' },
    { href: '/payments', label: 'Paiements' },
  ],
  INSURER: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contracts', label: 'Contrats' },
    { href: '/notifications', label: 'Notifications' },
  ],
  BENEFICIARY: [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/contracts', label: 'Contrats' },
  ],
};

export default function Sidebar() {
  const pathname = usePathname();
  const { userRoles } = useAuth();

  const role = userRoles.find((r) =>
    ['ADMIN', 'CLIENT', 'INSURER', 'BENEFICIARY'].includes(r.toUpperCase())
  )?.toUpperCase() as RoleType | undefined;

  const links = role ? roleLinks[role] : [];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '200px',
        height: '100vh',
        background: '#f0f0f0',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          padding: '1rem',
          paddingBottom: '6rem',
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
          {links.map((link) => (
            <li key={link.href} style={{ marginBottom: '1rem' }}>
              <Link
                href={link.href}
                style={{
                  textDecoration: 'none',
                  fontWeight: pathname === link.href ? 'bold' : 'normal',
                  color: pathname === link.href ? '#3f51b5' : '#333',
                }}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ padding: '1rem', borderTop: '1px solid #ddd' }}>
        <LogoutButton />
      </div>
    </div>
  );
}
