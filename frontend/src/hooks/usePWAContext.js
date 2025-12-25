import { useState, useEffect } from 'react';

/**
 * Hook pour détecter le contexte PWA et déterminer l'accès aux fonctionnalités citoyennes
 * 
 * DÉTECTION PWA:
 * - Vérifie si l'app est en mode standalone (installée)
 * - Détecte le type d'appareil (mobile/desktop)
 * - Combine les conditions pour autoriser l'accès
 * 
 * CONTRAINTE:
 * - Les fonctionnalités citoyennes sont UNIQUEMENT accessibles en mode PWA installé
 * - Elles sont masquées complètement en mode navigateur web classique
 */

/**
 * Détecte si l'application est en mode PWA (standalone/installed)
 * Compatible Android, iOS, et Desktop PWA
 */
const detectPWAMode = () => {
    // Méthode 1: display-mode media query (standard, plus fiable)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Méthode 2: Propriété spécifique iOS
    const isIOSStandalone = window.navigator.standalone === true;

    // Méthode 3: Vérifier si lancé depuis l'écran d'accueil (Android)
    const isAndroidPWA = window.matchMedia('(display-mode: standalone)').matches ||
        document.referrer.includes('android-app://');

    return isStandalone || isIOSStandalone || isAndroidPWA;
};

/**
 * Détecte si l'appareil est un mobile
 */
const detectMobileDevice = () => {
    // User Agent detection (méthode classique)
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    // Regex pour détecter les appareils mobiles
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
    const isMobileUA = mobileRegex.test(userAgent);

    // Détection basée sur le tactile et la taille d'écran
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;

    return isMobileUA || (isTouchDevice && isSmallScreen);
};

/**
 * Détecte si l'appareil est un desktop
 */
const detectDesktopDevice = () => {
    return !detectMobileDevice();
};

/**
 * Hook React pour obtenir le contexte PWA
 * @returns {Object} Objet contenant l'état du contexte PWA
 */
export const usePWAContext = () => {
    const [pwaContext, setPwaContext] = useState({
        isPWA: false,
        isMobile: false,
        isDesktop: false,
        isBrowser: true,
        canAccessCitizenFeatures: false,
        isLoading: true
    });

    useEffect(() => {
        // Détection au montage du composant
        const detectContext = () => {
            const isPWA = detectPWAMode();
            const isMobile = detectMobileDevice();
            const isDesktop = detectDesktopDevice();
            const isBrowser = !isPWA;

            // Vérifier le rôle de l'utilisateur stocké
            let userRole = null;
            try {
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    userRole = user.role;
                }
            } catch (e) {
                console.error('Erreur lors de la lecture du rôle utilisateur:', e);
            }

            // Alternative: vérifier aussi le rôle stocké directement
            if (!userRole) {
                userRole = localStorage.getItem('role');
            }

            // RÈGLE: Accès citoyen = PWA installée ET (pas de rôle OU rôle CITOYEN)
            // Bloquer explicitement les ADMIN et PROFESSIONNEL
            const isBlocked = userRole === 'ADMIN' || userRole === 'PROFESSIONNEL' ||
                userRole === 'admin' || userRole === 'professionnel';

            const canAccessCitizenFeatures = isPWA && !isBlocked;

            setPwaContext({
                isPWA,
                isMobile,
                isDesktop,
                isBrowser,
                canAccessCitizenFeatures,
                isLoading: false
            });

            // Logs de débogage
            console.log('🔍 PWA Context Detection:', {
                isPWA,
                isMobile,
                isDesktop,
                isBrowser,
                userRole,
                isBlocked,
                canAccessCitizenFeatures
            });
        };

        detectContext();

        // Écouter les changements de mode d'affichage
        const mediaQueryList = window.matchMedia('(display-mode: standalone)');
        const handleDisplayModeChange = () => {
            console.log('📱 Display mode changed, re-detecting...');
            detectContext();
        };

        // Ajouter l'écouteur (compatible avec les anciens navigateurs)
        if (mediaQueryList.addEventListener) {
            mediaQueryList.addEventListener('change', handleDisplayModeChange);
        } else {
            // Fallback pour les navigateurs plus anciens
            mediaQueryList.addListener(handleDisplayModeChange);
        }

        // Nettoyage
        return () => {
            if (mediaQueryList.removeEventListener) {
                mediaQueryList.removeEventListener('change', handleDisplayModeChange);
            } else {
                mediaQueryList.removeListener(handleDisplayModeChange);
            }
        };
    }, []);

    return pwaContext;
};

/**
 * Fonction utilitaire pour vérifier le contexte PWA de manière synchrone
 * Utile pour les cas où le hook ne peut pas être utilisé
 */
export const checkPWAContext = () => {
    const isPWA = detectPWAMode();
    const isMobile = detectMobileDevice();
    const isDesktop = detectDesktopDevice();

    // Vérifier le rôle utilisateur
    let userRole = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            userRole = user.role;
        }
    } catch (e) {
        // Ignorer les erreurs
    }

    if (!userRole) {
        userRole = localStorage.getItem('role');
    }

    // Bloquer les admin et professionnels
    const isBlocked = userRole === 'ADMIN' || userRole === 'PROFESSIONNEL' ||
        userRole === 'admin' || userRole === 'professionnel';

    return {
        isPWA,
        isMobile,
        isDesktop,
        isBrowser: !isPWA,
        canAccessCitizenFeatures: isPWA && !isBlocked
    };
};

export default usePWAContext;
