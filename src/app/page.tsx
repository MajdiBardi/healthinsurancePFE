'use client'
import { useAuth } from '@/contexts/AuthProvider';

export default function UsersPage() {
  const { userRoles } = useAuth();

  if (!userRoles.includes('ADMIN')) {
    return <div>Bonjour !</div>;
  }

  return <div>Bonjour !</div>;
}
