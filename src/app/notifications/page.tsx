"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../../contexts/AuthProvider"
import "./notification.css"

export default function NotificationsPage() {
  const { keycloak } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [activeContracts, setActiveContracts] = useState<any[]>([])
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
        <div className="notifications-count">{notifications.length + activeContracts.length} notification(s)</div>
      </div>

      <div className="notifications-content">
        {notifications.length === 0 && activeContracts.length === 0 ? (
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
          </div>
        )}
      </div>
    </div>
  )
}
