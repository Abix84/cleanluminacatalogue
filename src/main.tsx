import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initializeStorage } from "./lib/localStorage";

// Clés de stockage à vérifier (doivent correspondre à celles dans localStorage.ts)
const REQUIRED_KEYS = [
  'cleanexpress_products',
  'cleanexpress_categories',
  'cleanexpress_brands'
];

// Vérifie si toutes les données requises sont présentes
const checkData = (): boolean => {
  return REQUIRED_KEYS.every(key => {
    const item = localStorage.getItem(key);
    return item && item !== '[]' && item !== 'null';
  });
};

// Fonction asynchrone pour initialiser et démarrer l'app
async function initializeAndStartApp() {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  console.log("📦 Démarrage de l'initialisation...");

  try {
    // Tentative d'initialisation avec retries
    let attempts = 0;
    const MAX_ATTEMPTS = 3;

    while (attempts < MAX_ATTEMPTS) {
      // 1. Initialiser
      initializeStorage();

      // 2. Attendre un peu pour laisser le temps au stockage (par sécurité)
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. Vérifier
      if (checkData()) {
        console.log("✅ Données vérifiées et présentes");
        break;
      }

      console.warn(`⚠️ Tentative ${attempts + 1}/${MAX_ATTEMPTS}: Données manquantes ou incomplètes, nouvel essai...`);

      // Si c'est la dernière tentative, on force un nettoyage avant de réessayer
      if (attempts === MAX_ATTEMPTS - 2) {
        console.log("🧹 Nettoyage du localStorage avant dernière tentative");
        localStorage.clear();
      }

      attempts++;
    }

    // Vérification finale
    if (!checkData()) {
      throw new Error("Impossible d'initialiser les données locales après plusieurs tentatives.");
    }

    console.log("🚀 Démarrage de l'application React");
    createRoot(rootElement).render(<App />);
    console.log("✅ Application React rendue avec succès");

  } catch (error) {
    console.error("❌ Erreur critique lors du démarrage:", error);

    // Affichage d'une erreur bloquante mais utile
    rootElement.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 20px;
        background-color: #f9fafb;
      ">
        <div style="max-width: 500px; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <h1 style="color: #ef4444; margin-bottom: 16px;">Erreur d'initialisation</h1>
          <p style="color: #374151; margin-bottom: 24px;">
            L'application n'a pas pu initialiser sa base de données locale. 
            Cela peut arriver si votre navigateur bloque le stockage local ou si l'espace est saturé.
          </p>
          <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; text-align: left; margin-bottom: 24px; overflow: auto; max-height: 150px; font-size: 0.875rem; color: #4b5563;">
            ${error instanceof Error ? error.message : String(error)}
          </div>
          <button onclick="localStorage.clear(); window.location.reload()" style="
            background-color: #2563eb; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 6px; 
            font-weight: 600; 
            cursor: pointer; 
            transition: background-color 0.2s;
          ">
            Réinitialiser et Réessayer
          </button>
        </div>
      </div>
    `;
  }
}

// Démarrer l'application
initializeAndStartApp();
