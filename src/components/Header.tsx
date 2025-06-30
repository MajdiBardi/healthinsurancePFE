'use client';

export default function Header() {
  return (
    <header
      style={{
        width: '100%',
        height: 64,
        background: 'linear-gradient(90deg, #1976d2 70%, #42a5f5 100%)',
        display: 'flex',
        alignItems: 'center',
        boxShadow: '0 2px 12px #1976d220',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1100,
      }}
    >
      <div style={{
        maxWidth: 1200, // ← largeur max du contenu (ajuste selon ton besoin)
        width: '100%',
        margin: '0 auto',
        paddingLeft: 32,
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}>
        <span style={{
          color: '#fff',
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: 1.5,
          fontFamily: 'Segoe UI, Arial, sans-serif',
          textShadow: '0 2px 8px #1976d250'
        }}>
          Vermeg Life Insurance
        </span>
      </div>
    </header>
  );
}