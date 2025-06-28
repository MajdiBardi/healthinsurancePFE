'use client';

import React, { useEffect, useState } from 'react';
import { getContracts, createContract } from '@/services/api';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [formData, setFormData] = useState({
    type: '',
    montant: '',
    dateDebut: '',
    dateFin: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchContracts();
    }
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await getContracts();
      setContracts(res.data);
    } catch (err) {
      console.error('Erreur de récupération des contrats', err);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createContract(formData);
      fetchContracts();
    } catch (err) {
      console.error('Erreur lors de la création', err);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Liste des Contrats</h2>
      <ul>
        {contracts.map((c) => (
          <li key={c.id}>{c.type} - {c.montant} DT</li>
        ))}
      </ul>

      <h3>Créer un contrat</h3>
      <form onSubmit={handleSubmit}>
        <input name="type" placeholder="Type" onChange={handleChange} />
        <input name="montant" placeholder="Montant" type="number" onChange={handleChange} />
        <input name="dateDebut" placeholder="Date début" type="date" onChange={handleChange} />
        <input name="dateFin" placeholder="Date fin" type="date" onChange={handleChange} />
        <button type="submit">Créer</button>
      </form>
    </div>
  );
}
