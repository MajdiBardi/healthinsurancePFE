'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import { getContracts, createContract, updateContract, deleteContract } from '../../services/api';
import type { Contract } from '../../types/contracts';
import axios from 'axios';
import jsPDF from 'jspdf';
import Link from 'next/link';

export default function ContractsPage() {
  const { keycloak } = useAuth();
  const roles = keycloak?.tokenParsed?.realm_access?.roles || [];
  const userRole =
    roles.includes('ADMIN')
      ? 'ADMIN'
      : roles.includes('INSURER')
      ? 'INSURER'
      : roles.includes('CLIENT')
      ? 'CLIENT'
      : '';
  const userId = keycloak?.tokenParsed?.sub;
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    clientId: '',
    insurerId: '',
    beneficiaryId: '',
    duration: '',
    montant: '',
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  // Récupérer les utilisateurs (ADMIN ou INSURER uniquement)
  useEffect(() => {
    if (
      keycloak?.token &&
      (userRole === 'ADMIN' || userRole === 'INSURER')
    ) {
      axios.get('http://localhost:8087/api/users', {
        headers: {
          Authorization: `Bearer ${keycloak.token}`
        }
      }).then(res => {
        setUsers(res.data);
        console.log("USERS:", res.data);
      }).catch(err => {
        console.error("Erreur lors de la récupération des utilisateurs :", err);
      });
    }
  }, [keycloak?.token, userRole]);

  const fetchContracts = () => {
    const url =
      userRole === 'CLIENT'
        ? 'http://localhost:8222/api/contracts/my-contracts'
        : 'http://localhost:8222/api/contracts';

    axios.get(url, {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    })
      .then((res) => setContracts(res.data))
      .catch((err) => console.error('Failed to fetch contracts:', err));
  };

  useEffect(() => {
    if (keycloak?.token) {
      localStorage.setItem('token', keycloak.token);
      fetchContracts();
    }
  }, [keycloak?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      endDate.setFullYear(today.getFullYear() + 1); // Par exemple, ajouter 1 an à la date d'aujourd'hui

      const payload = {
        ...form,
        creationDate: today.toISOString().split('T')[0],
        endDate: endDate,
        montant: parseFloat(form.montant),
        // PAS de status ici !
      };

      await createContract(payload);

      setForm({
        clientId: '',
        insurerId: '',
        beneficiaryId: '',
        status: '',
        creationDate: '',
        endDate: '',
        montant: '',
      });

      fetchContracts();
    } catch (err) {
      console.error('Failed to create contract:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous supprimer ce contrat ?')) {
      await deleteContract(id);
      fetchContracts();
    }
  };

  const handleEdit = (contract: Contract) => {
    setEditId(contract.id);
    setForm({
      clientId: contract.clientId,
      insurerId: contract.insurerId,
      beneficiaryId: contract.beneficiaryId,
      // status: contract.status, // SUPPRIMER cette ligne
      creationDate: contract.creationDate,
      endDate: contract.endDate,
      montant: contract.montant?.toString() || '',
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    try {
      const payload = {
        ...form,
        creationDate: formatDate(form.creationDate),
        endDate: formatDate(form.endDate),
        montant: parseFloat(form.montant),
      };
      await updateContract(editId, payload);
      setEditId(null);
      setForm({
        clientId: '',
        insurerId: '',
        beneficiaryId: '',
        status: '',
        creationDate: '',
        endDate: '',
        montant: '',
      });
      fetchContracts();
    } catch (err) {
      console.error('Failed to update contract:', err);
    } finally {
      setLoading(false);
    }
  };
  console.log('userRole:', userRole);
  console.log('tokenParsed:', keycloak?.tokenParsed);

  const handleDownloadPDF = () => {
    if (!selectedContract) return;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor('#1976d2');
    doc.text(`Contrat #${selectedContract.id}`, 20, 20);

    doc.setFontSize(12);
    doc.setTextColor('#222');
    let y = 35;
    doc.text(`Status : ${selectedContract.status}`, 20, y);
    y += 10;
    doc.text(`Montant : ${selectedContract.montant} DT`, 20, y);
    y += 10;
    doc.text(`Client : ${selectedContract.clientId}`, 20, y);
    y += 10;
    doc.text(`Assureur : ${selectedContract.insurerId}`, 20, y);
    y += 10;
    doc.text(`Bénéficiaire : ${selectedContract.beneficiaryId}`, 20, y);
    y += 10;
    doc.text(`Date de début : ${selectedContract.creationDate}`, 20, y);
    y += 10;
    doc.text(`Date de fin : ${selectedContract.endDate}`, 20, y);

    doc.save(`contrat_${selectedContract.id}.pdf`);
  };

  const getStatus = (endDate: string) => {
    if (!endDate) return 'Active';
    const today = new Date();
    const end = new Date(endDate);
    return today <= end ? 'Active' : 'Inactive';
  };

  return (
    <div
      style={{
        margin: '2rem auto',
        background: '#f4f8fb',
        borderRadius: 18,
        boxShadow: '0 4px 24px #1976d210',
        maxWidth: 950,
        minHeight: 400,
        height: 'calc(100vh - 100px)',
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: '#1976d2', letterSpacing: 1 }}>Liste des contrats</h2>
        {userRole !== 'CLIENT' && (
          <Link
            href="/contracts/new"
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: '#1976d2',
              color: '#fff',
              border: 'none',
              fontWeight: 600,
              letterSpacing: 1,
              boxShadow: '0 2px 8px #1976d220',
              textDecoration: 'none'
            }}
          >
            Ajouter un contrat
          </Link>
        )}
      </div>

      {/* Contrats en boxs séparées */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
        {contracts
          .filter(c => userRole !== 'CLIENT' || c.clientId === userId)
          .map((c) => (
            <div
              key={c.id}
              onClick={() => setSelectedContract(c)}
              style={{
                background: selectedContract?.id === c.id ? '#e3f2fd' : '#fff',
                borderRadius: 14,
                boxShadow: selectedContract?.id === c.id
                  ? '0 4px 24px #1976d230'
                  : '0 1px 6px rgba(60,60,60,0.08)',
                padding: '1.5rem',
                minWidth: 260,
                flex: '1 1 260px',
                cursor: 'pointer',
                border: selectedContract?.id === c.id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                transition: 'border 0.2s, box-shadow 0.2s, background 0.2s',
                position: 'relative'
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 8, color: '#1976d2', fontSize: 18 }}>Contrat #{c.id}</div>
              <div>
                <strong>Status :</strong>
                <span style={{
                  marginLeft: 8,
                  color: getStatus(c.endDate) === 'Active' ? '#388e3c' : '#e65100',
                  fontWeight: 600
                }}>{getStatus(c.endDate)}</span>
              </div>
              <div>
                <strong>Montant :</strong>
                <span style={{ color: '#bfa100', fontWeight: 700, marginLeft: 8 }}>{c.montant} DT</span>
              </div>
              <div><strong>Date de début :</strong> {c.creationDate}</div>
              <div><strong>Date de fin :</strong> {c.endDate}</div>
              <div><strong>Statut :</strong> <span>{getStatus(c.endDate)}</span></div>
              {userRole !== 'CLIENT' && (
                <div style={{ marginTop: 12 }}>
                  <button onClick={e => { e.stopPropagation(); handleEdit(c); }} style={{ marginRight: 8, padding: '7px 18px', borderRadius: 6, border: 'none', background: '#1976d2', color: '#fff', fontWeight: 600, boxShadow: '0 2px 8px #1976d220' }}>Modifier</button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} style={{ padding: '7px 18px', borderRadius: 6, border: 'none', background: '#e53935', color: '#fff', fontWeight: 600, boxShadow: '0 2px 8px #e5393520' }}>Supprimer</button>
                </div>
              )}
              <span style={{
                position: 'absolute',
                top: 12,
                right: 18,
                background: c.status === 'Actif' ? '#e8f5e9' : '#fff3e0',
                color: c.status === 'Actif' ? '#388e3c' : '#e65100',
                borderRadius: 8,
                padding: '2px 10px',
                fontSize: 12,
                fontWeight: 600
              }}>
                {c.status}
              </span>
            </div>
          ))}
      </div>

      {/* Détail du contrat sélectionné en modale */}
      {selectedContract && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(25, 118, 210, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedContract(null)}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 20,
              boxShadow: '0 8px 40px #1976d250',
              padding: '2.5rem 2.5rem 2rem 2.5rem',
              maxWidth: 500,
              width: '90%',
              position: 'relative',
              border: '2.5px solid #1976d2',
              animation: 'popIn 0.25s cubic-bezier(.4,2,.6,1)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedContract(null)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: '#f4f8fb',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                fontWeight: 'bold',
                fontSize: 22,
                color: '#1976d2',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #1976d220'
              }}
              aria-label="Fermer"
            >×</button>
            <h3 style={{ color: '#1976d2', marginBottom: 18, textAlign: 'center', fontSize: 26 }}>Détail du contrat #{selectedContract.id}</h3>
            <div style={{ marginBottom: 12 }}><strong>Status :</strong> <span style={{ color: selectedContract.status === 'Actif' ? '#388e3c' : '#e65100', fontWeight: 600 }}>{selectedContract.status}</span></div>
            <div style={{ marginBottom: 12 }}><strong>Montant :</strong> <span style={{ color: '#bfa100', fontWeight: 700 }}>{selectedContract.montant} DT</span></div>
            <div style={{ marginBottom: 12 }}><strong>Client :</strong> {selectedContract.clientId}</div>
            <div style={{ marginBottom: 12 }}><strong>Assureur :</strong> {selectedContract.insurerId}</div>
            <div style={{ marginBottom: 12 }}><strong>Bénéficiaire :</strong> {selectedContract.beneficiaryId}</div>
            <div style={{ marginBottom: 12 }}><strong>Date de début :</strong> {selectedContract.creationDate}</div>
            <div style={{ marginBottom: 12 }}><strong>Date de fin :</strong> {selectedContract.endDate}</div>
            <button
              onClick={handleDownloadPDF}
              style={{
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 18px',
                fontWeight: 600,
                marginBottom: 18,
                cursor: 'pointer',
                boxShadow: '0 2px 8px #1976d220',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto'
              }}
            >
              Télécharger en PDF
            </button>
          </div>
          {/* Petite animation CSS */}
          <style>{`
            @keyframes popIn {
              0% { transform: scale(0.85); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
