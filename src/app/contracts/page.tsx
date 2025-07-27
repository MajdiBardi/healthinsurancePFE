'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthProvider';
import { getContracts, createContract, updateContract, deleteContract } from '../../services/api';
import type { Contract } from '../../types/contracts';
import axios from 'axios';
import jsPDF from 'jspdf';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Card, CardContent, CardActions, Typography, Button, Chip, Grid, Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import { Edit, Delete, Close, PictureAsPdf, CheckCircle, WarningAmber } from '@mui/icons-material';

export default function ContractsPage() {
  const { keycloak } = useAuth();
  const router = useRouter();
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

    // Logo ou nom de la société
    doc.setFontSize(24);
    doc.setTextColor('#1976d2');
    doc.setFont('helvetica', 'bold');
    doc.text('Vermeg Life Insurance', 105, 20, { align: 'center' });

    // Ligne de séparation
    doc.setDrawColor('#1976d2');
    doc.setLineWidth(1.2);
    doc.line(30, 26, 180, 26);

    // Titre du contrat
    doc.setFontSize(18);
    doc.setTextColor('#222');
    doc.setFont('helvetica', 'bold');
    doc.text(`Contrat d'assurance N°${selectedContract.id}`, 105, 38, { align: 'center' });

    // Sous-titre
    doc.setFontSize(12);
    doc.setTextColor('#888');
    doc.setFont('helvetica', 'normal');
    doc.text('Document officiel à signer', 105, 46, { align: 'center' });

    // Bloc informations
    let y = 60;
    doc.setFontSize(13);
    doc.setTextColor('#1976d2');
    doc.setFont('helvetica', 'bold');
    doc.text('Informations du contrat', 30, y);

    y += 8;
    doc.setDrawColor('#e3eafc');
    doc.setLineWidth(0.5);
    doc.line(30, y, 180, y);

    y += 12;
    const fields = [
      { label: 'Statut', value: selectedContract.status },
      { label: 'Montant', value: `${selectedContract.montant} DT` },
      { label: 'Client', value: getUserDisplay(selectedContract.clientId) },
      { label: 'Assureur', value: getUserDisplay(selectedContract.insurerId) },
      { label: 'Bénéficiaire', value: getUserDisplay(selectedContract.beneficiaryId) },
      { label: 'Date de début', value: selectedContract.creationDate },
      { label: 'Date de fin', value: selectedContract.endDate },
    ];

    fields.forEach(f => {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor('#222');
      doc.text(`${f.label} :`, 35, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor('#444');
      doc.text(`${f.value}`, 80, y);
      y += 10;
    });

    // Bloc signature
    y += 18;
    doc.setDrawColor('#bbb');
    doc.setLineWidth(0.3);
    doc.line(35, y + 18, 90, y + 18); // Ligne pour signature client
    doc.line(120, y + 18, 175, y + 18); // Ligne pour signature assureur

    doc.setFontSize(12);
    doc.setTextColor('#1976d2');
    doc.setFont('helvetica', 'bold');
    doc.text('Signature du client', 62, y + 24, { align: 'center' });
    doc.text('Signature de l\'assureur', 147, y + 24, { align: 'center' });

    // Date de génération
    const today = new Date();
    doc.setFontSize(10);
    doc.setTextColor('#888');
    doc.setFont('helvetica', 'normal');
    doc.text(`Fait à Tunis, le ${today.toLocaleDateString()}`, 35, y + 40);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor('#bbb');
    doc.text('Document généré automatiquement par Vermeg Life Insurance', 105, 285, { align: 'center' });

    doc.save(`contrat_${selectedContract.id}.pdf`);
  };

  const getStatus = (endDate: string) => {
    if (!endDate) return 'Active';
    const today = new Date();
    const end = new Date(endDate);
    return today <= end ? 'Active' : 'Inactive';
  };

  const getUserDisplay = (id: string) => {
    const user = users.find((u) => u.id === id);
    return user ? user.name || user.email || user.id : id;
  };

  return (
    <div style={{ margin: '2rem auto', maxWidth: 1100, minHeight: 400 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Typography variant="h4" color="primary" fontWeight={700}>
          Liste des contrats
        </Typography>
        {userRole !== 'CLIENT' && (
          <Button
            variant="contained"
            color="primary"
            href="/contracts/new"
            sx={{ borderRadius: 2, fontWeight: 600, boxShadow: 2 }}
          >
            Ajouter un contrat
          </Button>
        )}
      </div>

      {/* Conteneur scrollable */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(60,72,100,0.08)',
          padding: 24,
          maxHeight: 500,
          overflowY: 'auto',
          marginBottom: 32,
        }}
      >
        <Grid container spacing={3}>
          {contracts
            .filter(c => userRole !== 'CLIENT' || c.clientId === userId)
            .map((c) => (
              <Grid item xs={12} sm={6} md={4} key={c.id}>
                <Card
                  variant={selectedContract?.id === c.id ? "outlined" : "elevation"}
                  sx={{
                    borderColor: selectedContract?.id === c.id ? 'primary.main' : 'grey.200',
                    boxShadow: selectedContract?.id === c.id ? 6 : 1,
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s',
                    '&:hover': { boxShadow: 8 }
                  }}
                  onClick={() => setSelectedContract(c)}
                >
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Contrat #{c.id}
                    </Typography>
                    <Chip
                      icon={getStatus(c.endDate) === 'Active' ? <CheckCircle color="success" /> : <WarningAmber color="warning" />}
                      label={getStatus(c.endDate)}
                      color={getStatus(c.endDate) === 'Active' ? "success" : "warning"}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      <strong>Montant :</strong> <span style={{ color: '#bfa100', fontWeight: 700 }}>{c.montant} DT</span>
                    </Typography>
                    <Typography variant="body2"><strong>Client :</strong> {getUserDisplay(c.clientId)}</Typography>
                    <Typography variant="body2"><strong>Assureur :</strong> {getUserDisplay(c.insurerId)}</Typography>
                    <Typography variant="body2"><strong>Bénéficiaire :</strong> {getUserDisplay(c.beneficiaryId)}</Typography>
                    <Typography variant="body2"><strong>Date de début :</strong> {c.creationDate}</Typography>
                    <Typography variant="body2"><strong>Date de fin :</strong> {c.endDate}</Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <strong>Statut :</strong> {c.status}
                    </Typography>
                  </CardContent>
                  {userRole !== 'CLIENT' && (
                    <CardActions>
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={e => {
                          e.stopPropagation();
                          router.push(`/contracts/new?id=${c.id}`);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(c.id);
                        }}
                      >
                        Supprimer
                      </Button>
                    </CardActions>
                  )}
                </Card>
              </Grid>
            ))}
        </Grid>
      </div>

      {/* Détail du contrat sélectionné en Dialog Material UI */}
      <Dialog
        open={!!selectedContract}
        onClose={() => setSelectedContract(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 2 }
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <span>Détail du contrat #{selectedContract?.id}</span>
          <IconButton onClick={() => setSelectedContract(null)}>
            <Close color="primary" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Chip
            icon={getStatus(selectedContract?.endDate) === 'Active'
              ? <CheckCircle color="success" />
              : <WarningAmber color="warning" />}
            label={getStatus(selectedContract?.endDate)}
            color={getStatus(selectedContract?.endDate) === 'Active' ? "success" : "warning"}
            sx={{ mb: 2 }}
          />
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Montant :</strong> <span style={{ color: '#bfa100', fontWeight: 700 }}>{selectedContract?.montant} DT</span>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Client :</strong> {getUserDisplay(selectedContract?.clientId)}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Assureur :</strong> {getUserDisplay(selectedContract?.insurerId)}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Bénéficiaire :</strong> {getUserDisplay(selectedContract?.beneficiaryId)}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Date de début :</strong> {selectedContract?.creationDate}</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}><strong>Date de fin :</strong> {selectedContract?.endDate}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PictureAsPdf />}
            onClick={handleDownloadPDF}
          >
            Télécharger en PDF
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
