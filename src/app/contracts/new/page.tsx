'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthProvider';
import axios from 'axios';

export default function NewContractPage() {
  const { keycloak } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const contractId = searchParams.get('id');
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    clientId: '',
    insurerId: '',
    beneficiaryId: '',
    duration: '',
    montant: '',
  });
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keycloak?.token) {
      axios.get('http://localhost:8087/api/users', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      }).then(res => setUsers(res.data));
    }
  }, [keycloak?.token]);

  useEffect(() => {
    if (form.duration) {
      const today = new Date();
      let end = new Date(today);
      if (form.duration === '6 mois') end.setMonth(end.getMonth() + 6);
      else if (form.duration.endsWith('an')) end.setFullYear(end.getFullYear() + parseInt(form.duration));
      else if (form.duration.endsWith('ans')) end.setFullYear(end.getFullYear() + parseInt(form.duration));
      setEndDate(end.toISOString().split('T')[0]);
    } else {
      setEndDate('');
    }
  }, [form.duration]);

  useEffect(() => {
    if (contractId && keycloak?.token) {
      axios.get(`http://localhost:8222/api/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      }).then(res => {
        const contract = res.data;
        setForm({
          clientId: contract.clientId,
          insurerId: contract.insurerId,
          beneficiaryId: contract.beneficiaryId,
          duration: '',
          montant: contract.montant?.toString() || '',
        });
        setEndDate(contract.endDate);
      });
    }
  }, [contractId, keycloak?.token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const today = new Date();
      const payload = {
        ...form,
        creationDate: today.toISOString().split('T')[0],
        endDate: endDate,
        montant: parseFloat(form.montant),
      };
      if (contractId) {
        await axios.put(`http://localhost:8222/api/contracts/${contractId}`, payload, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        });
      } else {
        await axios.post('http://localhost:8222/api/contracts', payload, {
          headers: { Authorization: `Bearer ${keycloak.token}` }
        });
      }
      router.push('/contracts');
    } catch (err) {
      alert('Erreur lors de la création/modification du contrat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f4f8fb 60%, #e3eafc 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 4px 32px #1976d220',
          maxWidth: 520,
          width: '100%',
          padding: '2.5rem 2rem',
          margin: 'auto'
        }}
      >
        <h2 style={{ color: '#1976d2', marginBottom: '2rem', letterSpacing: 1, textAlign: 'center', fontWeight: 700 }}>
          {contractId ? 'Modifier le contrat' : 'Créer un contrat'}
        </h2>
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.2rem'
          }}
        >
          <select name="clientId" value={form.clientId} onChange={handleChange} required
            style={{ padding: 12, borderRadius: 10, border: '1.5px solid #e3eafc', background: '#f7fbff', fontSize: 16 }}>
            <option value="">Sélectionner un client</option>
            {users.filter((user) => user.role === 'CLIENT').map((user) => (
              <option key={user.id} value={user.id}>{user.name || user.email || user.id}</option>
            ))}
          </select>
          <select name="insurerId" value={form.insurerId} onChange={handleChange} required
            style={{ padding: 12, borderRadius: 10, border: '1.5px solid #e3eafc', background: '#f7fbff', fontSize: 16 }}>
            <option value="">Sélectionner un assureur</option>
            {users.filter((user) => user.role === 'INSURER').map((user) => (
              <option key={user.id} value={user.id}>{user.name || user.email || user.id}</option>
            ))}
          </select>
          <select name="beneficiaryId" value={form.beneficiaryId} onChange={handleChange} required
            style={{ padding: 12, borderRadius: 10, border: '1.5px solid #e3eafc', background: '#f7fbff', fontSize: 16 }}>
            <option value="">Sélectionner un bénéficiaire</option>
            {users.filter((user) => user.role === 'BENEFICIARY').map((user) => (
              <option key={user.id} value={user.id}>{user.name || user.email || user.id}</option>
            ))}
          </select>
          <select
            name="duration"
            value={form.duration}
            onChange={handleChange}
            required
            style={{ padding: 12, borderRadius: 10, border: '1.5px solid #e3eafc', background: '#f7fbff', fontSize: 16 }}>
            <option value="">Sélectionner une durée</option>
            <option value="6 mois">6 mois</option>
            <option value="1 an">1 an</option>
            <option value="2 ans">2 ans</option>
            <option value="3 ans">3 ans</option>
            <option value="4 ans">4 ans</option>
            <option value="5 ans">5 ans</option>
          </select>
          <input
            type="text"
            value={endDate ? `Fin : ${endDate}` : ''}
            readOnly
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1.5px solid #e3eafc',
              background: '#f4f8fb',
              fontSize: 16,
              color: '#1976d2',
              fontWeight: 600
            }}
            placeholder="Date de fin automatique"
          />
          <input
            name="montant"
            placeholder="Montant"
            type="number"
            step="0.01"
            value={form.montant}
            onChange={handleChange}
            required
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1.5px solid #e3eafc',
              background: '#fffbe7',
              color: '#bfa100',
              fontWeight: 700,
              fontSize: 16
            }}
          />
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                background: '#1976d2',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: 16,
                letterSpacing: 1,
                boxShadow: '0 2px 8px #1976d220',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s'
              }}
            >
              {loading ? 'Création...' : contractId ? 'Enregistrer' : 'Créer le contrat'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/contracts')}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 10,
                background: '#eee',
                border: 'none',
                fontWeight: 700,
                fontSize: 16,
                color: '#1976d2',
                cursor: 'pointer'
              }}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}