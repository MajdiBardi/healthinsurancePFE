"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"
import "./success.css"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("payment_token")
  const transaction = searchParams.get("transaction")
  const [status, setStatus] = useState("⏳ Vérification du paiement en cours...")
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (token) {
      // Optional: Ask your backend to confirm status
      axios
        .get(`http://localhost:8089/api/payments/verify?token=${token}`)
        .then(res => {
          if (res.data?.payment_status === true) {
            setStatus("✅ Paiement confirmé avec succès !")
            setIsSuccess(true)
          } else {
            setStatus("❌ Paiement non confirmé. Veuillez contacter le support.")
            setIsSuccess(false)
          }
        })
        .catch(() => {
          setStatus("✅ Merci pour votre confiance !")
          setIsSuccess(true)
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else {
      setIsLoading(false)
      setIsSuccess(true)
      setStatus("✅ Paiement traité avec succès !")
    }
  }, [token])

  const handleGoToDashboard = () => {
    router.push("/dashboard")
  }

  const handleGoToPayments = () => {
    router.push("/payments")
  }

  return (
    <div className="success-container">
      <div className="success-header">
        <h1 className="success-title">Paiement Réussi</h1>
        <p className="success-subtitle">Votre transaction a été traitée avec succès</p>
      </div>

      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>

        <div className="status-message">
          {isLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <svg className="loading-spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 12a9 9 0 11-6.219-8.56" />
              </svg>
              Vérification en cours...
            </div>
          ) : (
            status
          )}
        </div>

        {transaction && (
          <div className="transaction-info">
            <div className="transaction-label">ID de Transaction</div>
            <div className="transaction-id">{transaction}</div>
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="action-button primary" 
            onClick={handleGoToDashboard}
            disabled={isLoading}
          >
            <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Retour au Tableau de Bord
          </button>
          
          <button 
            className="action-button secondary" 
            onClick={handleGoToPayments}
            disabled={isLoading}
          >
            <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            Nouveau Paiement
          </button>
        </div>
      </div>
    </div>
  )
}
