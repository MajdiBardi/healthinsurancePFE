"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { createContract, updateContract, deleteContract } from "../../services/api"
import type { Contract } from "../../types/contracts"
import axios from "axios"
import jsPDF from "jspdf"
import Link from "next/link"
import { useRouter } from "next/navigation"
import "./contract.css"

export default function ContractsPage() {
  const { keycloak } = useAuth()
  const router = useRouter()
  const roles = keycloak?.tokenParsed?.realm_access?.roles || []
  const userRole = roles.includes("ADMIN")
    ? "ADMIN"
    : roles.includes("INSURER")
      ? "INSURER"
      : roles.includes("CLIENT")
        ? "CLIENT"
        : ""
  const userId = keycloak?.tokenParsed?.sub
  const [contracts, setContracts] = useState<Contract[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [form, setForm] = useState({
    clientId: "",
    insurerId: "",
    beneficiaryId: "",
    duration: "",
    montant: "",
  })
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  useEffect(() => {
    if (keycloak?.token && (userRole === "ADMIN" || userRole === "INSURER")) {
      axios
        .get("http://localhost:8087/api/users", {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
          },
        })
        .then((res) => {
          setUsers(res.data)
          console.log("USERS:", res.data)
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération des utilisateurs :", err)
        })
    }
  }, [keycloak?.token, userRole])

  const fetchContracts = () => {
    const url =
      userRole === "CLIENT" ? "http://localhost:8222/api/contracts/my-contracts" : "http://localhost:8222/api/contracts"

    axios
      .get(url, {
        headers: { Authorization: `Bearer ${keycloak.token}` },
      })
      .then((res) => setContracts(res.data))
      .catch((err) => console.error("Failed to fetch contracts:", err))
  }

  useEffect(() => {
    if (keycloak?.token) {
      localStorage.setItem("token", keycloak.token)
      fetchContracts()
    }
  }, [keycloak?.token])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return ""
    return date.toISOString().split("T")[0]
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const today = new Date()
      const endDate = new Date(today)
      endDate.setFullYear(today.getFullYear() + 1) // Par exemple, ajouter 1 an à la date d'aujourd'hui

      const payload = {
        ...form,
        creationDate: today.toISOString().split("T")[0],
        endDate: endDate,
        montant: Number.parseFloat(form.montant),
        // PAS de status ici !
      }

      await createContract(payload)

      setForm({
        clientId: "",
        insurerId: "",
        beneficiaryId: "",
        status: "",
        creationDate: "",
        endDate: "",
        montant: "",
      })

      fetchContracts()
    } catch (err) {
      console.error("Failed to create contract:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("Voulez-vous supprimer ce contrat ?")) {
      await deleteContract(id)
      fetchContracts()
    }
  }

  const handleEdit = (contract: Contract) => {
    setEditId(contract.id)
    setForm({
      clientId: contract.clientId,
      insurerId: contract.insurerId,
      beneficiaryId: contract.beneficiaryId,
      creationDate: contract.creationDate,
      endDate: contract.endDate,
      montant: contract.montant?.toString() || "",
    })
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setLoading(true)
    try {
      const payload = {
        ...form,
        creationDate: formatDate(form.creationDate),
        endDate: formatDate(form.endDate),
        montant: Number.parseFloat(form.montant),
      }
      await updateContract(editId, payload)
      setEditId(null)
      setForm({
        clientId: "",
        insurerId: "",
        beneficiaryId: "",
        status: "",
        creationDate: "",
        endDate: "",
        montant: "",
      })
      fetchContracts()
    } catch (err) {
      console.error("Failed to update contract:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = () => {
    if (!selectedContract) return
    const doc = new jsPDF()

    doc.setFontSize(24)
    doc.setTextColor("#1976d2")
    doc.setFont("helvetica", "bold")
    doc.text("Vermeg Life Insurance", 105, 20, { align: "center" })

    doc.setDrawColor("#1976d2")
    doc.setLineWidth(1.2)
    doc.line(30, 26, 180, 26)

    doc.setFontSize(18)
    doc.setTextColor("#222")
    doc.setFont("helvetica", "bold")
    doc.text(`Contrat d'assurance N°${selectedContract.id}`, 105, 38, { align: "center" })

    doc.setFontSize(12)
    doc.setTextColor("#888")
    doc.setFont("helvetica", "normal")
    doc.text("Document officiel à signer", 105, 46, { align: "center" })

    let y = 60
    doc.setFontSize(13)
    doc.setTextColor("#1976d2")
    doc.setFont("helvetica", "bold")
    doc.text("Informations du contrat", 30, y)

    y += 8
    doc.setDrawColor("#e3eafc")
    doc.setLineWidth(0.5)
    doc.line(30, y, 180, y)

    y += 12
    const fields = [
      { label: "Statut", value: selectedContract.status },
      { label: "Montant", value: `${selectedContract.montant} DT` },
      { label: "Client", value: getUserDisplay(selectedContract.clientId) },
      { label: "Assureur", value: getUserDisplay(selectedContract.insurerId) },
      { label: "Bénéficiaire", value: getUserDisplay(selectedContract.beneficiaryId) },
      { label: "Date de début", value: selectedContract.creationDate },
      { label: "Date de fin", value: selectedContract.endDate },
    ]

    fields.forEach((f) => {
      doc.setFont("helvetica", "bold")
      doc.setTextColor("#222")
      doc.text(`${f.label} :`, 35, y)
      doc.setFont("helvetica", "normal")
      doc.setTextColor("#444")
      doc.text(`${f.value}`, 80, y)
      y += 10
    })

    y += 18
    doc.setDrawColor("#bbb")
    doc.setLineWidth(0.3)
    doc.line(35, y + 18, 90, y + 18) // Ligne pour signature client
    doc.line(120, y + 18, 175, y + 18) // Ligne pour signature assureur

    doc.setFontSize(12)
    doc.setTextColor("#1976d2")
    doc.setFont("helvetica", "bold")
    doc.text("Signature du client", 62, y + 24, { align: "center" })
    doc.text("Signature de l'assureur", 147, y + 24, { align: "center" })

    const today = new Date()
    doc.setFontSize(10)
    doc.setTextColor("#888")
    doc.setFont("helvetica", "normal")
    doc.text(`Fait à Tunis, le ${today.toLocaleDateString()}`, 35, y + 40)

    doc.setFontSize(9)
    doc.setTextColor("#bbb")
    doc.text("Document généré automatiquement par Vermeg Life Insurance", 105, 285, { align: "center" })

    doc.save(`contrat_${selectedContract.id}.pdf`)
  }

  const getStatus = (endDate: string) => {
    if (!endDate) return "Active"
    const today = new Date()
    const end = new Date(endDate)
    return today <= end ? "Active" : "Inactive"
  }

  const getUserDisplay = (id: string) => {
    const user = users.find((u) => u.id === id)
    return user ? user.name || user.email || user.id : id
  }

  const getUserInitials = (id: string) => {
    const user = users.find((u) => u.id === id)
    const name = user?.name || user?.email || id
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const filteredContracts = contracts.filter((c) => userRole !== "CLIENT" || c.clientId === userId)

  return (
    <div className="contracts-container">
      <div className="contracts-header">
        <h1 className="contracts-title">Liste des contrats</h1>
        {userRole !== "CLIENT" && (
          <Link href="/contracts/new" className="add-contract-btn">
            Ajouter un contrat
          </Link>
        )}
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <p>Chargement des contrats...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="empty-state">
            <h3>Aucun contrat trouvé</h3>
            <p>Il n'y a pas encore de contrats à afficher.</p>
          </div>
        ) : (
          <table className="contracts-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Statut</th>
                <th>Montant</th>
                <th>Assureur</th>
                <th>Bénéficiaire</th>
                <th>Début</th>
                <th>Fin</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr
                  key={contract.id}
                  className={selectedContract?.id === contract.id ? "selected" : ""}
                  onClick={() => setSelectedContract(contract)}
                >
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">{getUserInitials(contract.clientId)}</div>
                      <div className="user-details">
                        <p className="user-name">{getUserDisplay(contract.clientId)}</p>
                        <p className="user-id">#{contract.id}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatus(contract.endDate) === "Active" ? "status-active" : "status-inactive"}`}
                    >
                      {getStatus(contract.endDate)}
                    </span>
                  </td>
                  <td>
                    <span className="amount-text">{contract.montant} DT</span>
                  </td>
                  <td>{getUserDisplay(contract.insurerId)}</td>
                  <td>{getUserDisplay(contract.beneficiaryId)}</td>
                  <td>{contract.creationDate}</td>
                  <td>{contract.endDate}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="view-details-btn action-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedContract(contract)
                        }}
                        title="Voir détails"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                      {userRole !== "CLIENT" && (
                        <>
                          <button
                            className="edit-btn action-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/contracts/new?id=${contract.id}`)
                            }}
                            title="Modifier"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="delete-btn action-btn"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(contract.id)
                            }}
                            title="Supprimer"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3,6 5,6 21,6" />
                              <path d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedContract && (
        <div className="modal-overlay" onClick={() => setSelectedContract(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Détail du contrat #{selectedContract.id}</h2>
              <button className="close-btn" onClick={() => setSelectedContract(null)}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-field">
                <span
                  className={`status-badge ${getStatus(selectedContract.endDate) === "Active" ? "status-active" : "status-inactive"}`}
                >
                  {getStatus(selectedContract.endDate)}
                </span>
              </div>
              <div className="modal-field">
                <strong>Montant :</strong> <span className="amount-text">{selectedContract.montant} DT</span>
              </div>
              <div className="modal-field">
                <strong>Client :</strong> {getUserDisplay(selectedContract.clientId)}
              </div>
              <div className="modal-field">
                <strong>Assureur :</strong> {getUserDisplay(selectedContract.insurerId)}
              </div>
              <div className="modal-field">
                <strong>Bénéficiaire :</strong> {getUserDisplay(selectedContract.beneficiaryId)}
              </div>
              <div className="modal-field">
                <strong>Date de début :</strong> {selectedContract.creationDate}
              </div>
              <div className="modal-field">
                <strong>Date de fin :</strong> {selectedContract.endDate}
              </div>
            </div>
            <div className="modal-actions">
              <button className="pdf-btn" onClick={handleDownloadPDF}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14,2 14,8 20,8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10,9 9,9 8,9" />
                </svg>
                Télécharger en PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
