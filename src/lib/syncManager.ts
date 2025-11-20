import { localStorageProducts, localStorageCategories, localStorageBrands } from './localStorage';
import { supabase } from '@/integrations/supabase/client';
import { Product, UtilityCategory, Brand } from '@/types';
import { toast } from 'sonner';

/**
 * Interface for cached data with metadata
 */
interface CachedData<T> {
    data: T[];
    lastSync: string; // ISO timestamp
    version: number;
}

/**
 * SyncManager - Gestionnaire de synchronisation des données
 * Gère la synchronisation entre localStorage et Supabase
 */
export class SyncManager {
    private static instance: SyncManager;

    private constructor() { }

    static getInstance(): SyncManager {
        if (!SyncManager.instance) {
            SyncManager.instance = new SyncManager();
        }
        return SyncManager.instance;
    }

    /**
     * Récupère les métadonnées de synchronisation
     */
    private getSyncMetadata(key: string): { lastSync: string | null; version: number } {
        try {
            const stored = localStorage.getItem(`sync_meta_${key}`);
            if (!stored) return { lastSync: null, version: 1 };
            return JSON.parse(stored);
        } catch {
            return { lastSync: null, version: 1 };
        }
    }

    /**
     * Sauvegarde les métadonnées de synchronisation
     */
    private setSyncMetadata(key: string, lastSync: string, version: number): void {
        localStorage.setItem(`sync_meta_${key}`, JSON.stringify({ lastSync, version }));
    }

    /**
     * Synchronise les produits
     */
    async syncProducts(): Promise<{ success: boolean; updated: number }> {
        try {
            const meta = this.getSyncMetadata('products');

            // Fetch from Supabase
            let query = supabase
                .from('products')
                .select('*')
                .order('name');

            // Si on a une date de dernière sync, ne récupérer que les changements
            if (meta.lastSync) {
                query = query.gte('updated_at', meta.lastSync);
            }

            const { data: supabaseData, error } = await query;

            if (error) throw error;

            if (!supabaseData || supabaseData.length === 0) {
                return { success: true, updated: 0 };
            }

            // Convertir les données Supabase au format frontend
            const products: Product[] = supabaseData.map((item: any) => ({
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
            }));

            // Mettre à jour localStorage
            const existingProducts = await localStorageProducts.getAll();
            const updatedProducts = this.mergeData(existingProducts, products);

            // Sauvegarder dans localStorage
            localStorage.setItem('cleanexpress_products', JSON.stringify(updatedProducts));

            // Mettre à jour les métadonnées
            this.setSyncMetadata('products', new Date().toISOString(), meta.version + 1);

            return { success: true, updated: products.length };
        } catch (error) {
            console.error('Error syncing products:', error);
            return { success: false, updated: 0 };
        }
    }

    /**
     * Synchronise les catégories
     */
    async syncCategories(): Promise<{ success: boolean; updated: number }> {
        try {
            const meta = this.getSyncMetadata('categories');

            let query = supabase
                .from('utility_categories')
                .select('*')
                .order('name');

            if (meta.lastSync) {
                query = query.gte('updated_at', meta.lastSync);
            }

            const { data: supabaseData, error } = await query;

            if (error) throw error;

            if (!supabaseData || supabaseData.length === 0) {
                return { success: true, updated: 0 };
            }

            const categories: UtilityCategory[] = supabaseData.map((item: any) => ({
                id: item.id,
                name: item.name,
                color: item.color,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            }));

            const existingCategories = await localStorageCategories.getAll();
            const updatedCategories = this.mergeData(existingCategories, categories);

            localStorage.setItem('cleanexpress_categories', JSON.stringify(updatedCategories));
            this.setSyncMetadata('categories', new Date().toISOString(), meta.version + 1);

            return { success: true, updated: categories.length };
        } catch (error) {
            console.error('Error syncing categories:', error);
            return { success: false, updated: 0 };
        }
    }

    /**
     * Synchronise les marques
     */
    async syncBrands(): Promise<{ success: boolean; updated: number }> {
        try {
            const meta = this.getSyncMetadata('brands');

            let query = supabase
                .from('brands')
                .select('*')
                .order('name');

            if (meta.lastSync) {
                query = query.gte('updated_at', meta.lastSync);
            }

            const { data: supabaseData, error } = await query;

            if (error) throw error;

            if (!supabaseData || supabaseData.length === 0) {
                return { success: true, updated: 0 };
            }

            const brands: Brand[] = supabaseData.map((item: any) => ({
                id: item.id,
                name: item.name,
                createdAt: item.created_at,
                updatedAt: item.updated_at,
            }));

            const existingBrands = await localStorageBrands.getAll();
            const updatedBrands = this.mergeData(existingBrands, brands);

            localStorage.setItem('cleanexpress_brands', JSON.stringify(updatedBrands));
            this.setSyncMetadata('brands', new Date().toISOString(), meta.version + 1);

            return { success: true, updated: brands.length };
        } catch (error) {
            console.error('Error syncing brands:', error);
            return { success: false, updated: 0 };
        }
    }

    /**
     * Synchronise toutes les données
     */
    async syncAll(): Promise<{
        success: boolean;
        products: number;
        categories: number;
        brands: number;
    }> {
        try {
            const [productsResult, categoriesResult, brandsResult] = await Promise.all([
                this.syncProducts(),
                this.syncCategories(),
                this.syncBrands(),
            ]);

            const totalUpdated = productsResult.updated + categoriesResult.updated + brandsResult.updated;

            if (totalUpdated > 0) {
                toast.success(`✅ ${totalUpdated} élément(s) synchronisé(s)`);
            }

            return {
                success: productsResult.success && categoriesResult.success && brandsResult.success,
                products: productsResult.updated,
                categories: categoriesResult.updated,
                brands: brandsResult.updated,
            };
        } catch (error) {
            console.error('Error in syncAll:', error);
            toast.error('❌ Erreur lors de la synchronisation');
            return { success: false, products: 0, categories: 0, brands: 0 };
        }
    }

    /**
     * Fusionne les données existantes avec les nouvelles
     * Les nouvelles données écrasent les anciennes basées sur l'ID
     */
    private mergeData<T extends { id: string }>(existing: T[], incoming: T[]): T[] {
        const merged = [...existing];

        incoming.forEach(newItem => {
            const index = merged.findIndex(item => item.id === newItem.id);
            if (index >= 0) {
                // Mettre à jour l'élément existant
                merged[index] = newItem;
            } else {
                // Ajouter le nouvel élément
                merged.push(newItem);
            }
        });

        return merged;
    }

    /**
     * Force une synchronisation complète (ignore les timestamps)
     */
    async forceFullSync(): Promise<void> {
        // Reset les métadonnées
        localStorage.removeItem('sync_meta_products');
        localStorage.removeItem('sync_meta_categories');
        localStorage.removeItem('sync_meta_brands');

        await this.syncAll();
    }
}

// Export de l'instance singleton
export const syncManager = SyncManager.getInstance();
