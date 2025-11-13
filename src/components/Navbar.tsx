import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";
import { useTheme } from "@/components/ThemeProvider";
import { useCompanyThemeCSS } from "@/hooks/useCompanyThemeCSS";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, LogOut } from "lucide-react";
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
  const { session, user } = useAuth();
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
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-slate-900/95 dark:border-slate-700"
      style={company && !isHomePage ? {
        borderColor: `var(--company-border)`,
        backgroundColor: isDark 
          ? `var(--company-background)` 
          : `var(--company-background)`,
      } : {}}
    >
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          {!isHomePage && (
            <Link to="/">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-lg hover:bg-muted dark:hover:bg-slate-800 transition-colors"
                aria-label="Retour à la sélection de catalogue"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Retour à la sélection de catalogue</span>
              </Button>
            </Link>
          )}
          {isHomePage && (
            <div className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground hidden sm:inline">
                Sélection de catalogue
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <ThemeToggle />
          {session && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="sr-only">Menu utilisateur</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 cursor-pointer">
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
