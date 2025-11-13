import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCompanyTheme } from "@/hooks/useCompanyTheme";

/**
 * Composant pour gérer dynamiquement les meta tags SEO selon la compagnie active
 */
export const SEOHead = () => {
  const location = useLocation();
  const { company, theme } = useCompanyTheme();

  useEffect(() => {
    // Déterminer le titre et la description selon la route
    let title = "Catalogue de produits professionnels";
    let description = "Découvrez notre catalogue de produits professionnels de qualité.";

    if (company === "CleanExpress") {
      title = "CleanExpress - Catalogue de produits de nettoyage professionnels";
      description = "Découvrez le catalogue CleanExpress : produits de nettoyage professionnels de haute qualité pour tous vos besoins. Nettoyants, désinfectants, accessoires et plus encore.";
    } else if (company === "Lumina Distribution") {
      title = "Lumina Distribution - Catalogue de distribution professionnelle";
      description = "Explorez le catalogue Lumina Distribution : solutions de distribution professionnelle, produits de qualité et services adaptés à vos besoins.";
    } else if (location.pathname === "/") {
      title = "Catalogue de produits - CleanExpress & Lumina Distribution";
      description = "Choisissez votre catalogue : CleanExpress pour les produits de nettoyage professionnels ou Lumina Distribution pour vos besoins en distribution professionnelle.";
    }

    // Mettre à jour le titre de la page
    document.title = title;

    // Mettre à jour ou créer les meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute("content", content);
    };

    // Meta tags standards
    updateMetaTag("description", description);
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", "website", true);
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);

    // Ajouter l'image du logo si disponible
    if (theme?.logo) {
      const logoUrl = `${window.location.origin}${theme.logo}`;
      updateMetaTag("og:image", logoUrl, true);
      updateMetaTag("twitter:image", logoUrl);
    }

    // Meta tag pour le thème de couleur (optionnel)
    if (theme?.colors?.primary) {
      updateMetaTag("theme-color", theme.colors.primary);
    }
  }, [company, theme, location.pathname]);

  return null; // Ce composant ne rend rien visuellement
};

