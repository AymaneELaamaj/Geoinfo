import { usePWAContext } from '../hooks/usePWAContext';
import { Smartphone, Monitor, Download, Info, AlertCircle } from 'lucide-react';

/**
 * Composant de garde PWA
 * 
 * FONCTIONNALITÉ:
 * - Affiche le contenu uniquement si l'app est en mode PWA
 * - Affiche un message d'installation si accès depuis navigateur
 * - Fournit des instructions claires pour l'installation
 * 
 * USAGE:
 * <PWAGuard>
 *   <DeclarerIncident />
 * </PWAGuard>
 */
const PWAGuard = ({ children }) => {
    const { canAccessCitizenFeatures, isBrowser, isMobile, isLoading } = usePWAContext();

    // État de chargement
    if (isLoading) {
        return (
            <div className="page">
                <div className="container" style={{ maxWidth: '600px', textAlign: 'center', paddingTop: '4rem' }}>
                    <div className="card" style={{ padding: '3rem' }}>
                        <div style={{
                            display: 'inline-block',
                            width: '48px',
                            height: '48px',
                            border: '4px solid #e5e7eb',
                            borderTopColor: 'var(--primary-color)',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <p style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                            Détection du mode PWA...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Si l'utilisateur a accès (mode PWA), afficher le contenu
    if (canAccessCitizenFeatures) {
        return <>{children}</>;
    }

    // Si accès depuis navigateur, afficher le message d'installation
    return (
        <div className="page">
            <div className="container" style={{ maxWidth: '700px' }}>
                <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                    {/* Icône */}
                    <div style={{
                        display: 'inline-flex',
                        padding: '1.5rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '50%',
                        marginBottom: '1.5rem'
                    }}>
                        {isMobile ? (
                            <Smartphone size={48} style={{ color: '#3b82f6' }} />
                        ) : (
                            <Monitor size={48} style={{ color: '#3b82f6' }} />
                        )}
                    </div>

                    {/* Titre */}
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        marginBottom: '1rem',
                        color: 'var(--text-primary)'
                    }}>
                        📱 Installation de l'application requise
                    </h2>

                    {/* Description */}
                    <p style={{
                        fontSize: '1.125rem',
                        color: 'var(--text-secondary)',
                        marginBottom: '2rem',
                        lineHeight: '1.6'
                    }}>
                        Cette fonctionnalité est <strong>exclusivement disponible</strong> dans l'application mobile installée (PWA).
                        <br />
                        Veuillez installer l'application pour accéder à la déclaration d'incidents.
                    </p>

                    {/* Alerte informative */}
                    <div style={{
                        padding: '1.25rem',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        textAlign: 'left'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                            <Info size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.125rem' }} />
                            <div>
                                <h4 style={{
                                    fontSize: '0.9375rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    color: '#92400e'
                                }}>
                                    Pourquoi installer l'application ?
                                </h4>
                                <ul style={{
                                    fontSize: '0.875rem',
                                    color: '#78350f',
                                    marginLeft: '1.25rem',
                                    lineHeight: '1.6'
                                }}>
                                    <li>Accès rapide et hors-ligne</li>
                                    <li>Notifications en temps réel sur vos incidents</li>
                                    <li>Géolocalisation automatique précise</li>
                                    <li>Interface optimisée pour mobile</li>
                                    <li>Données sécurisées et anonymes</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Instructions d'installation */}
                    <div style={{
                        padding: '1.5rem',
                        backgroundColor: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        textAlign: 'left'
                    }}>
                        <h3 style={{
                            fontSize: '1.125rem',
                            fontWeight: '600',
                            marginBottom: '1rem',
                            color: '#065f46',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Download size={20} />
                            Comment installer l'application ?
                        </h3>

                        {isMobile ? (
                            // Instructions mobile
                            <div style={{ fontSize: '0.9375rem', color: '#047857', lineHeight: '1.7' }}>
                                <p style={{ marginBottom: '0.75rem' }}>
                                    <strong>📱 Sur Android (Chrome):</strong>
                                </p>
                                <ol style={{ marginLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                    <li>Appuyez sur le menu ⋮ (3 points verticaux)</li>
                                    <li>Sélectionnez <strong>"Installer l'application"</strong> ou <strong>"Ajouter à l'écran d'accueil"</strong></li>
                                    <li>Confirmez l'installation</li>
                                    <li>L'application apparaîtra sur votre écran d'accueil</li>
                                </ol>

                                <p style={{ marginBottom: '0.75rem' }}>
                                    <strong>🍎 Sur iOS (Safari):</strong>
                                </p>
                                <ol style={{ marginLeft: '1.5rem' }}>
                                    <li>Appuyez sur le bouton de partage <span style={{ fontSize: '1.25rem' }}>⎋</span></li>
                                    <li>Faites défiler et sélectionnez <strong>"Sur l'écran d'accueil"</strong></li>
                                    <li>Appuyez sur <strong>"Ajouter"</strong></li>
                                    <li>Ouvrez l'app depuis votre écran d'accueil</li>
                                </ol>
                            </div>
                        ) : (
                            // Instructions desktop
                            <div style={{ fontSize: '0.9375rem', color: '#047857', lineHeight: '1.7' }}>
                                <p style={{ marginBottom: '0.75rem' }}>
                                    <strong>💻 Sur ordinateur (Chrome, Edge):</strong>
                                </p>
                                <ol style={{ marginLeft: '1.5rem' }}>
                                    <li>Cliquez sur l'icône d'installation <strong>⊕</strong> dans la barre d'adresse</li>
                                    <li>Ou via le menu ⋮ → <strong>"Installer CityAlert"</strong></li>
                                    <li>Confirmez l'installation</li>
                                    <li>L'application s'ouvrira dans une fenêtre séparée</li>
                                </ol>
                            </div>
                        )}
                    </div>

                    {/* Note de confidentialité */}
                    <div style={{
                        padding: '1rem',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid rgba(59, 130, 246, 0.15)',
                        borderRadius: '8px',
                        fontSize: '0.875rem',
                        color: '#1e40af',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem'
                    }}>
                        <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                        <span>
                            <strong>Confidentialité garantie :</strong> Votre identifiant de suivi est anonyme et stocké uniquement sur votre appareil. Aucune donnée personnelle n'est collectée.
                        </span>
                    </div>
                </div>
            </div>

            {/* Animation CSS */}
            <style>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
};

export default PWAGuard;
