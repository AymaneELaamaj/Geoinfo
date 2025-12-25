import { useState, useEffect } from 'react';

/**
 * Hook pour générer et persister un identifiant anonyme de citoyen
 * 
 * COMPORTEMENT:
 * - Génère un UUID v4 unique au premier lancement
 * - Stocke l'ID dans localStorage (persiste après redémarrage)
 * - Retourne toujours le même ID pour un appareil donné
 * - Si l'utilisateur efface les données, un nouvel ID est généré
 * 
 * CONFORMITÉ:
 * - Aucune donnée personnelle collectée
 * - Compatible RGPD (identifiant anonyme)
 * - Fonctionne sur Android, iOS, PWA
 */

const STORAGE_KEY = 'citizen_device_id';

/**
 * Génère un UUID v4 standard
 * Compatible avec tous les navigateurs modernes
 */
const generateUUID = () => {
    // Utiliser crypto.randomUUID si disponible (plus sécurisé)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    // Fallback pour navigateurs plus anciens
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/**
 * Hook React pour obtenir l'identifiant anonyme du citoyen
 * @returns {Object} { deviceId, isLoading, error }
 */
export const useCitizenDeviceId = () => {
    const [deviceId, setDeviceId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            // Vérifier si un ID existe déjà (ne pas générer automatiquement)
            let existingId = localStorage.getItem(STORAGE_KEY);

            if (existingId) {
                console.log('📱 Identifiant citoyen existant:', existingId);
                setDeviceId(existingId);
            } else {
                console.log('📱 Aucun identifiant trouvé - L\'utilisateur sera redirigé vers Welcome');
                setDeviceId(null);
            }
        } catch (err) {
            console.error('Erreur lors de la lecture de l\'identifiant citoyen:', err);
            setDeviceId(null);
            setError('Impossible de lire l\'identifiant (localStorage indisponible)');
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { deviceId, isLoading, error };
};

/**
 * Fonction utilitaire pour obtenir l'ID de manière synchrone
 * (utile pour les requêtes API hors composants React)
 */
export const getCitizenDeviceId = () => {
    try {
        let id = localStorage.getItem(STORAGE_KEY);
        if (!id) {
            id = generateUUID();
            localStorage.setItem(STORAGE_KEY, id);
        }
        return id;
    } catch {
        // Fallback si localStorage n'est pas disponible
        return generateUUID();
    }
};

export default useCitizenDeviceId;
