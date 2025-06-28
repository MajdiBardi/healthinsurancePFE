'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import { getContracts, createContract, updateContract, deleteContract } from '../../services/api';
import type { Contract } from '../../types/contracts';

export default function ContractsPage() {
  const { keycloak } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [form, setForm] = useState({
    clientId: '',
    insurerId: '',
    beneficiaryId: '',
    status: '',
    creationDate: '',
    endDate: '',
    montant: '',
  });
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchContracts = () => {
    getContracts()
      .then((res) => setContracts(res.data))
      .catch((err) => console.error('Failed to fetch contracts:', err));
  };

  useEffect(() => {
    if (keycloak?.token) {
      localStorage.setItem('token', keycloak.token);
      fetchContracts();
    }
  }, [keycloak?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // "YYYY-MM-DD"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        creationDate: formatDate(form.creationDate),
        endDate: formatDate(form.endDate),
        montant: parseFloat(form.montant),
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
      status: contract.status,
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

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Liste des contrats</h2>
      <form onSubmit={editId ? handleUpdate : handleSubmit} style={{ marginBottom: '2rem' }}>
        <input
          name="clientId"
          placeholder="Client ID"
          value={form.clientId}
          onChange={handleChange}
          required
        />
        <input
          name="insurerId"
          placeholder="Assureur ID"
          value={form.insurerId}
          onChange={handleChange}
          required
        />
        <input
          name="beneficiaryId"
          placeholder="Bénéficiaire ID"
          value={form.beneficiaryId}
          onChange={handleChange}
          required
        />
        <input
          name="status"
          placeholder="Statut"
          value={form.status}
          onChange={handleChange}
          required
        />
        <input
          name="creationDate"
          type="date"
          value={form.creationDate}
          onChange={handleChange}
          required
        />
        <input
          name="endDate"
          type="date"
          value={form.endDate}
          onChange={handleChange}
          required
        />
        <input
          name="montant"
          placeholder="Montant"
          type="number"
          step="0.01"
          value={form.montant}
          onChange={handleChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? (editId ? 'Modification...' : 'Création...') : (editId ? 'Modifier' : 'Créer un contrat')}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ clientId: '', insurerId: '', beneficiaryId: '', status: '', creationDate: '', endDate: '', montant: '' }); }}>
            Annuler
          </button>
        )}
      </form>

      <ul>
        {contracts.map((c) => (
          <li key={c.id} style={{ marginBottom: '1rem' }}>
            <strong>ID : </strong>{c.id}<br />
            <strong>Status : </strong>{c.status}<br />
            <strong>Montant : </strong>{c.montant} DT<br />
            <strong>Client : </strong>{c.clientId}<br />
            <strong>Assureur : </strong>{c.insurerId}<br />
            <strong>Bénéficiaire : </strong>{c.beneficiaryId}<br />
            <strong>Date de début : </strong>{c.creationDate}<br />
            <strong>Date de fin : </strong>{c.endDate}
            <button onClick={() => handleEdit(c)}>Modifier</button>
            <button onClick={() => handleDelete(c.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
