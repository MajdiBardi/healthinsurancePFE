'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import TrendingUp from '@mui/icons-material/TrendingUp';
import People from '@mui/icons-material/People';
import Assessment from '@mui/icons-material/Assessment';
import Warning from '@mui/icons-material/Warning';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Refresh from '@mui/icons-material/Refresh';

interface MlMetrics {
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

const MlMetricsWidget: React.FC = () => {
  const [metrics, setMetrics] = useState<MlMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8086/api/ml/analytics/dashboard');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des métriques ML');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err && typeof err === 'object' && 'message' in err ? String(err.message) : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const getClusterColor = (clusterName: string) => {
    const colors: Record<string, 'primary' | 'secondary' | 'warning' | 'error'> = {
      'Prudents': 'primary',
      'Équilibrés': 'secondary',
      'Agressifs': 'warning',
      'VIP': 'error'
    };
    return colors[clusterName] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Métriques ML
          </Typography>
          <LinearProgress />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Métriques ML
            <Tooltip title="Actualiser">
              <IconButton size="small" onClick={fetchMetrics} sx={{ ml: 1 }}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Typography>
          <Alert severity="error" size="small">
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Intelligence Artificielle
          </Typography>
          <Tooltip title="Actualiser">
            <IconButton size="small" onClick={fetchMetrics}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {/* Métriques de Prédiction */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <Assessment sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2">Prédictions</Typography>
            </Box>
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Accuracy
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {(metrics.predictionMetrics.accuracy * 100).toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  ROC AUC
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.predictionMetrics.rocAuc.toFixed(3)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Aujourd'hui
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.predictionMetrics.predictionsToday}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.predictionMetrics.totalPredictions}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Métriques de Clustering */}
          <Grid item xs={12} sm={6}>
            <Box display="flex" alignItems="center" mb={1}>
              <People sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="subtitle2">Segmentation</Typography>
            </Box>
            
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Clusters
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.clusteringMetrics.totalClusters}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption" color="text.secondary">
                  Silhouette
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.clusteringMetrics.silhouetteScore.toFixed(3)}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Clients Segmentés
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {metrics.clusteringMetrics.totalClients}
                </Typography>
              </Grid>
            </Grid>
          </Grid>

          {/* Distribution des Clusters */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Répartition des Clusters
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.entries(metrics.clusterDistribution).map(([cluster, count]) => (
                <Chip
                  key={cluster}
                  label={`${cluster}: ${count}`}
                  color={getClusterColor(cluster)}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>

          {/* Distribution des Prédictions */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Prédictions Récentes
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {Object.entries(metrics.predictionDistribution).map(([type, count]) => (
                <Chip
                  key={type}
                  label={`${type}: ${count}`}
                  color={type === 'Rachat Anticipé' ? 'error' : 'success'}
                  size="small"
                  icon={type === 'Rachat Anticipé' ? <Warning /> : <CheckCircle />}
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default MlMetricsWidget;
