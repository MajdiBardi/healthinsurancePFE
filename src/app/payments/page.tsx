'use client'

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';

export default function PaymentsPage() {
  const { keycloak } = useAuth();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('manual');
  const [contractId, setContractId] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    axios.post('http://localhost:8089/api/payments/manual', {
      amount,
      method,
      contractId
    }, {
      headers: { Authorization: `Bearer ${keycloak.token}` }
    }).then(() => alert('Paiement effectué.'));  
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Effectuer un paiement</h2>
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="Montant" value={amount} onChange={e => setAmount(e.target.value)} /><br />
        <input type="text" placeholder="ID Contrat" value={contractId} onChange={e => setContractId(e.target.value)} /><br />
        <select value={method} onChange={e => setMethod(e.target.value)}>
          <option value="manual">Espèces</option>
          <option value="online">Paymee</option>
        </select><br />
        <button type="submit">Valider</button>
      </form>
    </div>
  );
}