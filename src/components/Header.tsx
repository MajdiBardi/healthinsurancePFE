"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import axios from "axios"
import { useAuth } from "../contexts/AuthProvider"
import { notificationManager } from "../utils/notificationManager"
import "./header.css"

export default function Header() {
  const router = useRouter()
  const { keycloak } = useAuth()
  const [contracts, setContracts] = useState<any[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const notifRef = useRef<HTMLButtonElement>(null)

  // Charger les contrats du client et les notifications
  useEffect(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || []
    const userId = keycloak?.tokenParsed?.sub
    
    if (roles.includes("CLIENT")) {
      axios
        .get("http://localhost:8222/api/contracts/my-contracts", {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        })
        .then((res) => setContracts(res.data))
      
      // Charger les notifications non lues pour cet utilisateur
      if (userId) {
        const unreadCount = notificationManager.getUnreadCount(userId)
        setUnreadNotifications(unreadCount)
      }
    }
  }, [keycloak?.token])

  // Rafraîchir le compteur de notifications toutes les 2 secondes
  useEffect(() => {
    const roles = keycloak?.tokenParsed?.realm_access?.roles || []
    const userId = keycloak?.tokenParsed?.sub
    
    if (roles.includes("CLIENT") && userId) {
      const interval = setInterval(() => {
        const unreadCount = notificationManager.getUnreadCount(userId)
        setUnreadNotifications(unreadCount)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [keycloak?.token])

  // Fermer la liste si on clique ailleurs
  useEffect(() => {
    if (!notifOpen) return
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [notifOpen])

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo et titre à gauche */}
        <div className="header-brand">
          <svg className="header-logo" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="22" className="header-logo-bg" />
            <path d="M24 12L30 36H18L24 12Z" className="header-logo-main" />
            <circle cx="24" cy="24" r="8" className="header-logo-accent" />
          </svg>
          <h1 className="header-title">Vermeg Life Insurance</h1>
        </div>

        {/* Bouton notifications à droite */}
        <div className="header-actions">
          <button
            ref={notifRef}
            onClick={() => setNotifOpen((v) => !v)}
            className="notification-button"
            title="Notifications"
          >
            <svg className="notification-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            {unreadNotifications > 0 && <span className="notification-badge">{unreadNotifications}</span>}
          </button>

          {notifOpen && (
            <div className="notification-dropdown">
              <div className="notification-header">Mes contrats</div>
              {contracts.length === 0 && <div className="notification-empty">Aucun contrat trouvé.</div>}
              {contracts.map((c) => {
                const isActive = new Date(c.endDate) >= new Date() && c.status?.toUpperCase() === "ACTIVE"
                return (
                  <div key={c.id} className={`contract-item ${isActive ? "active" : "inactive"}`}>
                    {isActive ? (
                      <svg className="contract-icon active" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                      </svg>
                    ) : (
                      <svg className="contract-icon inactive" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                      </svg>
                    )}
                    Contrat #{c.id} : {isActive ? "Actif" : "Inactif"}
                    <span className="contract-date">
                      {isActive ? `Jusqu'au ${c.endDate}` : `Expiré le ${c.endDate}`}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
