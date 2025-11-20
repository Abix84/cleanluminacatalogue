import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getCompanyTheme, getCompanyFromUrl, Company } from "@/lib/companyThemes";

export const useCompanyTheme = () => {
  const location = useLocation();
  const { brandName } = useParams<{ brandName?: string }>();

  const company: Company = useMemo(() => {
    // Vérifier d'abord le paramètre de l'URL
    if (brandName) {
      const normalized = brandName.toLowerCase().replace(/-/g, " ");
      if (normalized.includes("lumina")) {
        return "Lumina Distribution";
      }
      if (normalized.includes("clean")) {
        return "CleanExpress";
      }
    }

    // Sinon, vérifier le pathname
    return getCompanyFromUrl(location.pathname);
  }, [brandName, location.pathname]);

  const theme = useMemo(() => getCompanyTheme(company), [company]);

  return {
    company,
    theme,
    isCleanExpress: company === "CleanExpress",
    isLumina: company === "Lumina Distribution",
  };
};

