'use client'
import { useAuth } from '@/contexts/AuthProvider';
import { useRouter } from 'next/navigation';
import './welcome.css';

export default function WelcomePage() {
  const { userRoles, user } = useAuth();
  const router = useRouter();

  const isAdmin = userRoles.includes('ADMIN');
  const isInsurer = userRoles.includes('INSURER');
  const isClient = userRoles.includes('CLIENT');

  const getUserRoleDisplay = () => {
    if (isAdmin) return { text: 'Administrateur', class: 'admin' };
    if (isInsurer) return { text: 'Assureur', class: 'insurer' };
    if (isClient) return { text: 'Client', class: 'client' };
    return { text: 'Utilisateur', class: 'client' };
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name) {
      const names = user.name.split(' ');
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return 'U';
  };

  const getDashboardCards = () => {
    const baseCards = [
      {
        title: 'Tableau de Bord',
        description: 'Consultez vos analyses et statistiques en temps réel',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9,22 9,12 15,12 15,22" />
          </svg>
        ),
        onClick: () => router.push('/dashboard'),
        stats: { number: '12', label: 'Contrats' }
      },
      {
        title: 'Paiements',
        description: 'Gérez vos paiements et transactions financières',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        ),
        onClick: () => router.push('/payments'),
        stats: { number: '€2,450', label: 'Total' }
      }
    ];

    if (isAdmin) {
      baseCards.push(
        {
          title: 'Gestion des Utilisateurs',
          description: 'Administrez les comptes utilisateurs et leurs permissions',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
          onClick: () => router.push('/users'),
          stats: { number: '156', label: 'Utilisateurs' }
        },
        {
          title: 'Analytics ML',
          description: 'Intelligence artificielle et analyses prédictives',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 19c-5 0-9-4-9-9s4-9 9-9 9 4 9 9-4 9-9 9z" />
              <path d="M9 10a2 2 0 100-4 2 2 0 000 4z" />
              <path d="M15 10a2 2 0 100-4 2 2 0 000 4z" />
            </svg>
          ),
          onClick: () => router.push('/ml-analytics'),
          stats: { number: '98%', label: 'Précision' }
        }
      );
    }

    if (isInsurer || isClient) {
      baseCards.push(
        {
          title: 'Mes Contrats',
          description: 'Consultez et gérez vos contrats d\'assurance',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
          ),
          onClick: () => router.push('/contracts'),
          stats: { number: '5', label: 'Actifs' }
        }
      );
    }

    baseCards.push(
      {
        title: 'Notifications',
        description: 'Restez informé des dernières mises à jour',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
        ),
        onClick: () => router.push('/notifications'),
        stats: { number: '3', label: 'Nouvelles' }
      }
    );

    return baseCards;
  };

  const getQuickActions = () => {
    const actions = [
      {
        title: 'Nouveau Contrat',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 5v14M5 12h14" />
          </svg>
        ),
        onClick: () => router.push('/contracts')
      },
      {
        title: 'Effectuer un Paiement',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        ),
        onClick: () => router.push('/payments')
      }
    ];

    if (isAdmin) {
      actions.push(
        {
          title: 'Ajouter un Utilisateur',
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          ),
          onClick: () => router.push('/users')
        }
      );
    }

    return actions;
  };

  const roleInfo = getUserRoleDisplay();

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h1 className="welcome-title">Bienvenue sur Vermeg Life Insurance</h1>
        <p className="welcome-subtitle">
          {isAdmin 
            ? "Plateforme d'administration complète pour la gestion des assurances" 
            : isInsurer 
            ? "Votre espace professionnel pour la gestion des contrats d'assurance"
            : "Votre espace personnel pour gérer vos assurances"
          }
        </p>
        <p className="welcome-description">
          Accédez rapidement à toutes vos fonctionnalités et restez informé de l'état de vos contrats et paiements.
        </p>
      </div>

      <div className="user-info-card">
        <div className="user-info-header">
          <div className="user-avatar">
            {getUserInitials()}
          </div>
          <div className="user-details">
            <h3>
              {user?.name || user?.firstName || 'Utilisateur'} 
              {user?.lastName && ` ${user.lastName}`}
            </h3>
            <div className={`user-role ${roleInfo.class}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              {roleInfo.text}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {getDashboardCards().map((card, index) => (
          <div key={index} className="dashboard-card" onClick={card.onClick}>
            <div className="card-icon">
              {card.icon}
            </div>
            <h3 className="card-title">{card.title}</h3>
            <p className="card-description">{card.description}</p>
            <div className="card-stats">
              <div className="stat-item">
                <p className="stat-number">{card.stats.number}</p>
                <p className="stat-label">{card.stats.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <h3>Actions Rapides</h3>
        <div className="actions-grid">
          {getQuickActions().map((action, index) => (
            <button key={index} className="action-button" onClick={action.onClick}>
              {action.icon}
              {action.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
