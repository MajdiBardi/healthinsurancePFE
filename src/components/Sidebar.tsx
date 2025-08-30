"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthProvider"
import LogoutButton from "./LogoutButton"
import { useState, useEffect, useRef } from "react"
import "./sidebar.css"

type RoleType = "ADMIN" | "CLIENT" | "INSURER" | "BENEFICIARY"

const roleLinks: Record<RoleType, { href: string; label: string; icon: string }[]> = {
  ADMIN: [
    { href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/users", label: "Utilisateurs", icon: "👥" },
    { href: "/contracts", label: "Contrats", icon: "📋" },
    { href: "/notifications", label: "Notifications", icon: "🔔" },
  ],
  CLIENT: [
    //{ href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/contracts", label: "Mes Contrats", icon: "📋" },
    { href: "/payments", label: "Mon Portfolio", icon: "💼" },
    { href: "/notifications", label: "Notifications", icon: "🔔" },
  ],
  INSURER: [
    //{ href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/users", label: "Utilisateurs", icon: "👥" },
    { href: "/contracts", label: "Contrats", icon: "📋" },
    { href: "/notifications", label: "Notifications", icon: "🔔" },
  ],
  BENEFICIARY: [
    //{ href: "/dashboard", label: "Dashboard", icon: "📊" },
    { href: "/contracts", label: "Contrats", icon: "📋" },
  ],
}

const roleColors: Record<RoleType, { bg: string; color: string }> = {
  ADMIN: { bg: "#e3f2fd", color: "#1976d2" },
  CLIENT: { bg: "#e8f5e9", color: "#388e3c" },
  INSURER: { bg: "#fffde7", color: "#bfa100" },
  BENEFICIARY: { bg: "#f3e5f5", color: "#8e24aa" },
}

export default function Sidebar() {
  const pathname = usePathname()
  const { userRoles, user } = useAuth()
  const [showLogout, setShowLogout] = useState(false)
  const userBoxRef = useRef<HTMLDivElement>(null)

  console.log("user:", user)

  const role: RoleType | undefined = userRoles
    .map((r: string) => r.toUpperCase())
    .find((r) => ["ADMIN", "CLIENT", "INSURER", "BENEFICIARY"].includes(r)) as RoleType | undefined

  const links = role ? roleLinks[role] : []
  const roleColor = role ? roleColors[role] : { bg: "#eee", color: "#333" }

  useEffect(() => {
    if (!showLogout) return
    const handleClick = (e: MouseEvent) => {
      if (userBoxRef.current && !userBoxRef.current.contains(e.target as Node)) {
        setShowLogout(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [showLogout])

  return (
    <div className="sidebar-container">
      <div ref={userBoxRef} className="user-profile-section">
        <div className="user-profile-card" onClick={() => setShowLogout((v) => !v)}>
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || "U"}</div>
          <div className="user-info">
            <div className="user-name">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.name || user?.username || user?.email || "Utilisateur"}
            </div>
            {role && (
              <span className="user-role" style={{ background: roleColor.bg, color: roleColor.color }}>
                {role}
              </span>
            )}
          </div>
          <div className="dropdown-arrow">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"></polyline>
            </svg>
          </div>
        </div>

        {showLogout && (
          <div className="logout-dropdown" onClick={(e) => e.stopPropagation()}>
            <LogoutButton className="logout-button" />
          </div>
        )}
      </div>

      <nav className="navigation-section">
        <ul className="nav-list">
          {links.map((link) => (
            <li key={link.href} className="nav-item">
              <Link href={link.href} className={`nav-link ${pathname === link.href ? "active" : ""}`}>
                <span className="nav-icon">{link.icon}</span>
                <span className="nav-label">{link.label}</span>
                {pathname === link.href && <div className="active-indicator" />}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div>{user.email}</div>
      </div>
    </div>
  )
}
