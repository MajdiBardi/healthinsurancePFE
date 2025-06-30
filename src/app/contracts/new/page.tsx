'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Update the import path below if your AuthProvider is located elsewhere
import { useAuth } from '../../../contexts/AuthProvider';
import axios from 'axios';

export default function NewContractPage() {
  const { keycloak } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [form, setForm] = useState({
    clientId: '',
    insurerId: '',
    beneficiaryId: '',
    duration: '', // Ajouté
    montant: '',
  });
  const [endDate, setEndDate] = useState(''); // Ajouté
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keycloak?.token) {
      axios.get('http://localhost:8087/api/users', {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      }).then(res => setUsers(res.data));
    }
  }, [keycloak?.token]);

  // Calcule la date de fin dès que la durée change
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
      const payload = {
        ...form,
        creationDate: today.toISOString().split('T')[0], // Date du jour
        endDate: endDate, // Date de fin calculée
        montant: parseFloat(form.montant),
      };
      await axios.post('http://localhost:8222/api/contracts', payload, {
        headers: { Authorization: `Bearer ${keycloak.token}` }
      });
      router.push('/contracts');
    } catch (err) {
      alert('Erreur lors de la création du contrat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        margin: '2rem auto',
        background: '#f4f8fb',
        borderRadius: 18,
        boxShadow: '0 4px 24px #1976d210',
        maxWidth: 600,
        minHeight: 400,
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <h2 style={{ color: '#1976d2', marginBottom: '2rem', letterSpacing: 1 }}>Créer un contrat</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 4px 24px rgba(25, 118, 210, 0.08)',
          padding: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.2rem',
          alignItems: 'center',
          border: '1.5px solid #e3eafc'
        }}
      >
        <select name="clientId" value={form.clientId} onChange={handleChange} required style={{ flex: 1, minWidth: 180, padding: 10, borderRadius: 8, border: '1px solid #b6c6e3', background: '#f7fbff' }}>
          <option value="">Sélectionner un client</option>
          {users.filter((user) => user.role === 'CLIENT').map((user) => (
            <option key={user.id} value={user.id}>{user.name || user.email || user.id}</option>
          ))}
        </select>
        <select name="insurerId" value={form.insurerId} onChange={handleChange} required style={{ flex: 1, minWidth: 180, padding: 10, borderRadius: 8, border: '1px solid #b6c6e3', background: '#f7fbff' }}>
          <option value="">Sélectionner un assureur</option>
          {users.filter((user) => user.role === 'INSURER').map((user) => (
            <option key={user.id} value={user.id}>{user.name || user.email || user.id}</option>
          ))}
        </select>
        <select name="beneficiaryId" value={form.beneficiaryId} onChange={handleChange} required style={{ flex: 1, minWidth: 180, padding: 10, borderRadius: 8, border: '1px solid #b6c6e3', background: '#f7fbff' }}>
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
          style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #b6c6e3', background: '#f7fbff' }}
        >
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
          style={{ flex: 1, minWidth: 120, padding: 10, borderRadius: 8, border: '1px solid #b6c6e3', background: '#eee' }}
          placeholder="Date de fin automatique"
        />
        <input name="montant" placeholder="Montant" type="number" step="0.01" value={form.montant} onChange={handleChange} required style={{ flex: 1, minWidth: 100, padding: 10, borderRadius: 8, border: '1px solid #b6c6e3', background: '#fffbe7', color: '#bfa100', fontWeight: 600 }} />
        <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: 8, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 600, letterSpacing: 1, boxShadow: '0 2px 8px #1976d220' }}>
          {loading ? 'Création...' : 'Créer le contrat'}
        </button>
        <button type="button" onClick={() => router.push('/contracts')}
          style={{ padding: '10px 24px', borderRadius: 8, background: '#eee', border: 'none', marginLeft: 8, fontWeight: 600 }}>
          Annuler
        </button>
      </form>
    </div>
  );
}