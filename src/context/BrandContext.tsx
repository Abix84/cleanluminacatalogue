import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Brand } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BrandContextType {
  brands: Brand[];
  addBrand: (brand: Omit<Brand, 'id'>) => Promise<void>;
  updateBrand: (updatedBrand: Brand) => Promise<void>;
  deleteBrand: (brandId: string) => Promise<void>;
  getBrandById: (brandId: string) => Brand | undefined;
  loading: boolean;
}

const BrandContext = createContext<BrandContextType | undefined>(undefined);

export const BrandProvider = ({ children }: { children: ReactNode }) => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBrands = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('brands').select('*').order('name');
    if (error) {
      toast.error("Erreur lors de la récupération des marques.");
      console.error(error);
    } else {
      setBrands(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const addBrand = async (brand: Omit<Brand, 'id'>) => {
    const { data, error } = await supabase.from('brands').insert([brand]).select();
    if (error) {
      toast.error("Erreur lors de l'ajout de la marque.");
    } else if (data) {
      setBrands(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const updateBrand = async (updatedBrand: Brand) => {
    const { error } = await supabase.from('brands').update(updatedBrand).eq('id', updatedBrand.id);
    if (error) {
      toast.error("Erreur lors de la mise à jour de la marque.");
    } else {
      setBrands(prev =>
        prev.map(b => (b.id === updatedBrand.id ? updatedBrand : b)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  };

  const deleteBrand = async (brandId: string) => {
    const { error } = await supabase.from('brands').delete().eq('id', brandId);
    if (error) {
      toast.error("Erreur lors de la suppression de la marque.");
    } else {
      setBrands(prev => prev.filter(b => b.id !== brandId));
    }
  };

  const getBrandById = (brandId: string) => {
    return brands.find(b => b.id === brandId);
  };

  return (
    <BrandContext.Provider value={{ brands, addBrand, updateBrand, deleteBrand, getBrandById, loading }}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrands = () => {
  const context = useContext(BrandContext);
  if (context === undefined) {
    throw new Error('useBrands must be used within a BrandProvider');
  }
  return context;
};