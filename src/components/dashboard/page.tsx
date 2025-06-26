'use client'
import { useAuth } from '../../contexts/AuthProvider'
import LogoutButton from '../../components/LogoutButton'

export default function DashboardPage() {
  const { keycloak } = useAuth()
  const username = keycloak.tokenParsed?.preferred_username

  return (
    <div>
      <h1>Bienvenue, {username} 👋</h1>
      <p>Voici votre tableau de bord.</p>

      <div style={{ marginTop: '2rem' }}>
        <LogoutButton />
      </div>

      <div style={{ display: 'flex', gap: '2rem', marginTop: '3rem' }}>
        <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '8px' }}>
          <h3>Utilisateurs</h3>
          <p>Voir tous les utilisateurs →</p>
        </div>
        <div style={{ background: '#f1f8e9', padding: '1rem', borderRadius: '8px' }}>
          <h3>Contrats</h3>
          <p>Gérer les contrats →</p>
        </div>
        <div style={{ background: '#ffecb3', padding: '1rem', borderRadius: '8px' }}>
          <h3>Paiements</h3>
          <p>Effectuer un paiement →</p>
        </div>
      </div>
    </div>
  )
}
