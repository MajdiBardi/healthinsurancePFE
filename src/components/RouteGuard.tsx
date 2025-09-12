'use client'

import { useAuth } from '@/contexts/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import './route-guard.css'

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export default function RouteGuard({ 
  children, 
  allowedRoles, 
  redirectTo = '/' 
}: RouteGuardProps) {
  const { userRoles, authenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!authenticated) {
      router.push('/login')
      return
    }

    const hasPermission = allowedRoles.some(role => 
      userRoles.includes(role.toUpperCase())
    )

    if (!hasPermission) {
      // Rediriger vers la page d'accueil avec un message d'erreur
      router.push(redirectTo)
    }
  }, [authenticated, userRoles, allowedRoles, redirectTo, router])

  if (!authenticated) {
    return (
      <div className="route-guard-container">
        <div className="route-guard-card">
          <div className="route-guard-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="route-guard-title">Authentification requise</h2>
          <p className="route-guard-message">Vous devez être connecté pour accéder à cette page.</p>
          <div className="route-guard-spinner">
            <div className="spinner"></div>
          </div>
        </div>
      </div>
    )
  }

  const hasPermission = allowedRoles.some(role => 
    userRoles.includes(role.toUpperCase())
  )

  if (!hasPermission) {
    return (
      <div className="route-guard-container">
        <div className="route-guard-card unauthorized">
          <div className="route-guard-icon unauthorized">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M18 6L6 18M6 6l12 12" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <h2 className="route-guard-title">Accès refusé</h2>
          <p className="route-guard-message">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <div className="route-guard-details">
            <div className="permission-info">
              <h3>Rôles autorisés :</h3>
              <div className="role-badges">
                {allowedRoles.map((role, index) => (
                  <span key={index} className="role-badge">
                    {role}
                  </span>
                ))}
              </div>
            </div>
            <div className="user-info">
              <h3>Votre rôle actuel :</h3>
              <div className="current-roles">
                {userRoles.map((role, index) => (
                  <span key={index} className="current-role-badge">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            className="route-guard-button"
            onClick={() => router.push(redirectTo)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Retour à l'accueil
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
