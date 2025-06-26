import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8180/',             // PAS de /realms/... ici
  realm: 'assurance_vie',                    // Le nom de ton realm
  clientId: 'react-client'                   // ID du client React
});

export default keycloak;