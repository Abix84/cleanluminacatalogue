import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";
import { Brand, BrandFormData } from "@/types";
import { toast } from "sonner";
import { localStorageBrands } from "@/lib/localStorage";

const isOfflineMode = IS_OFFLINE_MODE;

// ==========================================
// QUERY KEYS
// ==========================================

export const brandKeys = {
  all: ["brands"] as const,
  lists: () => [...brandKeys.all, "list"] as const,
  list: () => [...brandKeys.lists()] as const,
  details: () => [...brandKeys.all, "detail"] as const,
  detail: (id: string) => [...brandKeys.details(), id] as const,
};

// ==========================================
// TRANSFORM FUNCTIONS
// ==========================================

const transformBrand = (item: any): Brand => ({
  id: item.id,
  name: item.name,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// ==========================================
// QUERY FUNCTIONS
// ==========================================

const fetchBrands = async (): Promise<Brand[]> => {
  if (isOfflineMode) {
    return await localStorageBrands.getAll();
  } else {
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("name");

    if (error) throw error;
    return (data || []).map(transformBrand).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }
};

// ==========================================
// HOOKS
// ==========================================

/**
 * Hook pour récupérer toutes les marques
 */
export const useBrandsQuery = () => {
  return useQuery({
    queryKey: brandKeys.list(),
    queryFn: fetchBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes (marques changent rarement)
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook pour récupérer une marque par ID
 */
export const useBrandQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: brandKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;

      if (isOfflineMode) {
        return await localStorageBrands.getById(id);
      } else {
        const { data, error } = await supabase
          .from("brands")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data ? transformBrand(data) : null;
      }
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook pour ajouter une marque
 */
export const useAddBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandData: BrandFormData): Promise<Brand> => {
      if (isOfflineMode) {
        return await localStorageBrands.create(brandData);
      } else {
        const { data, error } = await supabase
          .from("brands")
          .insert([brandData])
          .select()
          .single();

        if (error) throw error;
        return transformBrand(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success("Marque ajoutée avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'ajout: ${error.message}`);
    },
  });
};

/**
 * Hook pour mettre à jour une marque
 */
export const useUpdateBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brand: Brand): Promise<Brand> => {
      if (isOfflineMode) {
        return await localStorageBrands.update(brand.id, brand);
      } else {
        const { data, error } = await supabase
          .from("brands")
          .update({ name: brand.name })
          .eq("id", brand.id)
          .select()
          .single();

        if (error) throw error;
        return transformBrand(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success("Marque mise à jour avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });
};

/**
 * Hook pour supprimer une marque
 */
export const useDeleteBrandMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandId: string): Promise<void> => {
      if (isOfflineMode) {
        await localStorageBrands.delete(brandId);
      } else {
        const { error } = await supabase.from("brands").delete().eq("id", brandId);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: brandKeys.all });
      toast.success("Marque supprimée avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });
};

