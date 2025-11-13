// Index file to export all contexts
// Utilisation des contextes unifiés (support offline/online)

// ==========================================
// PRODUCT CONTEXT (Unified - offline/online)
// ==========================================
export { ProductProvider, useProducts, PRODUCT_MODE } from "./ProductContextUnified";

// ==========================================
// BRAND CONTEXT (Unified - offline/online)
// ==========================================
export { BrandProvider, useBrands, BRAND_MODE } from "./BrandContextUnified";

// ==========================================
// UTILITY CATEGORY CONTEXT (Unified - offline/online)
// ==========================================
export {
  UtilityCategoryProvider,
  useUtilityCategories,
  CATEGORY_MODE,
} from "./UtilityCategoryContextUnified";

// ==========================================
// AUTH CONTEXT
// ==========================================
export { AuthProvider, useAuth } from "./AuthContext";

// ==========================================
// MODE INFO
// ==========================================
const isOfflineMode = import.meta.env.VITE_OFFLINE_MODE === "true";

export const APP_MODE = isOfflineMode ? "offline" : "online";
export const IS_OFFLINE_MODE = isOfflineMode;
export const IS_ONLINE_MODE = !isOfflineMode;

if (IS_OFFLINE_MODE) {
  console.log("📦 Mode OFFLINE - Utilisation du localStorage");
} else {
  console.log("📦 Mode ONLINE - Utilisation de Supabase");
}
