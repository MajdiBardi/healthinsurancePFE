"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthProvider"
import { createContract, updateContract, deleteContract, createContractChangeRequest, signContract, getContractSignatureStatus, downloadContractPDF } from "../../services/api"
import type { Contract } from "../../types/contracts"
import axios from "axios"
import jsPDF from "jspdf"
import Link from "next/link"
import { useRouter } from "next/navigation"
import "./contract.css"
import ElectronicSignature from "../../components/ElectronicSignature"

// Define the form type
interface ContractForm {
  clientId: string
  insurerId: string
  beneficiaryId: string
  duration?: string
  montant: string
  creationDate?: string
  endDate?: string
}

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
  const [searchTerm, setSearchTerm] = useState("")
  const [form, setForm] = useState<ContractForm>({
    clientId: "",
    insurerId: "",
    beneficiaryId: "",
    montant: "",
  })
  const [loading, setLoading] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  // payment dialog states
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [isPaying, setIsPaying] = useState(false)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [changeType, setChangeType] = useState("AMOUNT_UPDATE")
  const [changeDescription, setChangeDescription] = useState("")
  const [showSignatureDialog, setShowSignatureDialog] = useState(false)
  const [signatureStatus, setSignatureStatus] = useState(null)

  useEffect(() => {
    if (keycloak?.token && (userRole === "ADMIN" || userRole === "INSURER")) {
      axios
        .get("http://localhost:8087/api/users", {
          headers: { Authorization: `Bearer ${keycloak.token}` },
        })
        .then((res) => setUsers(res.data))
        .catch((err) => console.error("Erreur lors de la récupération des utilisateurs :", err))
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

  useEffect(() => {
    if (selectedContract) {
      loadSignatureStatus(selectedContract.id);
    }
  }, [selectedContract])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const formatDate = (dateStr?: string) => {
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
      endDate.setFullYear(today.getFullYear() + 1)

      const payload = {
        ...form,
        creationDate: today.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
        montant: Number.parseFloat(form.montant),
      }

      await createContract(payload)
      setForm({
        clientId: "",
        insurerId: "",
        beneficiaryId: "",
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
      montant: contract.montant?.toString() || "",
      creationDate: contract.creationDate,
      endDate: contract.endDate,
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
        montant: "",
      })
      fetchContracts()
    } catch (err) {
      console.error("Failed to update contract:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!selectedContract) return;
    
    try {
      // Utiliser le nouveau endpoint backend pour PDF avec signatures
      const response = await downloadContractPDF(selectedContract.id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `contrat_${selectedContract.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      // Fallback vers l'ancienne méthode
      generateFallbackPDF();
    }
  };

  const generateFallbackPDF = () => {
    const doc = new jsPDF();

    // En-tête
    doc.setFontSize(22);
    doc.setTextColor('#1976d2');
    doc.text("Vermeg Life Insurance", 105, 22, { align: "center" });

    // Titre du contrat
    doc.setFontSize(16);
    doc.setTextColor('#222');
    doc.text(`Contrat d'assurance N°${selectedContract.id}`, 105, 38, { align: "center" });

    doc.setFontSize(11);
    doc.setTextColor('#888');
    doc.text("Document officiel à signer", 105, 46, { align: "center" });

    // Sous-titre
    doc.setFontSize(13);
    doc.setTextColor('#1976d2');
    doc.text("Informations du contrat", 20, 62);

    // Ligne de séparation
    doc.setDrawColor('#e3eafc');
    doc.setLineWidth(0.5);
    doc.line(20, 65, 190, 65);

    // Infos du contrat
    const infos = [
      { label: "Statut", value: selectedContract.status || getStatus(selectedContract.endDate) },
      { label: "Montant", value: `${selectedContract.montant} DT` },
      { label: "Client", value: getUserDisplay(selectedContract.clientId) },
      { label: "Assureur", value: getUserDisplay(selectedContract.insurerId) },
      { label: "Bénéficiaire", value: getUserDisplay(selectedContract.beneficiaryId) },
      { label: "Date de début", value: selectedContract.creationDate },
      { label: "Date de fin", value: selectedContract.endDate },
    ];

    let y = 78;
    doc.setFontSize(12);
    infos.forEach(({ label, value }) => {
      doc.setTextColor('#222');
      doc.setFont('helvetica', 'bold');
      doc.text(`${label} :`, 28, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#444');
      doc.text(`${value || ''}`, 70, y);
      y += 10;
    });

    // Signatures
    y += 20;
    doc.setDrawColor('#e3eafc');
    doc.line(28, y, 90, y);
    doc.line(120, y, 182, y);

    doc.setFontSize(11);
    doc.setTextColor('#1976d2');
    doc.text("Signature du client", 30, y + 8);
    doc.text("Signature de l'assureur", 122, y + 8);

    // Pied de page
    doc.setFontSize(9);
    doc.setTextColor('#888');
    doc.text(`Fait à Tunis, le ${new Date().toLocaleDateString()}`, 28, y + 22);
    doc.setFontSize(8);
    doc.text("Document généré automatiquement par Vermeg Life Insurance", 105, 285, { align: "center" });

    doc.save(`contrat_${selectedContract.id}.pdf`);
  };

  const handleSignatureComplete = async () => {
    setShowSignatureDialog(false);
    // Rafraîchir le statut de signature
    if (selectedContract) {
      try {
        const response = await getContractSignatureStatus(selectedContract.id);
        setSignatureStatus(response.data);
        fetchContracts(); // Rafraîchir la liste des contrats
      } catch (error) {
        console.error('Erreur lors de la récupération du statut de signature:', error);
      }
    }
  };

  const loadSignatureStatus = async (contractId) => {
    try {
      const response = await getContractSignatureStatus(contractId);
      setSignatureStatus(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement du statut de signature:', error);
    }
  };

  const getStatus = (endDate?: string) => {
    if (!endDate) return "Active"
    const today = new Date()
    const end = new Date(endDate)
    return today <= end ? "Active" : "Inactive"
  }

  const getUserDisplay = (id: string) => {
    const user = users.find((u) => u.id === id)
    return user ? user.name || user.email || String(user.id) : id
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

  const handlePayment = async () => {
    if (!selectedContract) return
    setIsPaying(true)
    try {
      const res = await axios.post(
        "https://sandbox.paymee.tn/api/v2/payments/create",
        {
          amount: Number.parseFloat(selectedContract.montant.toString()),
          note: `Paiement contrat ${selectedContract.id}`,
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          return_url: "https://localhost:3000/payment/success",
          cancel_url: "https://localhost:3000/payment/cancel",
          webhook_url: "https://localhost:8089/api/payments/webhook",
          order_id: selectedContract.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Token 88dad2f8a7db654d6326a0814ad090b3e30cad0a",
          },
        },
      )

      if (res.data?.data?.payment_url) {
        window.location.href = res.data.data.payment_url
      } else {
        alert(`Erreur Paymee: ${res.data.message}`)
      }
    } catch (err) {
      console.error("Erreur paiement:", err)
      alert("Erreur lors du paiement.")
    } finally {
      setIsPaying(false)
    }
  }

  const getStatusBadgeClass = (endDate?: string) => {
    const status = getStatus(endDate)
    return status === "Active" ? "status-badge status-active" : "status-badge status-inactive"
  }

  const filteredContracts = contracts
    .filter((c) => userRole !== "CLIENT" || c.clientId === userId)
    .filter((contract) => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      return (
        getUserDisplay(contract.clientId).toLowerCase().includes(searchLower) ||
        getUserDisplay(contract.insurerId).toLowerCase().includes(searchLower) ||
        getUserDisplay(contract.beneficiaryId).toLowerCase().includes(searchLower) ||
        getStatus(contract.endDate).toLowerCase().includes(searchLower) ||
        (contract.montant?.toString() || "").includes(searchLower) ||
        contract.id.toString().toLowerCase().includes(searchLower)
      )
    })

  return (
    <div className="contracts-container">
      <div className="contracts-header">
        <h1 className="contracts-title">Liste des contrats</h1>
        <div className="header-right">
          <span className="contracts-count">{filteredContracts.length} contrats trouvés</span>
          {userRole !== "CLIENT" && (
            <Link href="/contracts/new" className="add-contract-btn">
              Ajouter un contrat
            </Link>
          )}
        </div>
      </div>

      <div className="search-section">
        <div className="search-container">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par client, statut, montant, ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="loading-state">Chargement...</div>
        ) : filteredContracts.length === 0 ? (
          <div className="empty-state">Aucun contrat trouvé</div>
        ) : (
          <table className="contracts-table">
            <thead>
              <tr>
                <th>CLIENT</th>
                <th>STATUT</th>
                <th>MONTANT</th>
                <th>ASSUREUR</th>
                <th>BÉNÉFICIAIRE</th>
                <th>ID</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map((contract) => (
                <tr key={contract.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{getUserInitials(contract.clientId)}</div>
                      <span className="user-name">{getUserDisplay(contract.clientId)}</span>
                    </div>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(contract.endDate)}>{getStatus(contract.endDate)}</span>
                  </td>
                  <td className="amount-cell">{contract.montant} DT</td>
                  <td className="user-name">{getUserDisplay(contract.insurerId)}</td>
                  <td className="user-name">{getUserDisplay(contract.beneficiaryId)}</td>
                  <td className="contract-id">{contract.id}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedContract(contract)
                      }}
                    >
                      Voir détails
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedContract && (
        <div className="modal-overlay" onClick={() => setSelectedContract(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ minWidth: 400, maxWidth: 480 }}>
            {/* Avatar et titre */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 18 }}>
              <div
                style={{
                  width: 70,
                  height: 70,
                  borderRadius: "50%",
                  background: "#e3f2fd",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#1976d2",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  userSelect: "none",
                }}
              >
                {getUserInitials(selectedContract.clientId)}
              </div>
              <div style={{ fontWeight: 700, color: "#1976d2", fontSize: 22, marginBottom: 2, textAlign: "center" }}>
                {getUserDisplay(selectedContract.clientId)}
              </div>
              <div style={{ color: "#888", fontSize: 15, marginBottom: 2 }}>
                {getUserDisplay(selectedContract.insurerId)}
              </div>
              <div style={{ color: "#888", fontSize: 13 }}>
                Contrat #{selectedContract.id}
              </div>
            </div>

            {/* Infos du contrat */}
            <div style={{ marginBottom: 18 }}>
              <div><b>Statut :</b> {selectedContract.status || getStatus(selectedContract.endDate)}</div>
              <div><b>Montant :</b> {selectedContract.montant} DT</div>
              <div><b>Bénéficiaire :</b> {getUserDisplay(selectedContract.beneficiaryId)}</div>
              <div><b>Date de début :</b> {selectedContract.creationDate}</div>
              <div><b>Date de fin :</b> {selectedContract.endDate}</div>
              
              {/* Statut des signatures */}
              {signatureStatus && (
                <div style={{ marginTop: 15, padding: 10, backgroundColor: '#f5f5f5', borderRadius: 5 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8, color: '#1976d2' }}>Statut des signatures :</div>
                  <div><b>Client :</b> {signatureStatus.clientSignature ? '✓ Signé' : '✗ Non signé'}</div>
                  <div><b>Assureur :</b> {signatureStatus.insurerSignature ? '✓ Signé' : '✗ Non signé'}</div>
                  <div><b>Contrat complet :</b> {signatureStatus.isFullySigned ? '✓ Entièrement signé' : '✗ En attente'}</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 18 }}>
              <button className="action-btn" onClick={handleDownloadPDF}>PDF</button>
              {userRole === "CLIENT" && (
                <>
                  <button className="action-btn" onClick={() => setShowPaymentDialog(true)}>💳 Payer</button>
                  <button className="action-btn" onClick={() => setShowChangeDialog(true)}>🔁 Demander une modification</button>
                  {(!signatureStatus?.clientSignature) && (
                    <button 
                      className="action-btn" 
                      onClick={() => setShowSignatureDialog(true)}
                      style={{ backgroundColor: '#4caf50', color: 'white' }}
                    >
                      ✍️ Signer
                    </button>
                  )}
                </>
              )}
              {userRole === "INSURER" && (
                <>
                  {(!signatureStatus?.insurerSignature) && (
                    <button 
                      className="action-btn" 
                      onClick={() => setShowSignatureDialog(true)}
                      style={{ backgroundColor: '#4caf50', color: 'white' }}
                    >
                      ✍️ Signer
                    </button>
                  )}
                </>
              )}
              {userRole === "ADMIN" && (
                <>
                  <button
                    className="action-btn"
                    style={{ background: "#1976d2", color: "#fff" }}
                    onClick={() => router.push(`/contracts/new?id=${selectedContract.id}`)}
                  >
                    Modifier
                  </button>
                  <button
                    className="action-btn"
                    style={{ background: "#e53935", color: "#fff" }}
                    onClick={() => handleDelete(selectedContract.id)}
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showPaymentDialog && selectedContract && (
        <div className="modal-overlay" onClick={() => setShowPaymentDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Paiement contrat #{selectedContract.id}</h2>
            <p>
              <strong>Montant:</strong> {selectedContract.montant} DT
            </p>
            <p>
              <strong>ID Contrat:</strong> {selectedContract.id}
            </p>
            <input placeholder="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input placeholder="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <button onClick={handlePayment} disabled={isPaying}>
              {isPaying ? "Traitement..." : "Valider le paiement"}
            </button>
          </div>
        </div>
      )}

      {showChangeDialog && selectedContract && (
        <div className="modal-overlay" onClick={() => setShowChangeDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Demande de modification du contrat #{selectedContract.id}</h2>
            <p>Choisissez le type de modification et décrivez votre demande.</p>
            <select value={changeType} onChange={(e) => setChangeType(e.target.value)}>
              <option value="AMOUNT_UPDATE">Montant</option>
              <option value="BENEFICIARY_UPDATE">Bénéficiaire</option>
              <option value="INSURER_UPDATE">Assureur</option>
              <option value="END_DATE_UPDATE">Date de fin</option>
              <option value="OTHER">Autre</option>
            </select>
            <textarea
              placeholder="Décrivez la modification souhaitée"
              value={changeDescription}
              onChange={(e) => setChangeDescription(e.target.value)}
              rows={4}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowChangeDialog(false)}>Annuler</button>
              <button
                onClick={async () => {
                  try {
                    await createContractChangeRequest({
                      contractId: Number(selectedContract.id),
                      changeType,
                      description: changeDescription,
                    })
                    alert('Demande envoyée avec succès.')
                    setShowChangeDialog(false)
                    setChangeDescription('')
                  } catch (e) {
                    alert('Erreur lors de l\'envoi de la demande')
                  }
                }}
                disabled={!changeDescription}
              >
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {showSignatureDialog && selectedContract && (
        <div className="modal-overlay" onClick={() => setShowSignatureDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ minWidth: 500, maxWidth: 600 }}>
            <h2>Signature électronique - Contrat #{selectedContract.id}</h2>
            <p>Signez électroniquement ce contrat en dessinant votre signature ci-dessous.</p>
            
            <ElectronicSignature
              contractId={selectedContract.id}
              onSignatureComplete={handleSignatureComplete}
              userRole={userRole}
            />
            
            <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowSignatureDialog(false)}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
