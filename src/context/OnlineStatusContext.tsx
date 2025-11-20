import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';
import { syncManager } from '@/lib/syncManager';
import { offlineQueue } from '@/lib/offlineQueue';

interface OnlineStatusContextType {
    isOnline: boolean;
    lastSyncTime: Date | null;
    isSyncing: boolean;
    pendingActions: number;
    sync: () => Promise<void>;
}

const OnlineStatusContext = createContext<OnlineStatusContextType | undefined>(undefined);

export const OnlineStatusProvider = ({ children }: { children: ReactNode }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingActions, setPendingActions] = useState(offlineQueue.getCount());

    /**
     * Met à jour le compteur d'actions en queue
     */
    const updatePendingCount = () => {
        setPendingActions(offlineQueue.getCount());
    };

    /**
     * Synchronise les données
     */
    const sync = async () => {
        if (!isOnline || isSyncing) return;

        setIsSyncing(true);
        try {
            // 1. D'abord synchroniser les données depuis le serveur
            await syncManager.syncAll();

            // 2. Ensuite rejouer les actions offline
            // Note: Les handlers seront fournis via un événement personnalisé
            // Pour l'instant, on montre juste combien d'actions sont en attente
            const queueCount = offlineQueue.getCount();
            if (queueCount > 0) {
                toast.info(`ℹ️ ${queueCount} action(s) en attente de synchronisation`, {
                    description: 'Reconnecter les gestionnaires pour synchroniser',
                });
            }

            setLastSyncTime(new Date());
            updatePendingCount();

            // Déclencher un événement personnalisé pour que les contextes se rafraîchissent
            window.dispatchEvent(new Event('data-synced'));
        } catch (error) {
            console.error('Sync error:', error);
            toast.error('❌ Erreur de synchronisation');
        } finally {
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        const handleOnline = async () => {
            setIsOnline(true);
            toast.success('✅ Connexion rétablie', {
                description: 'Synchronisation en cours...',
            });
            await sync();
        };

        const handleOffline = () => {
            setIsOnline(false);
            const pending = offlineQueue.getCount();
            toast.warning('⚠️ Mode hors ligne', {
                description: pending > 0
                    ? `${pending} action(s) seront synchronisées à la reconnexion`
                    : 'Les modifications seront synchronisées à la reconnexion',
            });
        };

        // Écouter les événements de queue
        const handleQueueChanged = () => {
            updatePendingCount();
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('queue-changed', handleQueueChanged);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('queue-changed', handleQueueChanged);
        };
    }, [isOnline, isSyncing]); // Ajout des dépendances

    const value: OnlineStatusContextType = {
        isOnline,
        lastSyncTime,
        isSyncing,
        pendingActions,
        sync,
    };

    return (
        <OnlineStatusContext.Provider value={value}>
            {children}
        </OnlineStatusContext.Provider>
    );
};

export const useOnlineStatus = (): OnlineStatusContextType => {
    const context = useContext(OnlineStatusContext);
    if (context === undefined) {
        throw new Error('useOnlineStatus must be used within an OnlineStatusProvider');
    }
    return context;
};
