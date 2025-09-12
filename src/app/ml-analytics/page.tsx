'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import People from '@mui/icons-material/People';
import Assessment from '@mui/icons-material/Assessment';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

// Types
interface PredictionRequest {
  capitalInitial: number;
  rendementAnnuel: number;
  dureeContratJours: number;
  revenuAnnuel: number;
  scoreRisque: number;
  ageClient: number;
  nbTransactions: number;
  montantVersements: number;
  montantRachats: number;
  ratioRachats: number;
  nbAlertes: number;
  nbAlertesEleve: number;
  typeProfilPrudent: boolean;
  typeProfilEquilibre: boolean;
}

interface PredictionResponse {
  rachatAnticipe: boolean;
  probabiliteRachat: number;
  niveauRisque: string;
  recommandation: string;
  message: string;
}

interface ClusteringRequest {
  capitalInitial: number;
  rendementAnnuel: number;
  revenuAnnuel: number;
  scoreRisque: number;
  montantVersements: number;
  montantRachats: number;
  ratioRachats: number;
  ageClient: number;
  nbTransactions: number;
  nbAlertes: number;
  nbAlertesEleve: number;
  typeProfilPrudent: boolean;
  typeProfilEquilibre: boolean;
}

interface ClusteringResponse {
  clusterId: number;
  nomCluster: string;
  description: string;
  profilClient: string;
  recommandations: string;
  scoreAffinite: number;
}

interface DashboardData {
  predictionMetrics: {
    accuracy: number;
    f1Score: number;
    rocAuc: number;
    totalPredictions: number;
    predictionsToday: number;
  };
  clusteringMetrics: {
    totalClusters: number;
    silhouetteScore: number;
    totalClients: number;
  };
  clusterDistribution: Record<string, number>;
  predictionDistribution: Record<string, number>;
}

const MlAnalyticsPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les modales
  const [predictionDialogOpen, setPredictionDialogOpen] = useState(false);
  const [clusteringDialogOpen, setClusteringDialogOpen] = useState(false);
  
  // États pour les formulaires
  const [predictionRequest, setPredictionRequest] = useState<PredictionRequest>({
    capitalInitial: 0,
    rendementAnnuel: 0,
    dureeContratJours: 0,
    revenuAnnuel: 0,
    scoreRisque: 0,
    ageClient: 0,
    nbTransactions: 0,
    montantVersements: 0,
    montantRachats: 0,
    ratioRachats: 0,
    nbAlertes: 0,
    nbAlertesEleve: 0,
    typeProfilPrudent: false,
    typeProfilEquilibre: false
  });
  
  const [clusteringRequest, setClusteringRequest] = useState<ClusteringRequest>({
    capitalInitial: 0,
    rendementAnnuel: 0,
    revenuAnnuel: 0,
    scoreRisque: 0,
    montantVersements: 0,
    montantRachats: 0,
    ratioRachats: 0,
    ageClient: 0,
    nbTransactions: 0,
    nbAlertes: 0,
    nbAlertesEleve: 0,
    typeProfilPrudent: false,
    typeProfilEquilibre: false
  });
  
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null);
  const [clusteringResult, setClusteringResult] = useState<ClusteringResponse | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8086/api/ml/analytics/dashboard');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des données');
      }
      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handlePrediction = async () => {
    try {
      const response = await fetch('http://localhost:8086/api/ml/prediction/rachat-anticipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(predictionRequest),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la prédiction');
      }
      
      const result = await response.json();
      setPredictionResult(result);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Erreur lors de la prédiction');
    }
  };

  const handleClustering = async () => {
    try {
      const response = await fetch('http://localhost:8086/api/ml/clustering/segment-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(clusteringRequest),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors du clustering');
      }
      
      const result = await response.json();
      setClusteringResult(result);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Erreur lors du clustering');
    }
  };

  const getRiskColor = (niveau: string) => {
    switch (niveau) {
      case 'FAIBLE': return 'success';
      case 'MOYEN': return 'warning';
      case 'ÉLEVÉ': return 'error';
      default: return 'default';
    }
  };

  const getClusterColor = (clusterId: number) => {
    const colors = ['primary', 'secondary', 'warning', 'error'];
    return colors[clusterId] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Analytics ML</Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Analytics ML</Typography>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Analytics ML - Intelligence Artificielle
      </Typography>
      
      <Grid container spacing={3}>
        {/* Métriques de Prédiction */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <Assessment sx={{ mr: 1, verticalAlign: 'middle' }} />
                Métriques de Prédiction
              </Typography>
              {dashboardData && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy
                    </Typography>
                    <Typography variant="h6">
                      {(dashboardData.predictionMetrics.accuracy * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      ROC AUC
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.predictionMetrics.rocAuc.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Prédictions Aujourd'hui
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.predictionMetrics.predictionsToday}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total Prédictions
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.predictionMetrics.totalPredictions}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              <Button
                variant="contained"
                onClick={() => setPredictionDialogOpen(true)}
                sx={{ mt: 2 }}
                fullWidth
              >
                Nouvelle Prédiction
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Métriques de Clustering */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <People sx={{ mr: 1, verticalAlign: 'middle' }} />
                Segmentation Client
              </Typography>
              {dashboardData && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Clusters
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.clusteringMetrics.totalClusters}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Silhouette Score
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.clusteringMetrics.silhouetteScore.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Total Clients
                    </Typography>
                    <Typography variant="h6">
                      {dashboardData.clusteringMetrics.totalClients}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              <Button
                variant="contained"
                onClick={() => setClusteringDialogOpen(true)}
                sx={{ mt: 2 }}
                fullWidth
              >
                Segmenter Client
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Répartition des Clusters */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Répartition par Cluster
              </Typography>
              {dashboardData && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Cluster</TableCell>
                        <TableCell align="right">Clients</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(dashboardData.clusterDistribution).map(([cluster, count]) => (
                        <TableRow key={cluster}>
                          <TableCell>
                            <Chip 
                              label={cluster} 
                              color={getClusterColor(Object.keys(dashboardData.clusterDistribution).indexOf(cluster))}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Répartition des Prédictions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Répartition des Prédictions
              </Typography>
              {dashboardData && (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell align="right">Nombre</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.entries(dashboardData.predictionDistribution).map(([type, count]) => (
                        <TableRow key={type}>
                          <TableCell>
                            <Chip 
                              label={type} 
                              color={type === 'Rachat Anticipé' ? 'error' : 'success'}
                              size="small"
                              icon={type === 'Rachat Anticipé' ? <Warning /> : <CheckCircle />}
                            />
                          </TableCell>
                          <TableCell align="right">{count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog de Prédiction */}
      <Dialog 
        open={predictionDialogOpen} 
        onClose={() => setPredictionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Prédiction de Rachat Anticipé</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Capital Initial"
                type="number"
                value={predictionRequest.capitalInitial}
                onChange={(e) => setPredictionRequest({
                  ...predictionRequest,
                  capitalInitial: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Rendement Annuel (%)"
                type="number"
                value={predictionRequest.rendementAnnuel}
                onChange={(e) => setPredictionRequest({
                  ...predictionRequest,
                  rendementAnnuel: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Durée Contrat (jours)"
                type="number"
                value={predictionRequest.dureeContratJours}
                onChange={(e) => setPredictionRequest({
                  ...predictionRequest,
                  dureeContratJours: parseInt(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Revenu Annuel"
                type="number"
                value={predictionRequest.revenuAnnuel}
                onChange={(e) => setPredictionRequest({
                  ...predictionRequest,
                  revenuAnnuel: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Score de Risque"
                type="number"
                value={predictionRequest.scoreRisque}
                onChange={(e) => setPredictionRequest({
                  ...predictionRequest,
                  scoreRisque: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Âge Client"
                type="number"
                value={predictionRequest.ageClient}
                onChange={(e) => setPredictionRequest({
                  ...predictionRequest,
                  ageClient: parseInt(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
          </Grid>
          
          {predictionResult && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>Résultat de la Prédiction</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Prédiction
                  </Typography>
                  <Chip 
                    label={predictionResult.rachatAnticipe ? 'RACHAT ANTICIPÉ' : 'NON RACHETÉ'}
                    color={predictionResult.rachatAnticipe ? 'error' : 'success'}
                    icon={predictionResult.rachatAnticipe ? <Warning /> : <CheckCircle />}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Probabilité
                  </Typography>
                  <Typography variant="h6">
                    {(predictionResult.probabiliteRachat * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Niveau de Risque
                  </Typography>
                  <Chip 
                    label={predictionResult.niveauRisque}
                    color={getRiskColor(predictionResult.niveauRisque)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Recommandation
                  </Typography>
                  <Typography variant="body1">
                    {predictionResult.recommandation}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPredictionDialogOpen(false)}>Fermer</Button>
          <Button onClick={handlePrediction} variant="contained">
            Prédire
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de Clustering */}
      <Dialog 
        open={clusteringDialogOpen} 
        onClose={() => setClusteringDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Segmentation Client</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                label="Capital Initial"
                type="number"
                value={clusteringRequest.capitalInitial}
                onChange={(e) => setClusteringRequest({
                  ...clusteringRequest,
                  capitalInitial: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Rendement Annuel (%)"
                type="number"
                value={clusteringRequest.rendementAnnuel}
                onChange={(e) => setClusteringRequest({
                  ...clusteringRequest,
                  rendementAnnuel: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Revenu Annuel"
                type="number"
                value={clusteringRequest.revenuAnnuel}
                onChange={(e) => setClusteringRequest({
                  ...clusteringRequest,
                  revenuAnnuel: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Score de Risque"
                type="number"
                value={clusteringRequest.scoreRisque}
                onChange={(e) => setClusteringRequest({
                  ...clusteringRequest,
                  scoreRisque: parseFloat(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type de Profil</InputLabel>
                <Select
                  value={clusteringRequest.typeProfilPrudent ? 'prudent' : clusteringRequest.typeProfilEquilibre ? 'equilibre' : 'agressif'}
                  onChange={(e) => {
                    const value = e.target.value;
                    setClusteringRequest({
                      ...clusteringRequest,
                      typeProfilPrudent: value === 'prudent',
                      typeProfilEquilibre: value === 'equilibre'
                    });
                  }}
                >
                  <MenuItem value="prudent">Prudent</MenuItem>
                  <MenuItem value="equilibre">Équilibré</MenuItem>
                  <MenuItem value="agressif">Agressif</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Âge Client"
                type="number"
                value={clusteringRequest.ageClient}
                onChange={(e) => setClusteringRequest({
                  ...clusteringRequest,
                  ageClient: parseInt(e.target.value) || 0
                })}
                fullWidth
              />
            </Grid>
          </Grid>
          
          {clusteringResult && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom>Résultat de la Segmentation</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Cluster
                  </Typography>
                  <Chip 
                    label={clusteringResult.nomCluster}
                    color={getClusterColor(clusteringResult.clusterId)}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Score d'Affinité
                  </Typography>
                  <Typography variant="h6">
                    {(clusteringResult.scoreAffinite * 100).toFixed(1)}%
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">
                    {clusteringResult.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Profil Client
                  </Typography>
                  <Typography variant="body1">
                    {clusteringResult.profilClient}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Recommandations
                  </Typography>
                  <Typography variant="body1">
                    {clusteringResult.recommandations}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClusteringDialogOpen(false)}>Fermer</Button>
          <Button onClick={handleClustering} variant="contained">
            Segmenter
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MlAnalyticsPage;
