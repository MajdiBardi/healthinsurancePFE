'use client'

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthProvider';

export default function ContractsPage() {
  const { keycloak } = useAuth();
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    console.log('zzzz')
    axios.get('http://localhost:8082/api/contracts', {
      headers: {
        Authorization: `Bearer ${keycloak.token}`
      }
    }).then(res => {
      console.log(res.data)
      setContracts(res.data);
    });
  }, [keycloak.token]);
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Contrats</h2>
      <ul>
        {contracts.map((c: any) => (
          <li key={c.id}>{c.title} – Bénéficiaire ID: {c.beneficiaryId}</li>
        ))}
      </ul>
    </div>
  );
}