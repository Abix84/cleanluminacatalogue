import { Outlet } from "react-router-dom";

/**
 * Composant pour les routes publiques (catalogue, produits, contact, etc.)
 * Permet l'accès sans authentification
 * Les prix seront masqués pour les utilisateurs non-administrateurs
 */
const PublicRoute = () => {
  // Permettre l'accès à tous, authentifiés ou non
  return <Outlet />;
};

export default PublicRoute;
