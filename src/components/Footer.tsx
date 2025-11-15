import { useParams, useLocation, Link } from "react-router-dom";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";
import { useContact } from "@/context/ContactContext";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

const Footer = () => {
  const { brandName } = useParams<{ brandName?: string }>();
  const location = useLocation();
  const { company } = useCompanyTheme();
  const { contactInfo } = useContact();

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
      <div className="container py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        {contactInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-border dark:border-slate-700">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm mb-2 sm:mb-3">Contact</h3>
              {contactInfo.email && (
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary dark:hover:text-company-primary transition-colors break-all"
                >
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="break-all">{contactInfo.email}</span>
                </a>
              )}
              {contactInfo.phone && (
                <a
                  href={`tel:${contactInfo.phone}`}
                  className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary dark:hover:text-company-primary transition-colors"
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  {contactInfo.phone}
                </a>
              )}
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-sm mb-2 sm:mb-3">Adresse</h3>
              <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="break-words">{contactInfo.address}</p>
                  <p className="break-words">
                    {contactInfo.postalCode} {contactInfo.city}
                  </p>
                  <p>{contactInfo.country}</p>
                </div>
              </div>
            </div>
            {contactInfo.website && (
              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <h3 className="font-semibold text-sm mb-2 sm:mb-3">Site Web</h3>
                <a
                  href={contactInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground hover:text-primary dark:hover:text-company-primary transition-colors break-all"
                >
                  <Globe className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="break-all">{contactInfo.website.replace(/^https?:\/\//, "")}</span>
                </a>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 text-center text-xs sm:text-sm text-muted-foreground dark:text-slate-400">
          <p className="break-words">
            &copy; {new Date().getFullYear()} {displayName}. Tous droits
            réservés.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <Link 
              to="/contact"
              className="hover:text-primary dark:hover:text-company-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
              aria-label="Nous contacter"
            >
              Contact
            </Link>
            <a 
              href="#" 
              className="hover:text-primary dark:hover:text-company-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary rounded px-2 py-1"
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
