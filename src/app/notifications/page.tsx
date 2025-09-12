"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { getMyContractChangeRequests, getUserNotifications } from "../../services/api"
import { useAuth } from "../../contexts/AuthProvider"
import { notificationManager } from "../../utils/notificationManager"
import "./notification.css"

export default function NotificationsPage() {
  const { keycloak } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [activeContracts, setActiveContracts] = useState<any[]>([])
  const [myChangeRequests, setMyChangeRequests] = useState<any[]>([])
  const [clientNotifications, setClientNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!keycloak?.token) return

    setLoading(true)
    axios
      .get("http://localhost:8222/api/notifications", {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setNotifications(res.data))
      .catch((err) => console.error("Error loading notifications:", err))
      .finally(() => setLoading(false))
  }, [keycloak?.token])

  useEffect(() => {
    if (!keycloak?.token) return
    const roles = keycloak?.tokenParsed?.realm_access?.roles || []
    const userId = keycloak?.tokenParsed?.sub
    console.log('User roles:', roles, 'User ID:', userId)
    
    if (roles.includes("CLIENT")) {
      getMyContractChangeRequests()
        .then((res: any) => setMyChangeRequests(res.data))
        .catch((err: any) => console.error("Error loading change requests:", err))
      
      // Utiliser le gestionnaire de notifications offline avec filtrage par utilisateur
      const userNotifications = notificationManager.getUserNotifications(userId)
      console.log('Loaded local notifications for user:', userId, userNotifications)
      setClientNotifications(userNotifications)
      
      // Essayer le backend en arrière-plan (sans bloquer)
      if (userId) {
        getUserNotifications(userId)
          .then((res: any) => {
            console.log('Backend notifications loaded successfully:', res.data)
            // Fusionner avec les notifications locales filtrées
            const allNotifications = [...res.data, ...userNotifications]
            setClientNotifications(allNotifications)
          })
          .catch((err: any) => {
            console.log('Backend notifications not available (using local only):', err.message)
            // On continue avec localStorage seulement
          })
      }
    }
  }, [keycloak?.token])

  // Rafraîchir les notifications toutes les 2 secondes (localStorage seulement)
  useEffect(() => {
    const interval = setInterval(() => {
      const roles = keycloak?.tokenParsed?.realm_access?.roles || []
      
      if (roles.includes("CLIENT")) {
        // Utiliser le gestionnaire de notifications offline avec filtrage par utilisateur
        const userId = keycloak?.tokenParsed?.sub
        if (userId) {
          const userNotifications = notificationManager.getUserNotifications(userId)
          setClientNotifications(userNotifications)
        }
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [keycloak?.token])

  useEffect(() => {
    if (!keycloak?.token) return

    const roles = keycloak?.tokenParsed?.realm_access?.roles || []
    if (roles.includes("CLIENT")) {
      axios
        .get("http://localhost:8222/api/contracts/my-contracts", {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        })
        .then((res) => {
          const today = new Date()
          const actives = res.data.filter(
            (c: any) => new Date(c.endDate) >= today && c.status?.toUpperCase() === "ACTIVE",
          )
          setActiveContracts(actives)
        })
        .catch((err) => console.error("Error loading contracts:", err))
    }
  }, [keycloak?.token])

  if (loading) {
    return (
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
        </div>
        <div className="loading-state">Chargement des notifications...</div>
      </div>
    )
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-count">{notifications.length + activeContracts.length + myChangeRequests.length + clientNotifications.length} notification(s)</div>
      </div>

      <div className="notifications-content">
        {notifications.length === 0 && activeContracts.length === 0 && myChangeRequests.length === 0 && clientNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </div>
            <h3>Aucune notification</h3>
            <p>Vous n'avez aucune notification pour le moment.</p>
          </div>
        ) : (
          <div className="notifications-list">
            {/* Classic notifications */}
            {notifications.map((n: any) => (
              <div key={n.id} className="notification-card standard">
                <div className="notification-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div className="notification-content">
                  <div className="notification-message">{n.message}</div>
                  <div className="notification-date">{new Date(n.date).toLocaleString()}</div>
                </div>
              </div>
            ))}

            {/* Active contracts notifications */}
            {activeContracts.map((c) => (
              <div key={c.id} className="notification-card contract-active">
                <div className="notification-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                    <path d="M3 12h6m6 0h6" />
                  </svg>
                </div>
                <div className="notification-content">
                  <div className="notification-message">
                    Votre contrat <span className="contract-id">#{c.id}</span> est{" "}
                    <span className="status-active">actif</span> jusqu'au <span className="end-date">{c.endDate}</span>.
                  </div>
                  <div className="notification-date">Contrat actif</div>
                </div>
              </div>
            ))}

            {/* My change requests status */}
            {myChangeRequests.map((r: any) => (
              <div key={r.id} className="notification-card standard">
                <div className="notification-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18" />
                    <path d="M12 3v18" />
                  </svg>
                </div>
                <div className="notification-content">
                  <div className="notification-message">
                    Demande de modification pour le contrat <span className="contract-id">#{r.contractId}</span> — {r.field}: "{r.currentValue}" → "{r.requestedValue}".
                  </div>
                  <div className="notification-date">Statut: {r.status}</div>
                </div>
              </div>
            ))}

            {/* Client notifications (approval/rejection) */}
            {clientNotifications.map((n: any) => (
              <div key={n.id} className={`notification-card ${n.status === 'APPROVED' ? 'contract-active' : 'standard'}`}>
                <div className="notification-icon">
                  {n.status === 'APPROVED' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4" />
                      <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
                      <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
                      <path d="M3 12h6m6 0h6" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                  )}
                </div>
                <div className="notification-content">
                  <div className="notification-message">
                    <strong>{n.title}</strong><br/>
                    {n.message}
                  </div>
                  <div className="notification-date">
                    {new Date(n.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
