'use client'
import { useAuth } from '../contexts/AuthProvider'

export default function LogoutButton() {
  const { keycloak } = useAuth()

  return (
    <button
      onClick={() => keycloak.logout()}
      style={{
        padding: '0.5rem 1rem',
        background: '#f44336',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Se déconnecter
    </button>
  )
}
