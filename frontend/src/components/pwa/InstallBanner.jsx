import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

/**
 * Bannière d'installation PWA
 * Affiche un bouton pour installer l'application sur l'appareil
 */
const InstallBanner = () => {
    const { isInstallable, isInstalled, promptInstall, dismissInstall } = usePWAInstall();

    // Ne pas afficher si déjà installé ou non installable
    if (isInstalled || !isInstallable) {
        return null;
    }

    const handleInstall = async () => {
        const accepted = await promptInstall();
        if (accepted) {
            console.log('Application installée avec succès');
        }
    };

    return (
        <div className="pwa-install-banner">
            <div className="pwa-install-content">
                <div className="pwa-install-icon">
                    <Download size={24} />
                </div>
                <div className="pwa-install-text">
                    <strong>Installer CityAlert</strong>
                    <span>Accédez rapidement à l'application depuis votre écran d'accueil</span>
                </div>
            </div>
            <div className="pwa-install-actions">
                <button
                    onClick={handleInstall}
                    className="pwa-install-btn"
                >
                    Installer
                </button>
                <button
                    onClick={dismissInstall}
                    className="pwa-dismiss-btn"
                    aria-label="Fermer"
                >
                    <X size={20} />
                </button>
            </div>
        </div>
    );
};

export default InstallBanner;
