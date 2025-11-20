import { Wifi, WifiOff, RefreshCw, Bell } from 'lucide-react';
import { useOnlineStatus } from '@/context/OnlineStatusContext';
import { motion, AnimatePresence } from 'framer-motion';

export const OnlineStatusIndicator = () => {
    const { isOnline, isSyncing, lastSyncTime, pendingActions } = useOnlineStatus();

    const formatLastSync = (date: Date | null) => {
        if (!date) return 'Jamais';

        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes}min`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Il y a ${hours}h`;
        return date.toLocaleDateString();
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors relative"
                style={{
                    backgroundColor: isOnline
                        ? 'rgba(34, 197, 94, 0.1)'
                        : 'rgba(251, 146, 60, 0.1)',
                    color: isOnline ? '#22c55e' : '#fb923c',
                }}
            >
                {isSyncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : isOnline ? (
                    <Wifi className="h-4 w-4" />
                ) : (
                    <WifiOff className="h-4 w-4" />
                )}

                <span className="hidden sm:inline">
                    {isSyncing ? 'Synchronisation...' : isOnline ? 'En ligne' : 'Hors ligne'}
                </span>

                {isOnline && lastSyncTime && !isSyncing && (
                    <span className="hidden md:inline text-xs opacity-70">
                        • Sync: {formatLastSync(lastSyncTime)}
                    </span>
                )}

                {/* Badge pour actions en attente */}
                {pendingActions > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-orange-500 text-white text-xs"
                    >
                        <Bell className="h-3 w-3" />
                        <span>{pendingActions}</span>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};
