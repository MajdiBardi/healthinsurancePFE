"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import axios from "axios"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("payment_token")
  const transaction = searchParams.get("transaction")
  const [status, setStatus] = useState("⏳ Vérification du paiement en cours...")

  useEffect(() => {
    if (token) {
      // Optional: Ask your backend to confirm status
      axios
        .get(`http://localhost:8089/api/payments/verify?token=${token}`)
        .then(res => {
          if (res.data?.payment_status === true) {
            setStatus("✅ Paiement confirmé ! Merci pour votre achat.")
          } else {
            setStatus("❌ Paiement non confirmé. Contactez le support.")
          }
        })
        .catch(() => setStatus("⚠️ Erreur lors de la vérification."))
    }
  }, [token])

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Paiement réussi</h1>
      <p>Transaction ID: {transaction}</p>
      <p>{status}</p>
    </div>
  )
}
