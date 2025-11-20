import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";
import { Product, ProductFormData, PaginatedResponse, PaginationParams } from "@/types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { localStorageProducts, localStorageImages } from "@/lib/localStorage";

const BUCKET_NAME = "product-images";
const isOfflineMode = IS_OFFLINE_MODE;

// ==========================================
// QUERY KEYS
// ==========================================

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters?: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string | null;
    brandId?: string | null;
    company?: string | null;
  }) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// ==========================================
// TRANSFORM FUNCTIONS
// ==========================================

const transformProduct = (item: any): Product => ({
  id: item.id,
  name: item.name,
  description: item.description,
  price: item.price,
  image_url: item.image_url,
  utilityCategoryId: item.utility_category_id,
  brandId: item.brand_id,
  company: item.company,
  createdAt: item.created_at,
  updatedAt: item.updated_at,
});

// ==========================================
// OFFLINE FUNCTIONS
// ==========================================

const offlineFetchProducts = async (
  params?: PaginationParams & {
    search?: string;
    categoryId?: string | null;
    brandId?: string | null;
    company?: string | null;
  }
): Promise<PaginatedResponse<Product>> => {
  let data = await localStorageProducts.getAll();

  // Filtrage
  if (params?.search) {
    data = data.filter((p) =>
      p.name.toLowerCase().includes(params.search!.toLowerCase())
    );
  }
  if (params?.categoryId) {
    data = data.filter((p) => p.utilityCategoryId === params.categoryId);
  }
  if (params?.brandId) {
    data = data.filter((p) => p.brandId === params.brandId);
  }
  if (params?.company) {
    data = data.filter((p) => p.company === params.company);
  }

  // Tri
  data.sort((a, b) => a.name.localeCompare(b.name));

  const total = data.length;
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

// ==========================================
// ONLINE FUNCTIONS (SUPABASE)
// ==========================================

const onlineFetchProducts = async (
  params?: PaginationParams & {
    search?: string;
    categoryId?: string | null;
    brandId?: string | null;
    company?: string | null;
  }
): Promise<PaginatedResponse<Product>> => {
  const page = params?.page || 1;
  const pageSize = params?.pageSize || 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order("name");

  // Filtres
  if (params?.search) {
    query = query.ilike("name", `%${params.search}%`);
  }
  if (params?.categoryId) {
    query = query.eq("utility_category_id", params.categoryId);
  }
  if (params?.brandId) {
    query = query.eq("brand_id", params.brandId);
  }
  if (params?.company) {
    query = query.eq("company", params.company);
  }

  // Pagination
  const { data, error, count } = await query.range(startIndex, endIndex);

  if (error) throw error;

  return {
    data: (data || []).map(transformProduct),
    total: count || 0,
    page,
    pageSize,
    totalPages: Math.ceil((count || 0) / pageSize),
  };
};

// ==========================================
// HOOKS
// ==========================================

/**
 * Hook pour récupérer les produits avec pagination et filtres
 */
export const useProductsQuery = (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string | null;
  brandId?: string | null;
  company?: string | null;
  enabled?: boolean;
}) => {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: () =>
      isOfflineMode
        ? offlineFetchProducts(params)
        : onlineFetchProducts(params),
    enabled: params?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (anciennement cacheTime)
  });
};

/**
 * Hook pour récupérer tous les produits (sans pagination)
 * Utile pour les listes courtes ou les filtres
 */
export const useAllProductsQuery = (filters?: {
  search?: string;
  categoryId?: string | null;
  brandId?: string | null;
  company?: string | null;
}) => {
  return useQuery({
    queryKey: [...productKeys.all, "all", filters],
    queryFn: async () => {
      if (isOfflineMode) {
        const result = await offlineFetchProducts({
          ...filters,
          page: 1,
          pageSize: 10000, // Grand nombre pour récupérer tout
        });
        return result.data;
      } else {
        let query = supabase.from("products").select("*").order("name");

        if (filters?.search) {
          query = query.ilike("name", `%${filters.search}%`);
        }
        if (filters?.categoryId) {
          query = query.eq("utility_category_id", filters.categoryId);
        }
        if (filters?.brandId) {
          query = query.eq("brand_id", filters.brandId);
        }
        if (filters?.company) {
          query = query.eq("company", filters.company);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map(transformProduct);
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

/**
 * Hook pour récupérer un produit par ID
 */
export const useProductQuery = (id: string | undefined) => {
  return useQuery({
    queryKey: productKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;

      if (isOfflineMode) {
        const product = await localStorageProducts.getById(id);
        return product || null;
      } else {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        return data ? transformProduct(data) : null;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook pour ajouter un produit
 */
export const useAddProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productData: ProductFormData): Promise<Product> => {
      if (isOfflineMode) {
        const tempProductData = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image_url: null,
          utilityCategoryId: productData.utilityCategoryId,
          brandId: productData.brandId,
          company: productData.company,
        };

        const newProduct = await localStorageProducts.create(tempProductData);

        if (productData.image_url instanceof File) {
          const imageUrl = await localStorageImages.upload(
            productData.image_url,
            newProduct.id
          );
          return await localStorageProducts.update(newProduct.id, {
            ...newProduct,
            image_url: imageUrl,
          });
        }

        return newProduct;
      } else {
        let imageUrl: string | null = null;

        if (productData.image_url instanceof File) {
          const fileName = `${uuidv4()}-${productData.image_url.name}`;
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, productData.image_url);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);
          imageUrl = data.publicUrl;
        }

        const productToInsert = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          image_url: imageUrl,
          utility_category_id: productData.utilityCategoryId,
          brand_id: productData.brandId,
          company: productData.company,
        };

        const { data, error } = await supabase
          .from("products")
          .insert([productToInsert])
          .select()
          .single();

        if (error) throw error;
        return transformProduct(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit ajouté avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'ajout du produit: ${error.message}`);
    },
  });
};

/**
 * Hook pour mettre à jour un produit
 */
export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      product,
      imageFile,
    }: {
      product: Product;
      imageFile?: File;
    }): Promise<Product> => {
      if (isOfflineMode) {
        let imageUrl = product.image_url;

        if (imageFile) {
          if (imageUrl) {
            await localStorageImages.delete(imageUrl);
          }
          imageUrl = await localStorageImages.upload(imageFile, product.id);
        }

        return await localStorageProducts.update(product.id, {
          ...product,
          image_url: imageUrl,
        });
      } else {
        let imageUrl = product.image_url;
        const oldImageUrl = product.image_url;

        if (imageFile) {
          const fileName = `${uuidv4()}-${imageFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(fileName, imageFile);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);
          imageUrl = data.publicUrl;

          if (oldImageUrl) {
            try {
              await supabase.functions.invoke("delete-image", {
                body: { imageUrl: oldImageUrl },
              });
            } catch (error) {
              console.error("Failed to delete old image:", error);
            }
          }
        }

        const productToUpdate = {
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: imageUrl,
          utility_category_id: product.utilityCategoryId,
          brand_id: product.brandId,
          company: product.company,
        };

        const { data, error } = await supabase
          .from("products")
          .update(productToUpdate)
          .eq("id", product.id)
          .select()
          .single();

        if (error) throw error;
        return transformProduct(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit mis à jour avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la mise à jour: ${error.message}`);
    },
  });
};

/**
 * Hook pour supprimer un produit
 */
export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      productId,
      imageUrl,
    }: {
      productId: string;
      imageUrl?: string | null;
    }): Promise<void> => {
      if (isOfflineMode) {
        if (imageUrl) {
          await localStorageImages.delete(imageUrl);
        }
        await localStorageProducts.delete(productId);
      } else {
        const { error } = await supabase
          .from("products")
          .delete()
          .eq("id", productId);

        if (error) throw error;

        if (imageUrl) {
          try {
            await supabase.functions.invoke("delete-image", {
              body: { imageUrl },
            });
          } catch (error) {
            console.error("Failed to delete product image:", error);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Produit supprimé avec succès !");
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de la suppression: ${error.message}`);
    },
  });
};
