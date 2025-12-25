import { useState } from 'react';
import { Copy, Check, ArrowRight, Key, Shield } from 'lucide-react';

/**
 * Modal d'information pour les nouveaux utilisateurs
 * Affiche l'UUID généré avec instructions pour le conserver
 */
const NewUserWelcome = ({ uuid, onContinue }) => {
    const [copied, setCopied] = useState(false);

    const copyUUID = async () => {
        try {
            await navigator.clipboard.writeText(uuid);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            console.error('Erreur copie UUID:', err);
        }
    };

    return (
        <>
            {/* Overlay */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)',
                zIndex: 2000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backdropFilter: 'blur(4px)'
            }}>
                {/* Modal */}
                <div style={{
                    backgroundColor: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%)',
                    background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.98) 0%, rgba(51, 65, 85, 0.95) 100%)',
                    border: '1px solid rgba(96, 165, 250, 0.3)',
                    borderRadius: '16px',
                    maxWidth: '550px',
                    width: '100%',
                    padding: '2.5rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(96, 165, 250, 0.5)',
                    position: 'relative',
                    animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    {/* Icône en-tête */}
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        boxShadow: '0 8px 32px rgba(16, 185, 129, 0.4)'
                    }}>
                        <Key size={40} style={{ color: 'white' }} />
                    </div>

                    {/* Titre */}
                    <h2 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: 'rgba(255, 255, 255, 0.95)',
                        marginBottom: '0.75rem',
                        textAlign: 'center',
                        textShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                    }}>
                        🎉 Votre identifiant de suivi a été créé
                    </h2>

                    <p style={{
                        fontSize: '1rem',
                        color: 'rgba(226, 232, 240, 0.8)',
                        textAlign: 'center',
                        marginBottom: '2rem',
                        lineHeight: '1.6'
                    }}>
                        Conservez précieusement cet identifiant. Il vous permettra de retrouver tous vos incidents déclarés si vous changez d'appareil ou de navigateur.
                    </p>

                    {/* UUID Display */}
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1.5rem',
                        background: 'rgba(15, 23, 42, 0.8)',
                        border: '2px solid rgba(96, 165, 250, 0.4)',
                        borderRadius: '12px',
                        boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(59, 130, 246, 0.2)'
                    }}>
                        <label style={{
                            display: 'block',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: 'rgba(147, 197, 253, 0.9)',
                            marginBottom: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em'
                        }}>
                            🔑 Votre identifiant unique
                        </label>
                        <code style={{
                            display: 'block',
                            padding: '1rem',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(96, 165, 250, 0.2)',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontFamily: 'monospace',
                            color: 'rgba(147, 197, 253, 1)',
                            textAlign: 'center',
                            wordBreak: 'break-all',
                            fontWeight: '600',
                            letterSpacing: '0.02em'
                        }}>
                            {uuid}
                        </code>
                    </div>

                    {/* Bouton Copier */}
                    <button
                        onClick={copyUUID}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1rem 1.5rem',
                            background: copied
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            marginBottom: '1rem',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: copied
                                ? '0 4px 20px rgba(16, 185, 129, 0.5)'
                                : '0 4px 20px rgba(59, 130, 246, 0.5)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = copied
                                ? '0 8px 32px rgba(16, 185, 129, 0.7)'
                                : '0 8px 32px rgba(59, 130, 246, 0.7)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = copied
                                ? '0 4px 20px rgba(16, 185, 129, 0.5)'
                                : '0 4px 20px rgba(59, 130, 246, 0.5)';
                        }}
                    >
                        {copied ? (
                            <>
                                <Check size={20} />
                                Copié dans le presse-papiers !
                            </>
                        ) : (
                            <>
                                <Copy size={20} />
                                Copier l'identifiant
                            </>
                        )}
                    </button>

                    {/* Avertissement de sécurité */}
                    <div style={{
                        padding: '1rem 1.25rem',
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1.5px solid rgba(245, 158, 11, 0.4)',
                        borderRadius: '10px',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start'
                    }}>
                        <Shield size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.125rem' }} />
                        <div>
                            <p style={{
                                fontSize: '0.875rem',
                                color: 'rgba(253, 230, 138, 0.95)',
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                <strong>⚠️ Important :</strong> Notez cet identifiant dans un endroit sûr (email, notes, photo...). Sans lui, vous ne pourrez pas récupérer vos incidents sur un autre appareil.
                            </p>
                        </div>
                    </div>

                    {/* Bouton Continuer */}
                    <button
                        onClick={onContinue}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            padding: '1rem 1.5rem',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.5)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 8px 32px rgba(16, 185, 129, 0.7)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(16, 185, 129, 0.5)';
                        }}
                    >
                        J'ai compris, continuer
                        <ArrowRight size={20} />
                    </button>
                </div>
            </div>

            {/* Animation CSS */}
            <style>{`
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </>
    );
};

export default NewUserWelcome;
