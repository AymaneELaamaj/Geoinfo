import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour détecter si l'application est en mode PWA/Standalone
 * 
 * Détecte plusieurs scénarios :
 * - PWA installée sur desktop (display-mode: standalone)
 * - PWA installée sur iOS (window.navigator.standalone)
 * - PWA lancée depuis Android
 * - Mobile browser (détection de taille d'écran)
 * 
 * @returns {boolean} true si l'app est en mode PWA ou mobile
 */
export const useIsPWA = () => {
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        // Vérifier si l'app est en mode standalone (PWA installée)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

        // Vérifier si c'est Safari iOS en mode standalone
        const isIOSStandalone = window.navigator.standalone === true;

        // Vérifier si lancé depuis une app Android
        const isAndroidApp = document.referrer.includes('android-app://');

        // Vérifier si c'est un écran mobile (largeur < 768px)
        const isMobileScreen = window.innerWidth < 768;

        // L'app est considérée comme PWA si :
        // 1. Elle est en mode standalone (PWA installée)
        // 2. OU elle est sur mobile (pour faciliter les tests)
        const result = isStandalone || isIOSStandalone || isAndroidApp || isMobileScreen;

        console.log('🔍 Détection PWA:', {
            isStandalone,
            isIOSStandalone,
            isAndroidApp,
            isMobileScreen,
            isPWA: result
        });

        setIsPWA(result);

        // Écouter les changements de taille d'écran
        const handleResize = () => {
            const newIsMobileScreen = window.innerWidth < 768;
            const newResult = isStandalone || isIOSStandalone || isAndroidApp || newIsMobileScreen;
            setIsPWA(newResult);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return isPWA;
};

/**
 * Utilitaire pour vérifier si on est en mode PWA (sans hook)
 * Utile pour les composants qui n'ont pas accès aux hooks
 */
export const checkIsPWA = () => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = window.navigator.standalone === true;
    const isAndroidApp = document.referrer.includes('android-app://');
    const isMobileScreen = window.innerWidth < 768;

    return isStandalone || isIOSStandalone || isAndroidApp || isMobileScreen;
};
