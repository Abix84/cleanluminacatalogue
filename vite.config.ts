import { defineConfig } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
  },
  preview: {
    host: "::",
    port: 4173,
    cors: true,
  },
  plugins: [dyadComponentTagger(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer React et React DOM
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          // Séparer Supabase
          "supabase": ["@supabase/supabase-js", "@supabase/auth-ui-react"],
          // Séparer les composants UI lourds (Radix UI)
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-toast",
            "@radix-ui/react-tabs",
            "@radix-ui/react-accordion",
          ],
          // Séparer les bibliothèques de formulaires et validation
          "form-vendor": [
            "react-hook-form",
            "@hookform/resolvers",
            "zod",
          ],
          // Séparer les graphiques (Recharts)
          "charts": ["recharts"],
          // Séparer les utilitaires
          "utils": ["date-fns", "uuid", "clsx", "tailwind-merge"],
        },
      },
    },
    // Augmenter la limite d'avertissement à 600 kB (optionnel)
    chunkSizeWarningLimit: 600,
  },
}));
