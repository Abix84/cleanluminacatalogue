import { Product } from "@/types";
import { supabase } from "@/integrations/supabase/client";

const isOfflineMode = false;
const STORAGE_KEY = "cleanexpress_favorites";

// ==========================================
// OFFLINE FUNCTIONS (localStorage)
// ==========================================

const getOfflineFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const setOfflineFavorites = (favorites: string[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
};

// ==========================================
// ONLINE FUNCTIONS (Supabase)
// ==========================================

/**
 * Récupère les favoris d'un utilisateur depuis Supabase
 */
const getOnlineFavorites = async (userId: string): Promise<string[]> => {
  const { data, error } = await supabase
    .from("user_favorites")
    .select("product_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }

  return data?.map((item) => item.product_id) || [];
};

/**
 * Ajoute un produit aux favoris
 */
const addOnlineFavorite = async (
  userId: string,
  productId: string
): Promise<void> => {
  const { error } = await supabase.from("user_favorites").insert({
    user_id: userId,
    product_id: productId,
  });

  if (error && error.code !== "23505") {
    // 23505 = duplicate key (déjà en favoris)
    throw error;
  }
};

/**
 * Supprime un produit des favoris
 */
const removeOnlineFavorite = async (
  userId: string,
  productId: string
): Promise<void> => {
  const { error } = await supabase
    .from("user_favorites")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);

  if (error) throw error;
};

// ==========================================
// HOOK FUNCTIONS
// ==========================================

/**
 * Récupère tous les favoris (offline ou online)
 */
export const getFavorites = async (userId?: string): Promise<string[]> => {
  if (isOfflineMode) {
    return getOfflineFavorites();
  } else {
    if (!userId) return [];
    return await getOnlineFavorites(userId);
  }
};

/**
 * Vérifie si un produit est en favoris
 */
export const isFavorite = async (
  productId: string,
  userId?: string
): Promise<boolean> => {
  const favorites = await getFavorites(userId);
  return favorites.includes(productId);
};

/**
 * Ajoute un produit aux favoris
 */
export const addFavorite = async (
  productId: string,
  userId?: string
): Promise<void> => {
  if (isOfflineMode) {
    const favorites = getOfflineFavorites();
    if (!favorites.includes(productId)) {
      setOfflineFavorites([...favorites, productId]);
    }
  } else {
    if (!userId) throw new Error("User ID required in online mode");
    await addOnlineFavorite(userId, productId);
  }
};

/**
 * Supprime un produit des favoris
 */
export const removeFavorite = async (
  productId: string,
  userId?: string
): Promise<void> => {
  if (isOfflineMode) {
    const favorites = getOfflineFavorites();
    setOfflineFavorites(favorites.filter((id) => id !== productId));
  } else {
    if (!userId) throw new Error("User ID required in online mode");
    await removeOnlineFavorite(userId, productId);
  }
};

/**
 * Toggle un produit dans les favoris
 */
export const toggleFavorite = async (
  productId: string,
  userId?: string
): Promise<boolean> => {
  const isFav = await isFavorite(productId, userId);
  if (isFav) {
    await removeFavorite(productId, userId);
    return false;
  } else {
    await addFavorite(productId, userId);
    return true;
  }
};

/**
 * Récupère les produits favoris depuis une liste de produits
 */
export const getFavoriteProducts = (
  allProducts: Product[],
  favoriteIds: string[]
): Product[] => {
  return allProducts.filter((product) => favoriteIds.includes(product.id));
};

