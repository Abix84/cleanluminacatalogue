import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UtilityCategory } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UtilityCategoryContextType {
  utilityCategories: UtilityCategory[];
  addUtilityCategory: (category: Omit<UtilityCategory, 'id'>) => Promise<void>;
  updateUtilityCategory: (updatedCategory: UtilityCategory) => Promise<void>;
  deleteUtilityCategory: (categoryId: string) => Promise<void>;
  getUtilityCategoryById: (categoryId: string) => UtilityCategory | undefined;
  loading: boolean;
}

const UtilityCategoryContext = createContext<UtilityCategoryContextType | undefined>(undefined);

export const UtilityCategoryProvider = ({ children }: { children: ReactNode }) => {
  const [utilityCategories, setUtilityCategories] = useState<UtilityCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('utility_categories').select('*').order('name');
    if (error) {
      toast.error("Erreur lors de la récupération des catégories.");
      console.error(error);
    } else {
      setUtilityCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addUtilityCategory = async (category: Omit<UtilityCategory, 'id'>) => {
    const { data, error } = await supabase.from('utility_categories').insert([category]).select();
    if (error) {
      toast.error("Erreur lors de l'ajout de la catégorie.");
    } else if (data) {
      setUtilityCategories(prev => [...prev, data[0]].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  const updateUtilityCategory = async (updatedCategory: UtilityCategory) => {
    const { error } = await supabase.from('utility_categories').update(updatedCategory).eq('id', updatedCategory.id);
    if (error) {
      toast.error("Erreur lors de la mise à jour de la catégorie.");
    } else {
      setUtilityCategories(prev =>
        prev.map(c => (c.id === updatedCategory.id ? updatedCategory : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }
  };

  const deleteUtilityCategory = async (categoryId: string) => {
    const { error } = await supabase.from('utility_categories').delete().eq('id', categoryId);
    if (error) {
      toast.error("Erreur lors de la suppression de la catégorie.");
    } else {
      setUtilityCategories(prev => prev.filter(c => c.id !== categoryId));
    }
  };

  const getUtilityCategoryById = (categoryId: string) => {
    return utilityCategories.find(c => c.id === categoryId);
  };

  return (
    <UtilityCategoryContext.Provider value={{ utilityCategories, addUtilityCategory, updateUtilityCategory, deleteUtilityCategory, getUtilityCategoryById, loading }}>
      {children}
    </UtilityCategoryContext.Provider>
  );
};

export const useUtilityCategories = () => {
  const context = useContext(UtilityCategoryContext);
  if (context === undefined) {
    throw new Error('useUtilityCategories must be used within a UtilityCategoryProvider');
  }
  return context;
};