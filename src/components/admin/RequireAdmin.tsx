import { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RequireAdminProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Composant qui affiche ses enfants uniquement si l'utilisateur est admin
 * En mode offline, affiche toujours les enfants
 */
export const RequireAdmin = ({ children, fallback }: RequireAdminProps) => {
  const { isAdmin, role } = useAuth();
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

  // En mode offline, toujours afficher (pas d'authentification)
  if (isOfflineMode) {
    return <>{children}</>;
  }

  // Si admin, afficher les enfants
  if (isAdmin) {
    return <>{children}</>;
  }

  // Sinon, afficher le fallback ou un message d'erreur
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Alert variant="destructive" className="max-w-md">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Accès refusé</AlertTitle>
      <AlertDescription>
        {role === "vendeur"
          ? "Vous êtes connecté en tant que VENDEUR. Seuls les administrateurs peuvent effectuer cette action."
          : "Vous n'avez pas les permissions nécessaires pour effectuer cette action."}
      </AlertDescription>
    </Alert>
  );
};

