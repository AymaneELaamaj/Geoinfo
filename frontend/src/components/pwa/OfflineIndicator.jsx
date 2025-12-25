import { WifiOff, RefreshCw, CloudOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

/**
 * Indicateur de mode hors-ligne
 * Affiche une bannière quand l'utilisateur est déconnecté
 */
const OfflineIndicator = ({ queueLength = 0 }) => {
    const { isOnline } = useOnlineStatus();

    // Ne pas afficher si en ligne
    if (isOnline) {
        return null;
    }

    return (
        <div className="offline-indicator">
            <div className="offline-content">
                <WifiOff size={20} />
                <span>
                    Vous êtes hors-ligne
                    {queueLength > 0 && (
                        <> — <strong>{queueLength}</strong> incident(s) en attente d'envoi</>
                    )}
                </span>
            </div>
            <div className="offline-hint">
                <CloudOff size={16} />
                <span>Les données seront synchronisées à la reconnexion</span>
            </div>
        </div>
    );
};

/**
 * Indicateur de synchronisation
 * Affiche une bannière quand les données se synchronisent
 */
export const SyncIndicator = ({ isSyncing, syncResult }) => {
    if (!isSyncing && !syncResult) {
        return null;
    }

    if (isSyncing) {
        return (
            <div className="sync-indicator syncing">
                <RefreshCw size={18} className="spin" />
                <span>Synchronisation en cours...</span>
            </div>
        );
    }

    if (syncResult && syncResult.synced > 0) {
        return (
            <div className="sync-indicator success">
                <span>✓ {syncResult.synced} incident(s) envoyé(s) avec succès</span>
            </div>
        );
    }

    return null;
};

export default OfflineIndicator;
