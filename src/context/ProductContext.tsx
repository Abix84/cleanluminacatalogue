import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  Product,
  ProductFormData,
  ProductContextType,
  ApiError,
} from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProductContext = createContext<ProductContextType | undefined>(undefined);

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  /**
   * Fetches all products from Supabase
   */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("name");

      if (error) throw error;

      setProducts((data || []).sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la récupération des produits.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /**
   * Adds a new product to Supabase
   */
  const addProduct = async (productData: ProductFormData): Promise<void> => {
    try {
      setError(null);

      let imageUrl: string | null = null;

      // Handle image upload if present
      if (productData.image_url && productData.image_url instanceof File) {
        const file = productData.image_url;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const newProductData = {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image_url: imageUrl,
        utility_category_id: productData.utilityCategoryId,
        brand_id: productData.brandId,
      };

      const { data, error } = await supabase
        .from("products")
        .insert([newProductData])
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Produit ajouté avec succès !");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de l'ajout du produit.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error adding product:", err);
      throw err;
    }
  };

  /**
   * Updates an existing product in Supabase
   */
  const updateProduct = async (
    updatedProduct: Product,
    imageFile?: File,
  ): Promise<void> => {
    try {
      setError(null);

      let imageUrl = updatedProduct.image_url;

      // Handle image upload if a new file is provided
      if (imageFile) {
        const file = imageFile;
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("products")
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const productToUpdate = {
        name: updatedProduct.name,
        description: updatedProduct.description,
        price: updatedProduct.price,
        image_url: imageUrl,
        utility_category_id: updatedProduct.utilityCategoryId,
        brand_id: updatedProduct.brandId,
      };

      const { data, error } = await supabase
        .from("products")
        .update(productToUpdate)
        .eq("id", updatedProduct.id)
        .select()
        .single();

      if (error) throw error;

      setProducts((prev) =>
        prev
          .map((p) => (p.id === updatedProduct.id ? data : p))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      toast.success("Produit mis à jour avec succès !");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la mise à jour du produit.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error updating product:", err);
      throw err;
    }
  };

  /**
   * Deletes a product from Supabase
   */
  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      setError(null);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Produit supprimé avec succès !");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Erreur lors de la suppression du produit.";
      const apiError: ApiError = {
        message: errorMessage,
        details: err,
      };

      setError(apiError);
      toast.error(errorMessage);
      console.error("Error deleting product:", err);
      throw err;
    }
  };

  /**
   * Gets a product by its ID
   */
  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  const value: ProductContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    loading,
    error,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
};

// ==========================================
// HOOK
// ==========================================

/**
 * Hook to use the ProductContext
 * @throws {Error} if used outside of ProductProvider
 */
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);

  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }

  return context;
};
