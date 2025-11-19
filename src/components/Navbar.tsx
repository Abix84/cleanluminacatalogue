import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";
import { useTheme } from "@/components/ThemeProvider";
import { useCompanyThemeCSS } from "@/hooks/useCompanyThemeCSS";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, LogOut, LayoutDashboard, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { company } = useCompanyTheme();
  const { theme: colorTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { session, user, isAdmin } = useAuth();
  const [isDark, setIsDark] = useState(false);

  // Appliquer les variables CSS du thème
  useCompanyThemeCSS();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erreur lors de la déconnexion.");
    } else {
      toast.success("Vous avez été déconnecté.");
      navigate("/login");
    }
  };

  useEffect(() => {
    // Vérifier que window est disponible (SSR safety)
    if (typeof window === "undefined") return;

    const checkDarkMode = () => {
      if (colorTheme === "dark") {
        setIsDark(true);
      } else if (colorTheme === "light") {
        setIsDark(false);
      } else {
        // System theme
        setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
      }
    };

    checkDarkMode();

    // Écouter les changements de préférence système
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (colorTheme === "system") {
        setIsDark(mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    // Écouter les changements de classe sur le document
    const observer = new MutationObserver(() => {
      checkDarkMode();
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      observer.disconnect();
    };
  }, [colorTheme]);

  // Déterminer si on est sur la page d'accueil
  const isHomePage = location.pathname === "/";

  return (
    <header
      className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 dark:bg-slate-900/80 dark:border-slate-700/50 transition-all duration-300"
      style={company && !isHomePage ? {
        borderColor: `var(--company-border)`,
        backgroundColor: isDark
          ? `var(--company-background)`
          : `var(--company-background)`,
      } : {}}
    >
      <div className="container flex h-14 sm:h-16 items-center gap-2 sm:gap-4 px-2 sm:px-4">
        <div className="mr-2 sm:mr-4 flex items-center min-w-0">
          {!isHomePage && (
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-muted dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                aria-label="Retour à la sélection de catalogue"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="sr-only">Retour à la sélection de catalogue</span>
              </Button>
            </Link>
          )}
          {isHomePage && (
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              <Home className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate hidden xs:inline">
                Sélection de catalogue
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2 md:gap-4 min-w-0">
          <ThemeToggle />
          {session && (
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="relative h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
              aria-label="Mes favoris"
            >
              <Link to="/favorites">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          )}
          {session && isAdmin && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="hidden md:flex flex-shrink-0"
            >
              <Link to="/admin">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                <span className="hidden lg:inline">Tableau de bord</span>
              </Link>
            </Button>
          )}
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex-shrink-0">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs sm:text-sm">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="sr-only">Menu utilisateur</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-auto min-w-[180px] sm:min-w-[200px] max-w-[90vw]">
                <div className="px-2 py-1.5">
                  <p className="text-xs sm:text-sm font-medium break-words truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/favorites" className="cursor-pointer text-sm">
                    <Heart className="mr-2 h-4 w-4" />
                    Mes Favoris
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer text-sm">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Tableau de bord
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer text-sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
