import React, { useRef, useState } from 'react';
import { signContract } from '../services/api';

const ElectronicSignature = ({ contractId, onSignatureComplete, userRole }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = async () => {
    if (!hasSignature) {
      alert('Veuillez d\'abord signer');
      return;
    }

    try {
      const canvas = canvasRef.current;
      
      // Réduire la taille de l'image pour éviter l'erreur de base de données
      const resizedCanvas = document.createElement('canvas');
      const ctx = resizedCanvas.getContext('2d');
      
      // Redimensionner à 200x80 pixels
      resizedCanvas.width = 200;
      resizedCanvas.height = 80;
      
      // Dessiner l'image redimensionnée
      ctx.drawImage(canvas, 0, 0, 200, 80);
      
      // Convertir en base64 avec compression
      const signatureData = resizedCanvas.toDataURL('image/jpeg', 0.7);
      
      console.log('Envoi de la signature pour le contrat:', contractId);
      console.log('Rôle de l\'utilisateur:', userRole);
      console.log('Taille de la signature:', signatureData.length, 'caractères');
      console.log('Données de signature (premiers 100 caractères):', signatureData.substring(0, 100));
      
      // Vérifier si la signature est trop longue (limite de sécurité)
      if (signatureData.length > 10000) {
        alert('Signature trop grande. Veuillez dessiner une signature plus simple.');
        return;
      }
      
      const response = await signContract(contractId, signatureData, userRole);
      console.log('Réponse du serveur:', response);
      
      alert('Signature enregistrée avec succès !');
      onSignatureComplete && onSignatureComplete();
    } catch (error) {
      console.error('Erreur lors de la signature:', error);
      console.error('Détails de l\'erreur:', error.response?.data);
      console.error('Status code:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data || 
                          error.message || 
                          'Erreur lors de l\'enregistrement de la signature';
      
      alert(`Erreur: ${errorMessage}`);
    }
  };

  return (
    <div style={{ 
      border: '2px dashed #ccc', 
      borderRadius: '8px', 
      padding: '20px', 
      textAlign: 'center',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#1976d2' }}>
        Signature électronique - {userRole}
      </h3>
      
      <canvas
        ref={canvasRef}
        width={400}
        height={150}
        style={{
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: 'white',
          cursor: 'crosshair'
        }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
      
      <div style={{ marginTop: '15px' }}>
        <button
          onClick={clearSignature}
          style={{
            marginRight: '10px',
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Effacer
        </button>
        
        <button
          onClick={saveSignature}
          disabled={!hasSignature}
          style={{
            padding: '8px 16px',
            backgroundColor: hasSignature ? '#4caf50' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: hasSignature ? 'pointer' : 'not-allowed'
          }}
        >
          Signer le contrat
        </button>
      </div>
      
      <p style={{ 
        fontSize: '12px', 
        color: '#666', 
        marginTop: '10px',
        fontStyle: 'italic'
      }}>
        Dessinez votre signature dans la zone ci-dessus
      </p>
    </div>
  );
};

export default ElectronicSignature;
