import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { initializeStorage } from "./lib/localStorage";

// Initialiser le stockage local avec les données de démonstration
console.log(
  "📦 Initialisation du localStorage avec les données de démonstration",
);

try {
  initializeStorage();
  console.log("✅ localStorage initialisé");
} catch (error) {
  console.error("❌ Erreur lors de l'initialisation du localStorage:", error);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  console.log("🚀 Démarrage de l'application React");
  createRoot(rootElement).render(<App />);
  console.log("✅ Application React rendue avec succès");
} catch (error) {
  console.error("❌ Erreur lors du rendu de l'application:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1 style="color: red;">Erreur de chargement</h1>
      <p>Une erreur s'est produite lors du chargement de l'application.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto;">
${error instanceof Error ? error.stack : String(error)}
      </pre>
      <button onclick="window.location.reload()" style="margin-top: 10px; padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Recharger la page
      </button>
    </div>
  `;
}
