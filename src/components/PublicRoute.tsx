import { useAuth } from "@/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";

// Vérifier le mode de fonctionnement
const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

/**
 * Composant pour protéger les routes publiques (catalogue)
 * Redirige vers /login si l'utilisateur n'est pas authentifié
 */
const PublicRoute = () => {
  const { session, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout de sécurité : si le loading dure plus de 5 secondes, on considère qu'il y a un problème
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 5000);

      return () => clearTimeout(timer);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);

  // En mode offline, pas d'authentification requise
  if (isOfflineMode) {
    return <Outlet />;
  }

  // En mode online, vérifier l'authentification
  if (loading && !timeoutReached) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-12 w-12 rounded-full animate-pulse" />
          </div>
          <p className="text-muted-foreground">Vérification de la session...</p>
        </div>
      </div>
    );
  }

  // Si le timeout est atteint ou pas de session, rediriger vers login
  if (timeoutReached || !session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;

