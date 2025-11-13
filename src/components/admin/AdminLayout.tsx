import { Link, NavLink, useNavigate } from "react-router-dom";
import { Home, ShoppingCart, LogOut, Settings, Users, Shield, Eye } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { RequireAdmin } from "./RequireAdmin";
import { toast } from "sonner";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const { user, role, profile, isAdmin, isVendeur, isVisiteur } = useAuth();
  const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion.");
    } else {
      toast.success("Vous avez été déconnecté.");
      navigate("/login");
    }
  };

  // Afficher le badge de rôle
  const getRoleBadge = () => {
    if (isOfflineMode) {
      return <Badge variant="secondary">Mode Offline</Badge>;
    }
    if (isAdmin) {
      return (
        <Badge variant="default" className="bg-blue-600">
          <Shield className="h-3 w-3 mr-1" />
          ADMIN
        </Badge>
      );
    }
    if (isVendeur) {
      return (
        <Badge variant="secondary" className="bg-green-600">
          <Eye className="h-3 w-3 mr-1" />
          VENDEUR
        </Badge>
      );
    }
    if (isVisiteur) {
      return (
        <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
          VISITEUR
        </Badge>
      );
    }
    return <Badge variant="outline">Aucun rôle</Badge>;
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-16 items-center border-b px-4 lg:px-6">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img
                src="/logo.png"
                alt="CleanExpress Logo"
                className="h-8 w-auto block dark:hidden"
              />
              <img
                src="/logo_darkmode.png"
                alt="CleanExpress Logo"
                className="h-8 w-auto hidden dark:block"
              />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <NavLink
                to="/admin"
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    isActive ? "bg-muted text-primary" : "text-muted-foreground"
                  }`
                }
              >
                <Home className="h-4 w-4" />
                Tableau de bord
              </NavLink>
              
              {/* Gestion - Admin uniquement */}
              <RequireAdmin
                fallback={null}
              >
                <NavLink
                  to="/admin/management"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  <Settings className="h-4 w-4" />
                  Gestion
                </NavLink>
              </RequireAdmin>

              {/* Gestion des utilisateurs - Admin uniquement */}
              <RequireAdmin
                fallback={null}
              >
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive ? "bg-muted text-primary" : "text-muted-foreground"
                    }`
                  }
                >
                  <Users className="h-4 w-4" />
                  Utilisateurs
                </NavLink>
              </RequireAdmin>

              <NavLink
                to="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ShoppingCart className="h-4 w-4" />
                Voir le site
              </NavLink>
            </nav>
          </div>
          
          {/* Informations utilisateur */}
          <div className="border-t p-4 space-y-2">
            {user && (
              <>
                <div className="text-xs text-muted-foreground">Connecté en tant que</div>
                <div className="text-sm font-medium truncate">{user.email}</div>
                <div className="flex items-center gap-2">
                  {getRoleBadge()}
                  {profile?.full_name && (
                    <Badge variant="outline" className="text-xs">
                      {profile.full_name}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <div className="w-full flex-1">
            {/* On peut ajouter une recherche ici plus tard */}
          </div>
          <ThemeToggle />
          <Button variant="outline" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Déconnexion</span>
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
