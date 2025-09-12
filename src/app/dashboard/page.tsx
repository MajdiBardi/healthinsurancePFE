import React from "react";
import RouteGuard from "../../components/RouteGuard";

const Dashboard: React.FC = () => {
  return (
    <RouteGuard allowedRoles={['ADMIN', 'INSURER']}>
      <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
        <iframe 
          title="Vision analytics Free Sales Dashboard Template" 
          width="100%" 
          height="100%" 
          src="https://app.powerbi.com/reportEmbed?reportId=80958b73-f1ca-4d77-a130-eae24bf19eaf&autoAuth=true&ctid=604f1a96-cbe8-43f8-abbf-f8eaf5d85730" 
          frameBorder="0" 
          allowFullScreen
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
        />
        {/* Masquer la barre de navigation du bas */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '60px',
          backgroundColor: 'white',
          zIndex: 1000
        }} />
        {/* Masquer le panneau de filtres à droite */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '150px',
          height: '100%',
          backgroundColor: 'white',
          zIndex: 1000
        }} />
      </div>
    </RouteGuard>
  );
};

export default Dashboard;
