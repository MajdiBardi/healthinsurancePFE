'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import keycloak from '../keycloak';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRoles, setUserRoles] = useState([]);

  useEffect(() => {
    keycloak
      .init({ onLoad: 'login-required' })
      .then(authenticated => {
        setAuthenticated(authenticated);
        if (authenticated) {
          const roles = keycloak.tokenParsed?.realm_access?.roles || [];
          setUserRoles(roles);
        }
      })
      .catch(err => {
        console.error('Erreur d’authentification Keycloak :', err);
        setAuthenticated(false);
      });
  }, []);

  const logout = () => {
    keycloak.logout({ redirectUri: window.location.origin });
  };

  return (
    <AuthContext.Provider value={{ authenticated, keycloak, logout, userRoles }}>
      {authenticated ? children : <div>Authentification en cours...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
