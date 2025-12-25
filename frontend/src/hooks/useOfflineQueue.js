import { useState, useEffect, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';

const QUEUE_STORAGE_KEY = 'offline-incident-queue';

/**
 * Hook pour gérer la file d'attente des incidents hors-ligne
 * Stocke les incidents en localStorage et les envoie automatiquement quand la connexion revient
 */
export const useOfflineQueue = (submitFunction) => {
    const { isOnline } = useOnlineStatus();
    const [queue, setQueue] = useState([]);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState(null);
    const [lastSyncResult, setLastSyncResult] = useState(null);

    // Charger la file d'attente depuis localStorage au montage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
            if (stored) {
                const parsedQueue = JSON.parse(stored);
                setQueue(parsedQueue);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la file d\'attente:', error);
        }
    }, []);

    // Sauvegarder la file d'attente dans localStorage à chaque modification
    useEffect(() => {
        try {
            localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
        } catch (error) {
            console.error('Erreur lors de la sauvegarde de la file d\'attente:', error);
        }
    }, [queue]);

    /**
     * Ajoute un incident à la file d'attente hors-ligne
     * @param {Object} incidentData - Les données de l'incident
     * @param {File|null} photo - La photo de l'incident (sera convertie en base64)
     * @returns {Promise<Object>} L'incident ajouté avec un ID temporaire
     */
    const addToQueue = useCallback(async (incidentData, photo = null) => {
        let photoBase64 = null;

        // Convertir la photo en base64 pour le stockage
        if (photo) {
            try {
                photoBase64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(photo);
                });
            } catch (error) {
                console.error('Erreur lors de la conversion de la photo:', error);
            }
        }

        const queueItem = {
            id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            incidentData,
            photoBase64,
            timestamp: new Date().toISOString(),
            attempts: 0
        };

        setQueue(prev => [...prev, queueItem]);

        return queueItem;
    }, []);

    /**
     * Retire un incident de la file d'attente
     * @param {string} id - L'ID de l'incident à retirer
     */
    const removeFromQueue = useCallback((id) => {
        setQueue(prev => prev.filter(item => item.id !== id));
    }, []);

    /**
     * Vide toute la file d'attente
     */
    const clearQueue = useCallback(() => {
        setQueue([]);
        localStorage.removeItem(QUEUE_STORAGE_KEY);
    }, []);

    /**
     * Synchronise la file d'attente avec le serveur
     * @returns {Promise<Object>} Résultat de la synchronisation
     */
    const syncQueue = useCallback(async () => {
        if (!submitFunction || queue.length === 0 || !isOnline) {
            return { success: true, synced: 0, failed: 0 };
        }

        setIsSyncing(true);
        setSyncError(null);

        const results = {
            success: true,
            synced: 0,
            failed: 0,
            errors: []
        };

        for (const item of queue) {
            try {
                // Reconvertir le base64 en File si nécessaire
                let photo = null;
                if (item.photoBase64) {
                    const response = await fetch(item.photoBase64);
                    const blob = await response.blob();
                    photo = new File([blob], 'incident-photo.jpg', { type: 'image/jpeg' });
                }

                // Envoyer l'incident via la fonction fournie
                await submitFunction(item.incidentData, photo);

                // Retirer de la file d'attente si succès
                removeFromQueue(item.id);
                results.synced++;

            } catch (error) {
                console.error(`Erreur lors de l'envoi de l'incident ${item.id}:`, error);
                results.failed++;
                results.errors.push({
                    id: item.id,
                    error: error.message
                });

                // Incrémenter le compteur de tentatives
                setQueue(prev => prev.map(q =>
                    q.id === item.id
                        ? { ...q, attempts: q.attempts + 1, lastError: error.message }
                        : q
                ));
            }
        }

        results.success = results.failed === 0;
        setLastSyncResult(results);
        setIsSyncing(false);

        if (results.failed > 0) {
            setSyncError(`${results.failed} incident(s) n'ont pas pu être envoyés`);
        }

        return results;
    }, [submitFunction, queue, isOnline, removeFromQueue]);

    // Synchroniser automatiquement quand la connexion revient
    useEffect(() => {
        if (isOnline && queue.length > 0 && !isSyncing) {
            // Délai pour éviter de synchroniser immédiatement (laisser le réseau se stabiliser)
            const timeout = setTimeout(() => {
                syncQueue();
            }, 2000);

            return () => clearTimeout(timeout);
        }
    }, [isOnline, queue.length, isSyncing, syncQueue]);

    return {
        queue,
        queueLength: queue.length,
        hasQueuedItems: queue.length > 0,
        isSyncing,
        syncError,
        lastSyncResult,
        addToQueue,
        removeFromQueue,
        clearQueue,
        syncQueue
    };
};

export default useOfflineQueue;
