import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Vérifier le mode de fonctionnement
const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

/**
 * Route protégée pour les administrateurs uniquement
 * En mode offline, l'accès est autorisé (pas d'authentification)
 */
const AdminRoute = () => {
  const { session, loading, isAdmin, role } = useAuth();

  // En mode offline, pas d'authentification requise (accès admin complet)
  if (isOfflineMode) {
    return <Outlet />;
  }

  // En mode online, vérifier l'authentification et le rôle
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <p className="text-muted-foreground">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Si l'utilisateur n'a pas de rôle ou n'est pas admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen bg-background p-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            {role === "vendeur" 
              ? "Vous êtes connecté en tant que VENDEUR. Seuls les administrateurs peuvent accéder à cette page."
              : "Vous n'avez pas les permissions nécessaires pour accéder à cette page. Veuillez contacter un administrateur."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminRoute;

