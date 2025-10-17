import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

type ProductFormData = Omit<Product, 'id' | 'image_url'> & {
  image_url?: File | string | null;
};

interface ProductContextType {
  products: Product[];
  addProduct: (product: ProductFormData) => Promise<void>;
  updateProduct: (updatedProduct: Product, imageFile?: File) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  getProductById: (productId: string) => Product | undefined;
  loading: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const BUCKET_NAME = 'product-images';

// Helper to convert snake_case from DB to camelCase for frontend
const toCamelCase = (product: any): Product => ({
  ...product,
  utilityCategoryId: product.utility_category_id,
  brandId: product.brand_id,
});

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (error) {
      toast.error("Erreur lors de la récupération des produits.");
      console.error(error);
    } else {
      setProducts((data || []).map(toCamelCase));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const deleteImageByUrl = async (imageUrl: string) => {
    if (!imageUrl || imageUrl.includes('placeholder.svg')) return;
    try {
      const { error } = await supabase.functions.invoke('delete-image', {
        body: { imageUrl },
      });
      if (error) throw error;
    } catch (error) {
      console.error('Failed to delete old image:', error);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const fileName = `${uuidv4()}-${file.name}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, file);
    if (error) {
      toast.error("Erreur lors du téléversement de l'image.");
      console.error(error);
      return null;
    }
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const addProduct = async (productData: ProductFormData) => {
    let imageUrl: string | null = null;
    if (productData.image_url instanceof File) {
      imageUrl = await uploadImage(productData.image_url);
    }

    const { image_url: _, utilityCategoryId, brandId, ...rest } = productData;
    const productToInsert = {
      ...rest,
      image_url: imageUrl,
      utility_category_id: utilityCategoryId,
      brand_id: brandId,
    };
    
    const { data, error } = await supabase.from('products').insert([productToInsert]).select();
    if (error) {
      toast.error("Erreur lors de l'ajout du produit.");
      console.error(error);
    } else if (data) {
      setProducts(prev => [...prev, toCamelCase(data[0])].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const updateProduct = async (updatedProductData: Product, imageFile?: File) => {
    let imageUrl = updatedProductData.image_url;

    if (imageFile) {
      const originalProduct = products.find(p => p.id === updatedProductData.id);
      if (originalProduct && originalProduct.image_url) {
        await deleteImageByUrl(originalProduct.image_url);
      }
      imageUrl = await uploadImage(imageFile);
    }

    const { utilityCategoryId, brandId, ...rest } = updatedProductData;
    const productToUpdate = {
      ...rest,
      image_url: imageUrl,
      utility_category_id: utilityCategoryId,
      brand_id: brandId,
    };

    const { data, error } = await supabase.from('products').update(productToUpdate).eq('id', productToUpdate.id).select();
    if (error) {
      toast.error("Erreur lors de la mise à jour du produit.");
      console.error(error);
    } else if (data) {
      const updatedProduct = toCamelCase(data[0]);
      setProducts(prev =>
        prev.map(p => (p.id === updatedProduct.id ? updatedProduct : p)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  };

  const deleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (productToDelete && productToDelete.image_url) {
      await deleteImageByUrl(productToDelete.image_url);
    }

    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast.error("Erreur lors de la suppression du produit.");
    } else {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, getProductById, loading }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};