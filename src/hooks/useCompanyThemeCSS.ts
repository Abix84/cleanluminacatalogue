import { useEffect } from "react";
import { useCompanyTheme } from "./useCompanyTheme";
import { useTheme } from "@/components/ThemeProvider";

/**
 * Hook pour appliquer dynamiquement les variables CSS du thème de la compagnie
 * Remplace les couleurs inline par des variables CSS pour une meilleure cohérence
 */
export const useCompanyThemeCSS = () => {
  const { theme, company } = useCompanyTheme();
  const { theme: colorTheme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    
    // Déterminer si on est en mode dark
    const checkDarkMode = () => {
      if (colorTheme === "dark") return true;
      if (colorTheme === "light") return false;
      // System theme
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    };

    const isDark = checkDarkMode();

    if (!company) {
      // Réinitialiser aux valeurs par défaut si aucune compagnie n'est sélectionnée
      root.style.removeProperty("--company-primary");
      root.style.removeProperty("--company-secondary");
      root.style.setProperty("--company-accent", "var(--accent)");
      root.style.setProperty("--company-background", "var(--background)");
      root.style.setProperty("--company-foreground", "var(--foreground)");
      root.style.setProperty("--company-border", "var(--border)");
      root.style.setProperty("--company-muted", "var(--muted)");
      root.style.setProperty("--company-muted-foreground", "var(--muted-foreground)");
      return;
    }

    // Appliquer les couleurs du thème de la compagnie
    if (isDark) {
      // Mode dark : utiliser des variantes plus claires et adaptées
      const darkColors = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        background: theme.colors.palette.gray?.[900] || "#0F172A",
        foreground: theme.colors.palette.white,
        border: theme.colors.palette.gray?.[700] || "#334155",
        muted: theme.colors.palette.gray?.[800] || "#1E293B",
        "muted-foreground": theme.colors.palette.gray?.[400] || "#94A3B8",
      };

      Object.entries(darkColors).forEach(([key, value]) => {
        root.style.setProperty(`--company-${key}`, value);
      });
    } else {
      // Mode light : utiliser les couleurs standard
      root.style.setProperty("--company-primary", theme.colors.primary);
      root.style.setProperty("--company-secondary", theme.colors.secondary);
      root.style.setProperty("--company-accent", theme.colors.accent);
      root.style.setProperty("--company-background", theme.colors.background);
      root.style.setProperty("--company-foreground", theme.colors.foreground);
      root.style.setProperty("--company-border", theme.colors.border);
      root.style.setProperty("--company-muted", theme.colors.muted);
      root.style.setProperty("--company-muted-foreground", theme.colors.mutedForeground);
    }

  }, [theme, company, colorTheme]);
};

