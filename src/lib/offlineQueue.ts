import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

/**
 * Types d'actions possibles
 */
export type QueueActionType = 'create' | 'update' | 'delete';

/**
 * Types d'entités
 */
export type QueueEntityType = 'product' | 'category' | 'brand';

/**
 * Action en queue
 */
export interface QueuedAction {
    id: string;
    type: QueueActionType;
    entity: QueueEntityType;
    data: any;
    timestamp: string;
    retryCount: number;
    lastError?: string;
}

/**
 * Résultat d'exécution d'une action
 */
interface ActionResult {
    success: boolean;
    error?: string;
}

/**
 * OfflineQueue - Gestionnaire de queue pour actions offline
 * Stocke les modifications faites hors ligne et les rejoue à la reconnexion
 */
export class OfflineQueue {
    private static instance: OfflineQueue;
    private static readonly STORAGE_KEY = 'offline_queue';
    private static readonly MAX_RETRIES = 3;

    private constructor() { }

    static getInstance(): OfflineQueue {
        if (!OfflineQueue.instance) {
            OfflineQueue.instance = new OfflineQueue();
        }
        return OfflineQueue.instance;
    }

    /**
     * Récupère toutes les actions en queue
     */
    private getQueue(): QueuedAction[] {
        try {
            const stored = localStorage.getItem(OfflineQueue.STORAGE_KEY);
            if (!stored) return [];
            return JSON.parse(stored);
        } catch (error) {
            console.error('Error reading offline queue:', error);
            return [];
        }
    }

    /**
     * Sauvegarde la queue
     */
    private saveQueue(queue: QueuedAction[]): void {
        try {
            localStorage.setItem(OfflineQueue.STORAGE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('Error saving offline queue:', error);
        }
    }

    /**
     * Ajoute une action à la queue
     */
    add(
        type: QueueActionType,
        entity: QueueEntityType,
        data: any
    ): QueuedAction {
        const action: QueuedAction = {
            id: uuidv4(),
            type,
            entity,
            data,
            timestamp: new Date().toISOString(),
            retryCount: 0,
        };

        const queue = this.getQueue();
        queue.push(action);
        this.saveQueue(queue);

        console.log(`Action added to offline queue:`, action);
        return action;
    }

    /**
     * Supprime une action de la queue
     */
    remove(actionId: string): void {
        const queue = this.getQueue();
        const filtered = queue.filter(action => action.id !== actionId);
        this.saveQueue(filtered);
    }

    /**
     * Obtient le nombre d'actions en queue
     */
    getCount(): number {
        return this.getQueue().length;
    }

    /**
     * Vide complètement la queue
     */
    clear(): void {
        localStorage.removeItem(OfflineQueue.STORAGE_KEY);
    }

    /**
     * Rejoue toutes les actions en queue
     */
    async replayAll(
        handlers: {
            product?: {
                create: (data: any) => Promise<void>;
                update: (data: any) => Promise<void>;
                delete: (id: string) => Promise<void>;
            };
            category?: {
                create: (data: any) => Promise<void>;
                update: (data: any) => Promise<void>;
                delete: (id: string) => Promise<void>;
            };
            brand?: {
                create: (data: any) => Promise<void>;
                update: (data: any) => Promise<void>;
                delete: (id: string) => Promise<void>;
            };
        }
    ): Promise<{ success: number; failed: number }> {
        const queue = this.getQueue();

        if (queue.length === 0) {
            return { success: 0, failed: 0 };
        }

        toast.info(`🔄 Synchronisation de ${queue.length} action(s) en attente...`);

        let successCount = 0;
        let failedCount = 0;

        for (const action of queue) {
            const result = await this.replayAction(action, handlers);

            if (result.success) {
                successCount++;
                this.remove(action.id);
            } else {
                failedCount++;
                // Incrémenter le compteur de retry
                action.retryCount++;
                action.lastError = result.error;

                // Si trop de retries, supprimer de la queue
                if (action.retryCount >= OfflineQueue.MAX_RETRIES) {
                    console.error(`Action failed after ${OfflineQueue.MAX_RETRIES} retries:`, action);
                    this.remove(action.id);
                    toast.error(`❌ Action ${action.type} échouée après ${OfflineQueue.MAX_RETRIES} tentatives`);
                } else {
                    // Sauvegarder avec retry count mis à jour
                    const updatedQueue = this.getQueue().map(a =>
                        a.id === action.id ? action : a
                    );
                    this.saveQueue(updatedQueue);
                }
            }
        }

        if (successCount > 0) {
            toast.success(`✅ ${successCount} action(s) synchronisée(s)`);
        }

        if (failedCount > 0 && failedCount < queue.length) {
            toast.warning(`⚠️ ${failedCount} action(s) en échec`);
        }

        return { success: successCount, failed: failedCount };
    }

    /**
     * Rejoue une action spécifique
     */
    private async replayAction(
        action: QueuedAction,
        handlers: any
    ): Promise<ActionResult> {
        try {
            const entityHandlers = handlers[action.entity];

            if (!entityHandlers) {
                return {
                    success: false,
                    error: `No handlers defined for entity: ${action.entity}`
                };
            }

            const handler = entityHandlers[action.type];

            if (!handler) {
                return {
                    success: false,
                    error: `No handler defined for action: ${action.type}`
                };
            }

            // Exécuter l'action
            if (action.type === 'delete') {
                await handler(action.data.id);
            } else {
                await handler(action.data);
            }

            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`Error replaying action:`, action, error);
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Obtient toutes les actions pour un type d'entité spécifique
     */
    getActionsForEntity(entity: QueueEntityType): QueuedAction[] {
        return this.getQueue().filter(action => action.entity === entity);
    }
}

// Export de l'instance singleton
export const offlineQueue = OfflineQueue.getInstance();
