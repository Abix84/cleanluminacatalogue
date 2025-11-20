import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { Brand, BrandFormData, BrandContextType, ApiError } from "@/types";
import { toast } from "sonner";
import { localStorageBrands } from "@/lib/localStorage";
import { supabase, IS_OFFLINE_MODE } from "@/integrations/supabase/client";

const BrandContext = createContext<BrandContextType | undefined>(undefined);

const isOfflineMode = IS_OFFLINE_MODE;

// ==========================================
// OFFLINE FUNCTIONS
// ==========================================

const offlineAddBrand = async (brandData: BrandFormData): Promise<Brand> => {
    return await localStorageBrands.create(brandData);
};

const offlineUpdateBrand = async (updatedBrand: Brand): Promise<Brand> => {
    return await localStorageBrands.update(updatedBrand.id, updatedBrand);
};

const offlineDeleteBrand = async (brandId: string): Promise<void> => {
    await localStorageBrands.delete(brandId);
};

// ==========================================
// ONLINE FUNCTIONS (SUPABASE)
// ==========================================

const onlineAddBrand = async (brandData: BrandFormData): Promise<Brand> => {
    const { data, error } = await supabase
        .from("brands")
        .insert([brandData])
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

const onlineUpdateBrand = async (updatedBrand: Brand): Promise<Brand> => {
    const { data, error } = await supabase
        .from("brands")
        .update({ name: updatedBrand.name })
        .eq("id", updatedBrand.id)
        .select()
        .single();

    if (error) throw error;

    return {
        id: data.id,
        name: data.name,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    };
};

const onlineDeleteBrand = async (brandId: string): Promise<void> => {
    const { error } = await supabase.from("brands").delete().eq("id", brandId);
    if (error) throw error;
};

// ==========================================
// PROVIDER COMPONENT
// ==========================================

export const BrandProvider = ({ children }: { children: ReactNode }) => {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    /**
     * Fetches all brands (offline or online)
     */
    const fetchBrands = async () => {
        try {
            setLoading(true);
            setError(null);

            let data: Brand[];

            if (isOfflineMode) {
                // Mode Offline - localStorage
                data = await localStorageBrands.getAll();
            } else {
                // Mode Online - Supabase
                const { data: supabaseData, error: fetchError } = await supabase
                    .from("brands")
                    .select("*")
                    .order("name");

                if (fetchError) throw fetchError;

                data = (supabaseData || []).map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    createdAt: item.created_at,
                    updatedAt: item.updated_at,
                }));
            }

            setBrands(data.sort((a, b) => a.name.localeCompare(b.name)));
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de la récupération des marques.";
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
     * Adds a new brand
     */
    const addBrand = async (brandData: BrandFormData): Promise<void> => {
        try {
            setError(null);

            const newBrand = isOfflineMode
                ? await offlineAddBrand(brandData)
                : await onlineAddBrand(brandData);

            setBrands((prev) =>
                [...prev, newBrand].sort((a, b) => a.name.localeCompare(b.name))
            );

            toast.success("Marque ajoutée avec succès !");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de l'ajout de la marque.";
            const apiError: ApiError = { message, details: err };
            setError(apiError);
            toast.error(message);
            console.error("Error adding brand:", err);
            throw err;
        }
    };

    /**
     * Updates an existing brand
     */
    const updateBrand = async (updatedBrand: Brand): Promise<void> => {
        try {
            setError(null);

            const updated = isOfflineMode
                ? await offlineUpdateBrand(updatedBrand)
                : await onlineUpdateBrand(updatedBrand);

            setBrands((prev) =>
                prev
                    .map((b) => (b.id === updatedBrand.id ? updated : b))
                    .sort((a, b) => a.name.localeCompare(b.name))
            );

            toast.success("Marque mise à jour avec succès !");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de la mise à jour de la marque.";
            const apiError: ApiError = { message, details: err };
            setError(apiError);
            toast.error(message);
            console.error("Error updating brand:", err);
            throw err;
        }
    };

    /**
     * Deletes a brand
     */
    const deleteBrand = async (brandId: string): Promise<void> => {
        try {
            setError(null);

            if (isOfflineMode) {
                await offlineDeleteBrand(brandId);
            } else {
                await onlineDeleteBrand(brandId);
            }

            setBrands((prev) => prev.filter((b) => b.id !== brandId));

            toast.success("Marque supprimée avec succès !");
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de la suppression de la marque.";
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
 * Hook to use the BrandContext (works in both offline and online modes)
 * @throws {Error} if used outside of BrandProvider
 */
export const useBrands = (): BrandContextType => {
    const context = useContext(BrandContext);

    if (context === undefined) {
        throw new Error("useBrands must be used within a BrandProvider");
    }

    return context;
};

// Export mode info
export const BRAND_MODE = isOfflineMode ? "offline" : "online";

