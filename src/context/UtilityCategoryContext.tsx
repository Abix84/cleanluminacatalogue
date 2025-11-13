import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  UtilityCategory,
  UtilityCategoryFormData,
  UtilityCategoryContextType,
  ApiError,
} from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const UtilityCategoryContext = createContext<
  UtilityCategoryContextType | undefined
>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const UtilityCategoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [utilityCategories, setUtilityCategories] = useState<UtilityCategory[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Fetches all utility categories from localStorage
   */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("utility_categories")
        .select("*")
        .order("name");
      if (error) throw error;
      setUtilityCategories((data || []).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la récupération des catégories.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error fetching utility categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * Adds a new utility category to localStorage
   */
  const addUtilityCategory = async (
    categoryData: UtilityCategoryFormData,
  ): Promise<void> => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("utility_categories")
        .insert([categoryData])
        .select()
        .single();
      if (error) throw error;
      setUtilityCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("Catégorie ajoutée avec succès !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'ajout de la catégorie.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error adding utility category:", err);
      throw err;
    }
  };

  /**
   * Updates an existing utility category in localStorage
   */
  const updateUtilityCategory = async (
    updatedCategory: UtilityCategory,
  ): Promise<void> => {
    try {
      setError(null);
      const { data, error } = await supabase
        .from("utility_categories")
        .update(updatedCategory)
        .eq("id", updatedCategory.id)
        .select()
        .single();
      if (error) throw error;
      setUtilityCategories((prev) => prev.map((c) => (c.id === updatedCategory.id ? data : c)).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success("Catégorie mise à jour avec succès !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour de la catégorie.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error updating utility category:", err);
      throw err;
    }
  };

  /**
   * Deletes a utility category from localStorage
   */
  const deleteUtilityCategory = async (categoryId: string): Promise<void> => {
    try {
      setError(null);
      const { error } = await supabase
        .from("utility_categories")
        .delete()
        .eq("id", categoryId);
      if (error) throw error;
      setUtilityCategories((prev) => prev.filter((c) => c.id !== categoryId));
      toast.success("Catégorie supprimée avec succès !");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de la suppression de la catégorie.";
      const apiError: ApiError = { message, details: err };
      setError(apiError);
      toast.error(message);
      console.error("Error deleting utility category:", err);
      throw err;
    }
  };

  /**
   * Gets a utility category by its ID
   */
  const getUtilityCategoryById = (
    categoryId: string,
  ): UtilityCategory | undefined => {
    return utilityCategories.find((c) => c.id === categoryId);
  };

  const value: UtilityCategoryContextType = {
    utilityCategories,
    addUtilityCategory,
    updateUtilityCategory,
    deleteUtilityCategory,
    getUtilityCategoryById,
    loading,
    error,
  };

  return (
    <UtilityCategoryContext.Provider value={value}>
      {children}
    </UtilityCategoryContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

/**
 * Hook to use the UtilityCategoryContext
 * @throws {Error} if used outside of UtilityCategoryProvider
 */
export const useUtilityCategories = (): UtilityCategoryContextType => {
  const context = useContext(UtilityCategoryContext);

  if (context === undefined) {
    throw new Error(
      "useUtilityCategories must be used within a UtilityCategoryProvider",
    );
  }

  return context;
};
