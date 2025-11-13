// Configuration des thèmes par entreprise

export type Company = "CleanExpress" | "Lumina Distribution" | null;

export interface CompanyTheme {
  name: string;
  logo: string;
  logoDark?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    success: string;
    warning: string;
    info: string;
    // Couleurs spécifiques de la palette
    palette: {
      black?: string;
      orange?: string;
      yellow?: string;
      pink?: string;
      golden?: string;
      oceanBlue?: string;
      skyBlue?: string;
      sand?: string;
      white: string;
      blue?: string;
      rose?: string;
      red?: string;
      green?: string;
      lightBlue?: string;
      gray?: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
      };
    };
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
    card: string;
    hero: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const cleanExpressTheme: CompanyTheme = {
  name: "CleanExpress",
  logo: "/logos/cleanexpress-logo.png",
  logoDark: "/logos/cleanexpress-logo-dark.png",
  colors: {
    primary: "#0A66DD", // Ocean Blue - Couleur principale forte et professionnelle
    secondary: "#FFCA00", // Sunny Yellow - Énergique et visible
    accent: "#5BA8FF", // Sky Blue ajusté - Plus saturé et professionnel
    background: "#FFFFFF", // Blanc pur pour un look moderne
    foreground: "#0F172A", // Slate 900 - Meilleur contraste
    muted: "#F1F5F9", // Slate 100 - Gris subtil
    mutedForeground: "#64748B", // Slate 500 - Pour texte secondaire
    border: "#E2E8F0", // Slate 200 - Bordures douces
    input: "#F8FAFC", // Slate 50 - Pour les champs de formulaire
    ring: "#0A66DD", // Même que primary pour cohérence
    destructive: "#EF4444", // Red 500 - Plus standard
    success: "#10B981", // Emerald 500 - Pour succès
    warning: "#F59E0B", // Amber 500 - Pour avertissements
    info: "#3B82F6", // Blue 500 - Pour informations
    palette: {
      black: "#0F172A", // Slate 900 au lieu du noir pur
      orange: "#FF3300",
      yellow: "#FFCA00",
      pink: "#FFCCFF",
      golden: "#826E50",
      oceanBlue: "#0A66DD",
      skyBlue: "#5BA8FF",
      sand: "#F8F8F2",
      white: "#FFFFFF",
      gray: {
        50: "#F8FAFC",
        100: "#F1F5F9",
        200: "#E2E8F0",
        300: "#CBD5E1",
        400: "#94A3B8",
        500: "#64748B",
        600: "#475569",
        700: "#334155",
        800: "#1E293B",
        900: "#0F172A",
      },
    },
  },
  gradients: {
    primary: "from-[#0A66DD] via-[#2E7FE8] to-[#5BA8FF]",
    secondary: "from-[#FFCA00] via-[#FFB800] to-[#FF9500]",
    accent: "from-[#5BA8FF] to-[#A5D8FF]",
    card: "from-white via-[#FAFBFC] to-[#F1F5F9]",
    hero: "from-[#0A66DD]/10 via-transparent to-[#FFCA00]/5",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(10, 102, 221, 0.05)",
    md: "0 4px 6px -1px rgba(10, 102, 221, 0.1), 0 2px 4px -1px rgba(10, 102, 221, 0.06)",
    lg: "0 10px 15px -3px rgba(10, 102, 221, 0.1), 0 4px 6px -2px rgba(10, 102, 221, 0.05)",
    xl: "0 20px 25px -5px rgba(10, 102, 221, 0.1), 0 10px 10px -5px rgba(10, 102, 221, 0.04)",
  },
  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem", // 8px
    lg: "0.75rem", // 12px
    xl: "1rem", // 16px
  },
};

export const luminaTheme: CompanyTheme = {
  name: "Lumina Distribution",
  logo: "/logos/lumina-logo.png",
  logoDark: "/logos/lumina-logo-dark.png",
  colors: {
    primary: "#2300C8", // Bleu vibrant - Forte identité
    secondary: "#FFC200", // Jaune doré - Élégant
    accent: "#51BFFF", // Bleu clair - Moderne
    background: "#FFFFFF", // Blanc pur
    foreground: "#1A1A2E", // Bleu très foncé au lieu du noir
    muted: "#F5F7FA", // Gris-bleu subtil
    mutedForeground: "#6B7280", // Gray 500
    border: "#E5E7EB", // Gray 200
    input: "#F9FAFB", // Gray 50
    ring: "#2300C8", // Même que primary
    destructive: "#FC5C47", // Rouge signature
    success: "#00BD9E", // Vert signature
    warning: "#FFC200", // Jaune signature
    info: "#51BFFF", // Bleu clair signature
    palette: {
      blue: "#2300C8",
      white: "#FFFFFF",
      yellow: "#FFC200",
      rose: "#EC9ABF",
      red: "#FC5C47",
      green: "#00BD9E",
      lightBlue: "#51BFFF",
      gray: {
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
      },
    },
  },
  gradients: {
    primary: "from-[#2300C8] via-[#3D1FDB] to-[#5B3FFF]",
    secondary: "from-[#FFC200] via-[#FFD740] to-[#FFEB3B]",
    accent: "from-[#51BFFF] to-[#A5E3FF]",
    card: "from-white via-[#FAFBFC] to-[#F5F7FA]",
    hero: "from-[#2300C8]/10 via-transparent to-[#51BFFF]/5",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(35, 0, 200, 0.05)",
    md: "0 4px 6px -1px rgba(35, 0, 200, 0.1), 0 2px 4px -1px rgba(35, 0, 200, 0.06)",
    lg: "0 10px 15px -3px rgba(35, 0, 200, 0.1), 0 4px 6px -2px rgba(35, 0, 200, 0.05)",
    xl: "0 20px 25px -5px rgba(35, 0, 200, 0.1), 0 10px 10px -5px rgba(35, 0, 200, 0.04)",
  },
  borderRadius: {
    sm: "0.25rem", // 4px - Plus anguleux pour un look corporate
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
  },
};

export const getCompanyTheme = (company: Company): CompanyTheme => {
  switch (company) {
    case "CleanExpress":
      return cleanExpressTheme;
    case "Lumina Distribution":
      return luminaTheme;
    default:
      return cleanExpressTheme; // Par défaut
  }
};

export const getCompanyFromUrl = (pathname: string): Company => {
  if (pathname.includes("lumina")) {
    return "Lumina Distribution";
  }
  if (pathname.includes("clean")) {
    return "CleanExpress";
  }
  return null;
};

// Helper pour générer des variantes de couleurs
export const generateColorVariants = (baseColor: string) => ({
  50: `${baseColor}0D`, // 5% opacity
  100: `${baseColor}1A`, // 10% opacity
  200: `${baseColor}33`, // 20% opacity
  300: `${baseColor}4D`, // 30% opacity
  400: `${baseColor}80`, // 50% opacity
  500: baseColor, // 100% opacity
  600: baseColor, // Base (peut être assombri avec filter)
  700: baseColor,
  800: baseColor,
  900: baseColor,
});

// Helper pour les modes sombres (optionnel)
export const getDarkModeColors = (theme: CompanyTheme) => ({
  ...theme.colors,
  background: theme.colors.palette.gray?.[900] || "#0F172A",
  foreground: theme.colors.palette.white,
  muted: theme.colors.palette.gray?.[800] || "#1E293B",
  mutedForeground: theme.colors.palette.gray?.[400] || "#94A3B8",
  border: theme.colors.palette.gray?.[700] || "#334155",
});