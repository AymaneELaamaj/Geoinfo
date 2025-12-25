import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour détecter l'état de la connexion réseau
 * @returns {Object} { isOnline, wasOffline }
 */
export const useOnlineStatus = () => {
    const [isOnline, setIsOnline] = useState(
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            // Si on était hors-ligne avant, marquer cette info
            setWasOffline(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setWasOffline(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    /**
     * Réinitialise l'indicateur wasOffline
     */
    const clearWasOffline = useCallback(() => {
        setWasOffline(false);
    }, []);

    return {
        isOnline,
        wasOffline,
        clearWasOffline
    };
};

export default useOnlineStatus;
