'use client'
import { useAuth } from '@/contexts/AuthProvider';

export default function UsersPage() {
  const { userRoles } = useAuth();

  if (!userRoles.includes('ADMIN')) {
    return <div>Accès refusé</div>;
  }

  return <div>Page Utilisateurs réservée à l’admin</div>;
}
