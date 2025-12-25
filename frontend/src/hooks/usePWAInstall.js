import { useState, useEffect, useCallback } from 'react';

/**
 * Hook pour gérer l'installation PWA
 * Détecte l'événement beforeinstallprompt et expose une fonction pour déclencher l'installation
 */
export const usePWAInstall = () => {
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isInstallable, setIsInstallable] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Vérifier si l'app est déjà en mode standalone (installée)
        const checkIfInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true;
            setIsInstalled(isStandalone);
        };

        checkIfInstalled();

        // Écouter l'événement beforeinstallprompt
        const handleBeforeInstallPrompt = (e) => {
            // Empêcher l'affichage automatique du prompt
            e.preventDefault();
            // Stocker l'événement pour l'utiliser plus tard
            setInstallPrompt(e);
            setIsInstallable(true);
        };

        // Écouter l'événement appinstalled
        const handleAppInstalled = () => {
            setIsInstalled(true);
            setIsInstallable(false);
            setInstallPrompt(null);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // Écouter les changements de mode d'affichage
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        mediaQuery.addEventListener('change', checkIfInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
            mediaQuery.removeEventListener('change', checkIfInstalled);
        };
    }, []);

    /**
     * Déclenche le prompt d'installation
     * @returns {Promise<boolean>} true si l'utilisateur a accepté, false sinon
     */
    const promptInstall = useCallback(async () => {
        if (!installPrompt) {
            console.warn('Aucun prompt d\'installation disponible');
            return false;
        }

        try {
            // Afficher le prompt d'installation
            installPrompt.prompt();

            // Attendre la réponse de l'utilisateur
            const { outcome } = await installPrompt.userChoice;

            if (outcome === 'accepted') {
                console.log('L\'utilisateur a accepté l\'installation');
                setIsInstallable(false);
                setInstallPrompt(null);
                return true;
            } else {
                console.log('L\'utilisateur a refusé l\'installation');
                return false;
            }
        } catch (error) {
            console.error('Erreur lors de l\'installation:', error);
            return false;
        }
    }, [installPrompt]);

    /**
     * Ferme la bannière d'installation (sans installer)
     */
    const dismissInstall = useCallback(() => {
        setIsInstallable(false);
        // Stocker en sessionStorage pour ne pas réafficher pendant cette session
        sessionStorage.setItem('pwa-install-dismissed', 'true');
    }, []);

    /**
     * Vérifie si la bannière a été fermée cette session
     */
    const isDismissed = useCallback(() => {
        return sessionStorage.getItem('pwa-install-dismissed') === 'true';
    }, []);

    return {
        isInstallable: isInstallable && !isDismissed(),
        isInstalled,
        promptInstall,
        dismissInstall
    };
};

export default usePWAInstall;
