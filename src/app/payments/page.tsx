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

  // Paymee-specific states
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (method === "manual") {
        // Manual payment (your backend)
        await axios.post(
          "http://localhost:8089/api/payments/manual",
          {
            amount,
            method,
            contractId,
          },
          {
            headers: { Authorization: `Bearer ${keycloak.token}` },
          }
        )

        alert("Paiement manuel effectué avec succès.")
        setAmount("")
        setContractId("")
        setMethod("manual")
      } else if (method === "online") {
  try {
    const res = await axios.post(
      "https://sandbox.paymee.tn/api/v2/payments/create",
      {
        amount: parseFloat(amount),
        note: `Paiement contrat ${contractId}`,
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        return_url: "https://localhost:3000/payment/success",
        cancel_url: "https://localhost:3000/payment/cancel",
        webhook_url: "https://localhost:8089/api/payments/webhook",
        order_id: contractId,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Token 88dad2f8a7db654d6326a0814ad090b3e30cad0a",
        },
      }
    )

    console.log("Paymee response:", res.data) // 👀 log everything

    if (res.data?.data?.payment_url) {
      window.location.href = res.data.data.payment_url
    } else {
      alert(`Erreur Paymee: ${res.data.message}\n${JSON.stringify(res.data.errors)}`)
    }
  } catch (err: any) {
    console.error(err)
    alert("Erreur lors de la requête Paymee.")
  }
}

    } catch (error) {
      console.error(error)
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
              Méthode de paiement
            </label>
            <select id="method" value={method} onChange={(e) => setMethod(e.target.value)} className="form-select">
              <option value="manual">💰 Espèces</option>
              <option value="online">💳 Paymee</option>
            </select>
          </div>

          {/* Extra fields only if Paymee selected */}
          {method === "online" && (
            <>
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">Prénom</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Prénom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="lastName" className="form-label">Nom</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+216..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </>
          )}

          <button type="submit" className={`submit-button ${isLoading ? "loading" : ""}`} disabled={isLoading}>
            {isLoading ? "Traitement..." : "Valider le paiement"}
          </button>
        </form>
      </div>
    </div>
  )
}
