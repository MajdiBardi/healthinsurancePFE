"use client"

import { useState } from "react"
import axios from "axios"
import { useAuth } from "../../contexts/AuthProvider" 
import "./payment.css"

export default function PaymentsPage() {
  const { keycloak } = useAuth()
  const [amount, setAmount] = useState("")
  const [method, setMethod] = useState("manual")
  const [contractId, setContractId] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await axios.post(
        "http://localhost:8089/api/payments/manual",
        {
          amount,
          method,
          contractId,
        },
        {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        },
      )

      alert("Paiement effectué avec succès.")
      setAmount("")
      setContractId("")
      setMethod("manual")
    } catch (error) {
      alert("Erreur lors du paiement. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="payments-container">
      <div className="payments-header">
        <h2 className="payments-title">Effectuer un paiement</h2>
        <p className="payments-subtitle">Saisissez les informations de paiement ci-dessous</p>
      </div>

      <div className="payments-card">
        <form onSubmit={handleSubmit} className="payments-form">
          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
              Montant (€)
            </label>
            <input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-input"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label htmlFor="contractId" className="form-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
              </svg>
              ID Contrat
            </label>
            <input
              id="contractId"
              type="text"
              placeholder="Entrez l'ID du contrat"
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="method" className="form-label">
              <svg className="label-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              Méthode de paiement
            </label>
            <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className="form-select">
              <option value="manual">💰 Espèces</option>
              <option value="online">💳 Paymee</option>
            </select>
          </div>

          <button type="submit" className={`submit-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="loading-spinner" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Traitement...
              </>
            ) : (
              <>
                <svg className="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
                Valider le paiement
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
