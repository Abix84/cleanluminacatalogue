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
import { toast } from "sonner";
import { localStorageCategories } from "@/lib/localStorage";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";

const UtilityCategoryContext = createContext<
    UtilityCategoryContextType | undefined
>(undefined);

const isOfflineMode = IS_OFFLINE_MODE;

// ==========================================
// OFFLINE FUNCTIONS
// ==========================================

const offlineAddCategory = async (
    categoryData: UtilityCategoryFormData,
): Promise<UtilityCategory> => {
    return await localStorageCategories.create(categoryData);
};

const offlineUpdateCategory = async (
    updatedCategory: UtilityCategory,
): Promise<UtilityCategory> => {
    return await localStorageCategories.update(
        updatedCategory.id,
        updatedCategory,
    );
};

const offlineDeleteCategory = async (categoryId: string): Promise<void> => {
    await localStorageCategories.delete(categoryId);
};

// ==========================================
// ONLINE FUNCTIONS (SUPABASE)
// ==========================================

const onlineAddCategory = async (
    categoryData: UtilityCategoryFormData,
): Promise<UtilityCategory> => {
    const { data, error } = await supabase
        .from("utility_categories")
        .insert([categoryData])
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        color: data.color,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

const onlineUpdateCategory = async (
    updatedCategory: UtilityCategory,
): Promise<UtilityCategory> => {
    const { data, error } = await supabase
        .from("utility_categories")
        .update({ name: updatedCategory.name, color: updatedCategory.color })
        .eq("id", updatedCategory.id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        color: data.color,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

const onlineDeleteCategory = async (categoryId: string): Promise<void> => {
    const { error } = await supabase
        .from("utility_categories")
        .delete()
        .eq("id", categoryId);
    if (error) throw error;
};

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const UtilityCategoryProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const [utilityCategories, setUtilityCategories] = useState<
        UtilityCategory[]
    >([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    /**
     * Fetches all utility categories (offline or online)
     */
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            let data: UtilityCategory[];

            if (isOfflineMode) {
                // Mode Offline - localStorage
                data = await localStorageCategories.getAll();
            } else {
                // Mode Online - Supabase
                const { data: supabaseData, error: fetchError } = await supabase
                    .from("utility_categories")
                    .select("*")
                    .order("name");

                if (fetchError) throw fetchError;

                data = (supabaseData || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    color: item.color,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at,
                }));
            }

            setUtilityCategories(
                data.sort((a, b) => a.name.localeCompare(b.name)),
            );
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de la récupération des catégories.";
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
     * Adds a new utility category
     */
    const addUtilityCategory = async (
        categoryData: UtilityCategoryFormData,
    ): Promise<void> => {
        try {
            setError(null);

            const newCategory = isOfflineMode
                ? await offlineAddCategory(categoryData)
                : await onlineAddCategory(categoryData);

            setUtilityCategories((prev) =>
                [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)),
            );

            toast.success("Catégorie ajoutée avec succès !");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de l'ajout de la catégorie.";
            const apiError: ApiError = { message, details: err };
            setError(apiError);
            toast.error(message);
            console.error("Error adding utility category:", err);
            throw err;
        }
    };

    /**
     * Updates an existing utility category
     */
    const updateUtilityCategory = async (
        updatedCategory: UtilityCategory,
    ): Promise<void> => {
        try {
            setError(null);

            const updated = isOfflineMode
                ? await offlineUpdateCategory(updatedCategory)
                : await onlineUpdateCategory(updatedCategory);

            setUtilityCategories((prev) =>
                prev
                    .map((c) => (c.id === updatedCategory.id ? updated : c))
                    .sort((a, b) => a.name.localeCompare(b.name)),
            );

            toast.success("Catégorie mise à jour avec succès !");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de la mise à jour de la catégorie.";
            const apiError: ApiError = { message, details: err };
            setError(apiError);
            toast.error(message);
            console.error("Error updating utility category:", err);
            throw err;
        }
    };

    /**
     * Deletes a utility category
     */
    const deleteUtilityCategory = async (categoryId: string): Promise<void> => {
        try {
            setError(null);

            if (isOfflineMode) {
                await offlineDeleteCategory(categoryId);
            } else {
                await onlineDeleteCategory(categoryId);
            }

            setUtilityCategories((prev) =>
                prev.filter((c) => c.id !== categoryId),
            );

            toast.success("Catégorie supprimée avec succès !");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de la suppression de la catégorie.";
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
 * Hook to use the UtilityCategoryContext (works in both offline and online modes)
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

// Export mode info
export const CATEGORY_MODE = isOfflineMode ? "offline" : "online";

