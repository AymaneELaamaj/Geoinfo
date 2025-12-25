import { useState, useEffect } from 'react';

/**
 * Hook pour détecter si c'est la première visite de l'utilisateur
 * Vérifie si :
 * 1. Aucun UUID n'existe dans localStorage
 * 2. La page de bienvenue n'a jamais été affichée
 * 3. L'utilisateur est sur mobile ou en mode PWA (pas sur desktop web)
 */
export const useFirstTimeUser = () => {
    const [isFirstTime, setIsFirstTime] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        try {
            const hasUuid = localStorage.getItem('citizen_device_id');
            const welcomeShown = localStorage.getItem('welcome_shown');

            // Vérifier si on est en mode PWA ou mobile
            const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true; // iOS

            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                window.innerWidth <= 768;

            // C'est un nouvel utilisateur si :
            // - Aucun UUID n'existe (peu importe si welcome a déjà été montré)
            // - ET l'utilisateur est sur mobile ou en mode PWA
            // CHANGEMENT: On ignore welcomeShown car l'utilisateur pourrait réinstaller l'app
            const isNewUser = !hasUuid;
            const shouldShowWelcome = isNewUser && (isPWA || isMobile);

            console.log('🔍 Détection Welcome Page:', {
                hasUuid,
                welcomeShown,
                isPWA,
                isMobile,
                isNewUser,
                shouldShowWelcome
            });

            setIsFirstTime(shouldShowWelcome);
        } catch (err) {
            console.error('Erreur lors de la vérification première visite:', err);
            setIsFirstTime(false);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isFirstTime, isLoading };
};

export default useFirstTimeUser;
