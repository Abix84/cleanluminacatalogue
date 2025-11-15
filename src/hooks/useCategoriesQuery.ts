import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";
import {
  UtilityCategory,
  UtilityCategoryFormData,
} from "@/types";
import { toast } from "sonner";
import { localStorageCategories } from "@/lib/localStorage";

const isOfflineMode = IS_OFFLINE_MODE;

// ==========================================
// QUERY KEYS
// ==========================================

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: string) => [...categoryKeys.details(), id] as const,
};

// ==========================================
// TRANSFORM FUNCTIONS
// ==========================================

const transformCategory = (item: any): UtilityCategory => ({
  id: item.id,
  name: item.name,
  color: item.color,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// ==========================================
// QUERY FUNCTIONS
// ==========================================

const fetchCategories = async (): Promise<UtilityCategory[]> => {
  if (isOfflineMode) {
    return await localStorageCategories.getAll();
  } else {
    const { data, error } = await supabase
      .from("utility_categories")
      .select("*")
      .order("name");

    if (error) throw error;
    return (data || []).map(transformCategory).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
};

// ==========================================
// HOOKS
// ==========================================

/**
 * Hook pour récupérer toutes les catégories
 */
export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: fetchCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes (catégories changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook pour récupérer une catégorie par ID
 */
export const useCategoryQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: categoryKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;

      if (isOfflineMode) {
        return await localStorageCategories.getById(id);
      } else {
        const { data, error } = await supabase
          .from("utility_categories")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data ? transformCategory(data) : null;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook pour ajouter une catégorie
 */
export const useAddCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      categoryData: UtilityCategoryFormData
    ): Promise<UtilityCategory> => {
      if (isOfflineMode) {
        return await localStorageCategories.create(categoryData);
      } else {
        const { data, error } = await supabase
          .from("utility_categories")
          .insert([categoryData])
          .select()
          .single();

        if (error) throw error;
        return transformCategory(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Catégorie ajoutée avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'ajout: ${error.message}`);
    },
  });
};

/**
 * Hook pour mettre à jour une catégorie
 */
export const useUpdateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      category: UtilityCategory
    ): Promise<UtilityCategory> => {
      if (isOfflineMode) {
        return await localStorageCategories.update(category.id, category);
      } else {
        const { data, error } = await supabase
          .from("utility_categories")
          .update({ name: category.name, color: category.color })
          .eq("id", category.id)
          .select()
          .single();

        if (error) throw error;
        return transformCategory(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Catégorie mise à jour avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });
};

/**
 * Hook pour supprimer une catégorie
 */
export const useDeleteCategoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryId: string): Promise<void> => {
      if (isOfflineMode) {
        await localStorageCategories.delete(categoryId);
      } else {
        const { error } = await supabase
          .from("utility_categories")
          .delete()
          .eq("id", categoryId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Catégorie supprimée avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });
};

