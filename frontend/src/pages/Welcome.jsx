import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, RefreshCw, Sparkles } from 'lucide-react';
import NewUserWelcome from '../components/NewUserWelcome';
import RecoverUuidModal from '../components/RecoverUuidModal';

/**
 * Page de bienvenue - Affichée uniquement à la première installation sur MOBILE/PWA
 * Sur desktop web, redirige automatiquement vers l'accueil
 * Permet de choisir entre "Nouveau utilisateur" ou "Utilisateur existant"
 */
const Welcome = () => {
    const navigate = useNavigate();
    const [showNewUserModal, setShowNewUserModal] = useState(false);
    const [showRecoverModal, setShowRecoverModal] = useState(false);
    const [generatedUuid, setGeneratedUuid] = useState('');

    // Vérifier si on est sur desktop web et rediriger
    useEffect(() => {
        const isPWA = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
            window.innerWidth <= 768;

        // Si on est sur desktop web (pas PWA et pas mobile), rediriger vers l'accueil
        if (!isPWA && !isMobile) {
            console.log('🖥️ Desktop web détecté - Redirection vers l\'accueil');

            // Générer automatiquement un UUID pour les utilisateurs desktop
            const existingUuid = localStorage.getItem('citizen_device_id');
            if (!existingUuid) {
                const uuid = generateUUID();
                localStorage.setItem('citizen_device_id', uuid);
                console.log('📱 UUID généré automatiquement pour desktop:', uuid);
            }

            localStorage.setItem('welcome_shown', 'true');
            navigate('/', { replace: true });
        }
    }, [navigate]);

    // Générer un UUID v4 pour un nouveau utilisateur
    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };

    // Gérer le choix "Nouveau utilisateur"
    const handleNewUser = () => {
        const uuid = generateUUID();
        localStorage.setItem('citizen_device_id', uuid);
        localStorage.setItem('welcome_shown', 'true');
        setGeneratedUuid(uuid);
        setShowNewUserModal(true);
    };

    // Gérer le choix "Utilisateur existant"
    const handleExistingUser = () => {
        setShowRecoverModal(true);
    };

    // Callback après récupération réussie
    const handleRecoverSuccess = (uuid) => {
        localStorage.setItem('welcome_shown', 'true');
        setShowRecoverModal(false);
        navigate('/mes-incidents');
    };

    // Continuer vers l'app après avoir vu l'UUID
    const handleContinue = () => {
        setShowNewUserModal(false);
        navigate('/');
    };

    return (
        <>
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 50%, rgba(51, 65, 85, 1) 100%)',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Fond animé avec particules */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at 30% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(96, 165, 250, 0.1) 0%, transparent 50%)',
                    animation: 'pulse 8s ease-in-out infinite',
                    pointerEvents: 'none'
                }} />

                {/* Contenu principal */}
                <div style={{
                    maxWidth: '500px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* En-tête */}
                    <div style={{
                        textAlign: 'center',
                        marginBottom: '3rem'
                    }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            marginBottom: '1.5rem',
                            boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
                            animation: 'float 3s ease-in-out infinite'
                        }}>
                            <Sparkles size={40} style={{ color: 'white' }} />
                        </div>
                        <h1 style={{
                            fontSize: '2rem',
                            fontWeight: '700',
                            color: 'rgba(255, 255, 255, 0.95)',
                            marginBottom: '1rem',
                            textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                        }}>
                            Bienvenue sur CityAlert
                        </h1>
                        <p style={{
                            fontSize: '1.125rem',
                            color: 'rgba(226, 232, 240, 0.8)',
                            lineHeight: '1.6'
                        }}>
                            Signalez et suivez les incidents de votre ville en toute simplicité
                        </p>
                    </div>

                    {/* Card principale */}
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.8) 100%)',
                        border: '1px solid rgba(96, 165, 250, 0.3)',
                        borderRadius: '16px',
                        padding: '2rem',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 1px rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <h2 style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: 'rgba(255, 255, 255, 0.95)',
                            marginBottom: '1.5rem',
                            textAlign: 'center'
                        }}>
                            Comment souhaitez-vous continuer ?
                        </h2>

                        {/* Bouton Nouveau utilisateur */}
                        <button
                            onClick={handleNewUser}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.25rem 1.5rem',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.0625rem',
                                fontWeight: '600',
                                color: 'white',
                                cursor: 'pointer',
                                marginBottom: '1rem',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.4)';
                            }}
                        >
                            <UserPlus size={24} />
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontSize: '1.0625rem', fontWeight: '700' }}>
                                    🆕 Nouveau utilisateur
                                </div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400' }}>
                                    Créer un nouvel identifiant
                                </div>
                            </div>
                        </button>

                        {/* Bouton Utilisateur existant */}
                        <button
                            onClick={handleExistingUser}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1.25rem 1.5rem',
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1.0625rem',
                                fontWeight: '600',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.4)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.6)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.4)';
                            }}
                        >
                            <RefreshCw size={24} />
                            <div style={{ flex: 1, textAlign: 'left' }}>
                                <div style={{ fontSize: '1.0625rem', fontWeight: '700' }}>
                                    🔄 Utilisateur existant
                                </div>
                                <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: '400' }}>
                                    Récupérer mon identifiant
                                </div>
                            </div>
                        </button>

                        {/* Info */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            border: '1px solid rgba(96, 165, 250, 0.2)',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            color: 'rgba(147, 197, 253, 0.9)',
                            lineHeight: '1.5'
                        }}>
                            <strong>💡 À savoir :</strong> Votre identifiant unique vous permet de retrouver tous vos incidents déclarés, même si vous changez d'appareil ou de navigateur.
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showNewUserModal && (
                <NewUserWelcome
                    uuid={generatedUuid}
                    onContinue={handleContinue}
                />
            )}

            {showRecoverModal && (
                <RecoverUuidModal
                    isOpen={showRecoverModal}
                    onClose={() => setShowRecoverModal(false)}
                    onRecover={handleRecoverSuccess}
                />
            )}

            {/* Animations CSS */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.6; }
                    50% { opacity: 1; }
                }
                
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
            `}</style>
        </>
    );
};

export default Welcome;
