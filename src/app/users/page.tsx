'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import axios from 'axios';
import RouteGuard from '../../components/RouteGuard';
import './users.css';

export default function UsersPage() {
  const { keycloak } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

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
    }).then((res: any) => {
        setUsers(res.data)
        setLoading(false)
      });
  }, [keycloak?.token]);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "role-badge role-admin"
      case "CLIENT":
        return "role-badge role-client"
      case "INSURER":
        return "role-badge role-insurer"
      default:
        return "role-badge role-default"
    }
  }

  const filteredUsers = users.filter((user: any) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const userName = (user.name || "").toLowerCase()
    const userEmail = (user.email || "").toLowerCase()
    const userRole = (user.role || "").toLowerCase()
    const userId = (user.id || "").toString().toLowerCase()

    return (
      userName.includes(searchLower) ||
      userEmail.includes(searchLower) ||
      userRole.includes(searchLower) ||
      userId.includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="users-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <span className="loading-text">Chargement des utilisateurs...</span>
        </div>
      </div>
    )
  }

  return (
    <RouteGuard allowedRoles={['ADMIN', 'INSURER']}>
      <div className="users-container">
        <div className="users-header">
          <h2 className="users-title">Liste des utilisateurs</h2>
        </div>

        <div className="search-section">
          <div className="search-container">
            <div className="search-input-wrapper">
              <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Rechercher par nom, email, rôle ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-button"
                  aria-label="Effacer la recherche"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="search-actions">
            <div className="users-count">
              {searchTerm ? `${filteredUsers.length} sur ${users.length}` : users.length} utilisateur
              {(searchTerm ? filteredUsers.length : users.length) > 1 ? "s" : ""} trouvé
              {(searchTerm ? filteredUsers.length : users.length) > 1 ? "s" : ""}
            </div>
          </div>
        </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="users-table">
            <thead className="table-header">
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredUsers.map((user: any, index) => (
                <tr key={user.id} className={`table-row ${selectedUser?.id === user.id ? "selected" : ""}`}>
                  <td className="table-cell">
                    <div className="user-info">
                      <div className="user-avatar">
                        <span className="user-avatar-text">
                          {(user.name || user.email || user.id).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="user-details">
                        <div className="user-name">{user.name || "Nom non défini"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="user-email">{user.email}</div>
                  </td>
                  <td className="table-cell">
                    <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                  </td>
                  <td className="table-cell">
                    <div className="user-id">{user.id}</div>
                  </td>
                  <td className="table-cell">
                    <button onClick={() => setSelectedUser(user)} className="details-button">
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredUsers.length === 0 && (
            <div className="empty-state">
              <div className="empty-text">
                {searchTerm ? "Aucun utilisateur trouvé pour cette recherche" : "Aucun utilisateur trouvé"}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedUser(null)} className="modal-close" aria-label="Fermer">
              ×
            </button>

            <div className="modal-header">
              <div className="modal-avatar">
                <span className="modal-avatar-text">
                  {(selectedUser.name || selectedUser.email || selectedUser.id).charAt(0).toUpperCase()}
                </span>
              </div>
              <h3 className="modal-title">Détail utilisateur</h3>
            </div>

            <div className="modal-fields">
              <div className="modal-field">
                <label className="modal-label">Nom</label>
                <div className="modal-value">{selectedUser.name || selectedUser.email || selectedUser.id}</div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Email</label>
                <div className="modal-value email">{selectedUser.email}</div>
              </div>

              <div className="modal-field">
                <label className="modal-label">ID</label>
                <div className="modal-value id">{selectedUser.id}</div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Rôle</label>
                <span className={getRoleBadgeClass(selectedUser.role)}>{selectedUser.role}</span>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </RouteGuard>
  )
}