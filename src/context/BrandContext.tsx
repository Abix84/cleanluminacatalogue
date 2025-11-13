import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Brand, BrandFormData, BrandContextType, ApiError } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BrandContext = createContext<BrandContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Fetches all brands from Supabase
   */
  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("brands")
        .select("*")
        .order("name");
      if (error) throw error;
      setBrands((data || []).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des marques.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error fetching brands:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  /**
   * Adds a new brand to Supabase
   */
  const addBrand = async (brandData: BrandFormData): Promise<void> => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("brands")
        .insert([brandData])
        .select()
        .single();
      if (error) throw error;
      setBrands((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("Marque ajoutée avec succès !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'ajout de la marque.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error adding brand:", err);
      throw err;
    }
  };

  /**
   * Updates an existing brand in Supabase
   */
  const updateBrand = async (updatedBrand: Brand): Promise<void> => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("brands")
        .update(updatedBrand)
        .eq("id", updatedBrand.id)
        .select()
        .single();
      if (error) throw error;
      setBrands((prev) => prev.map((b) => (b.id === updatedBrand.id ? data : b)).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("Marque mise à jour avec succès !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la marque.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error updating brand:", err);
      throw err;
    }
  };

  /**
   * Deletes a brand from Supabase
   */
  const deleteBrand = async (brandId: string): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase
        .from("brands")
        .delete()
        .eq("id", brandId);
      if (error) throw error;
      setBrands((prev) => prev.filter((b) => b.id !== brandId));
      toast.success("Marque supprimée avec succès !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la marque.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error deleting brand:", err);
      throw err;
    }
  };

  /**
   * Gets a brand by its ID
   */
  const getBrandById = (brandId: string): Brand | undefined => {
    return brands.find((b) => b.id === brandId);
  };

  const value: BrandContextType = {
    brands,
    addBrand,
    updateBrand,
    deleteBrand,
    getBrandById,
    loading,
    error,
  };

  return (
    <BrandContext.Provider value={value}>{children}</BrandContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

/**
 * Hook to use the BrandContext
 * @throws {Error} if used outside of BrandProvider
 */
export const useBrands = (): BrandContextType => {
  const context = useContext(BrandContext);

  if (context === undefined) {
    throw new Error("useBrands must be used within a BrandProvider");
  }

  return context;
};
