import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

// Vérifier le mode de fonctionnement
const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

/**
 * Route accessible aux administrateurs et aux vendeurs (lecture seule)
 * En mode offline, l'accès est autorisé
 */
const ReadOnlyRoute = () => {
  const { session, loading, isAdmin, isVendeur } = useAuth();

  // En mode offline, pas d'authentification requise
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

  // Vérifier si l'utilisateur est admin ou vendeur
  if (!isAdmin && !isVendeur) {
    return (
      <Navigate to="/admin" replace />
    );
  }

  return <Outlet />;
};

export default ReadOnlyRoute;

