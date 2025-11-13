import { useParams, useLocation } from "react-router-dom";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";

const Footer = () => {
  const { brandName } = useParams<{ brandName?: string }>();
  const location = useLocation();
  const { company } = useCompanyTheme();

  const getDisplayName = () => {
    if (location.pathname === "/") {
      return "Lumina Distribution & CleanExpress";
    }

    if (brandName) {
      return brandName
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Fallback for other pages like /login, /admin, etc.
    return "Catalogue B2B";
  };

  const displayName = getDisplayName();

  return (
    <footer 
      className="bg-muted/40 dark:bg-slate-800/40 border-t border-border dark:border-slate-700"
      style={company ? {
        backgroundColor: `var(--company-muted)`,
        borderColor: `var(--company-border)`,
      } : {}}
    >
      <div className="container py-6 md:py-8 text-center text-sm text-muted-foreground dark:text-slate-400">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>
            &copy; {new Date().getFullYear()} {displayName}. Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="hover:text-primary dark:hover:text-company-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
              aria-label="Nous contacter"
            >
              Contact
            </a>
            <a 
              href="#" 
              className="hover:text-primary dark:hover:text-company-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2"
              aria-label="Mentions légales"
            >
              Mentions Légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
