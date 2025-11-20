import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  const errorMsg = `❌ Variables d'environnement Supabase manquantes.
URL: ${SUPABASE_URL ? "✅" : "❌ undefined"}
Key: ${SUPABASE_PUBLISHABLE_KEY ? "✅" : "❌ undefined"}
Vérifiez votre fichier .env.production ou .env.production.local`;
  console.error(errorMsg);
  throw new Error(
    "Missing Supabase environment variables. Please check your .env file.",
  );
}

console.log("✅ Mode ONLINE : Connexion à Supabase", SUPABASE_URL);
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-client-info": "cleanexpress-web",
    },
  },
});
