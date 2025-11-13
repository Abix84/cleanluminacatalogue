// Client Supabase - Optionnel selon le mode (offline/online)

import { createClient } from "@supabase/supabase-js";

// Vérifier le mode de fonctionnement
const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

// Variables Supabase (uniquement en mode online)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// ==========================================
// MODE OFFLINE - Mock Client
// ==========================================

const createMockClient = () => {
  const mockError = () => {
    throw new Error(
      "Supabase n'est pas disponible en mode offline. Utilisez localStorage à la place.",
    );
  };

  return {
    from: () => ({
      select: mockError,
      insert: mockError,
      update: mockError,
      delete: mockError,
    }),
    storage: {
      from: () => ({
        upload: mockError,
        getPublicUrl: mockError,
        remove: mockError,
        list: mockError,
      }),
      listBuckets: mockError,
    },
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
      signInWithPassword: mockError,
      signOut: mockError,
    },
    functions: {
      invoke: mockError,
    },
  };
};

// ==========================================
// CRÉATION DU CLIENT
// ==========================================

let supabase: any;

if (isOfflineMode) {
  // Mode Offline - Client mock
  console.warn(
    "⚠️ Mode OFFLINE : Supabase désactivé - Utilisation de localStorage",
  );
  supabase = createMockClient();
} else {
  // Mode Online - Client Supabase réel
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    console.error(
      "❌ Variables d'environnement Supabase manquantes. Vérifiez votre fichier .env",
    );
    throw new Error(
      "Missing Supabase environment variables. Please check your .env file.",
    );
  }

  console.log("✅ Mode ONLINE : Connexion à Supabase");
  supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

// ==========================================
// EXPORT
// ==========================================

// Export du client (réel ou mock selon le mode)
export { supabase };

// Export des infos de mode
export const IS_OFFLINE_MODE = isOfflineMode;
export const IS_ONLINE_MODE = !isOfflineMode;
export const APP_MODE = isOfflineMode ? "offline" : "online";
