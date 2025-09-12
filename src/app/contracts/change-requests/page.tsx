"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthProvider"
import { getPendingContractChangeRequests, approveContractChangeRequest, rejectContractChangeRequest } from "@/services/api"
import { notificationManager } from "../../../utils/notificationManager"
import RouteGuard from "@/components/RouteGuard"
import axios from "axios"
import "./change-requests.css"

export default function ContractChangeRequestsPage() {
  const { keycloak } = useAuth()
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    getPendingContractChangeRequests()
      .then((res: any) => setRequests(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!keycloak?.token) return
    load()
  }, [keycloak?.token])

  const approve = async (id: string) => {
    try {
      await approveContractChangeRequest(id)
      // Ajouter notification pour le client
      addClientNotification(id, 'APPROVED')
      load()
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const reject = async (id: string) => {
    try {
      await rejectContractChangeRequest(id)
      // Ajouter notification pour le client
      addClientNotification(id, 'REJECTED')
      load()
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  const addClientNotification = (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    const request = requests.find(r => r.id == requestId)
    
    if (request) {
      // Récupérer l'ID du client depuis le contrat
      const getClientIdFromContract = async (contractId: string) => {
        try {
          const response = await axios.get(`http://localhost:8222/api/contracts/${contractId}`, {
            headers: { Authorization: `Bearer ${keycloak.token}` }
          });
          return response.data.clientId;
        } catch (error) {
          console.error('Error fetching contract details:', error);
          return null;
        }
      };

      // Ajouter la notification avec l'ID du client
      getClientIdFromContract(request.contractId).then(clientId => {
        if (clientId) {
          const notification = {
            type: 'CHANGE_REQUEST_UPDATE',
            title: status === 'APPROVED' ? 'Demande approuvée' : 'Demande rejetée',
            message: `Votre demande de modification pour le contrat #${request.contractId} a été ${status === 'APPROVED' ? 'approuvée' : 'rejetée'}.`,
            contractId: request.contractId,
            requestId: requestId,
            status: status
          }
          
          // Utiliser le gestionnaire de notifications offline avec l'ID du client
          notificationManager.addNotification(notification, clientId)
          
          console.log(`Notification ${status} ajoutée pour le client ${clientId}, contrat #${request.contractId}`)
        }
      });
    }
  }

  const getStatusStats = () => {
    const pending = requests.filter(r => r.status === 'PENDING').length
    const approved = requests.filter(r => r.status === 'APPROVED').length
    const rejected = requests.filter(r => r.status === 'REJECTED').length
    return { pending, approved, rejected, total: requests.length }
  }

  const stats = getStatusStats()

  if (loading) {
    return (
      <div className="change-requests-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          Chargement des demandes...
        </div>
      </div>
    )
  }

  return (
    <RouteGuard allowedRoles={['ADMIN', 'INSURER']}>
      <div className="change-requests-container">
        <div className="change-requests-header">
          <h1 className="change-requests-title">Demandes de modification</h1>
          <div className="requests-stats">
            <div className="stat-card stat-pending">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">En attente</div>
            </div>
            <div className="stat-card stat-approved">
              <div className="stat-number">{stats.approved}</div>
              <div className="stat-label">Approuvées</div>
            </div>
            <div className="stat-card stat-rejected">
              <div className="stat-number">{stats.rejected}</div>
              <div className="stat-label">Rejetées</div>
            </div>
          </div>
        </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3" />
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3" />
              <path d="M3 12h6m6 0h6" />
            </svg>
          </div>
          <h3 className="empty-title">Aucune demande</h3>
          <p className="empty-description">Il n'y a actuellement aucune demande de modification à traiter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="requests-table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Contrat</th>
                  <th>Type de modification</th>
                  <th>Description</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1f2937' }}>#{r.contractId}</div>
                    </td>
                    <td>
                      <div style={{ 
                        padding: '0.25rem 0.75rem', 
                        background: '#e0e7ff', 
                        color: '#3730a3', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'inline-block'
                      }}>
                        {r.changeType || r.field}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '200px', lineHeight: '1.4' }}>
                        {r.description || r.reason || '-'}
                      </div>
                    </td>
                    <td>
                      <span className={`request-status status-${r.status.toLowerCase()}`}>
                        {r.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(r.requestedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      {r.status === "PENDING" ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="action-btn btn-approve"
                            onClick={() => approve(r.id)}
                          >
                            ✓ Approuver
                          </button>
                          <button 
                            className="action-btn btn-reject"
                            onClick={() => reject(r.id)}
                          >
                            ✗ Rejeter
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Traité</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="request-cards">
            {requests.map((r) => (
              <div key={r.id} className="request-card">
                <div className="request-header">
                  <div className="request-id">Contrat #{r.contractId}</div>
                  <span className={`request-status status-${r.status.toLowerCase()}`}>
                    {r.status}
                  </span>
                </div>
                
                <div className="request-details">
                  <div className="request-detail">
                    <div className="request-detail-label">Type</div>
                    <div className="request-detail-value">{r.changeType || r.field}</div>
                  </div>
                  <div className="request-detail">
                    <div className="request-detail-label">Date</div>
                    <div className="request-detail-value">
                      {new Date(r.requestedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="request-description">
                  {r.description || r.reason || 'Aucune description fournie'}
                </div>

                <div className="request-actions">
                  {r.status === "PENDING" ? (
                    <>
                      <button 
                        className="action-btn btn-approve"
                        onClick={() => approve(r.id)}
                      >
                        ✓ Approuver
                      </button>
                      <button 
                        className="action-btn btn-reject"
                        onClick={() => reject(r.id)}
                      >
                        ✗ Rejeter
                      </button>
                    </>
                  ) : (
                    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Demande traitée</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      </div>
    </RouteGuard>
  )
}


