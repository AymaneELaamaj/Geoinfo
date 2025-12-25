import { useState } from 'react';
import { AlertCircle, Key, Check, X } from 'lucide-react';

/**
 * Modal pour récupérer un UUID citoyen perdu
 * Utilisé quand l'utilisateur a effacé ses données localStorage
 * ou veut accéder à ses incidents depuis un autre appareil
 */
const RecoverUuidModal = ({ isOpen, onClose, onRecover }) => {
    const [inputUuid, setInputUuid] = useState('');
    const [error, setError] = useState('');
    const [isValidating, setIsValidating] = useState(false);

    if (!isOpen) return null;

    // Valider le format UUID v4
    const validateUuidFormat = (uuid) => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    // Gérer la soumission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Valider le format
        if (!validateUuidFormat(inputUuid.trim())) {
            setError('Format d\'identifiant invalide. Veuillez vérifier et réessayer.');
            return;
        }

        setIsValidating(true);

        try {
            // Vérifier que l'UUID existe en base (qu'il a au moins 1 incident)
            const response = await fetch(
                `http://localhost:8085/api/citoyens/incidents/device/${inputUuid.trim()}`
            );

            if (!response.ok) {
                if (response.status === 429) {
                    throw new Error('Trop de tentatives. Veuillez réessayer dans 1 heure.');
                }
                throw new Error('Aucun incident trouvé pour cet identifiant');
            }

            const incidents = await response.json();

            if (incidents.length === 0) {
                throw new Error('Aucun incident trouvé pour cet identifiant');
            }

            // Sauvegarder dans localStorage
            localStorage.setItem('citizen_device_id', inputUuid.trim());

            console.log(`✅ Compte récupéré ! ${incidents.length} incident(s) retrouvé(s)`);

            // Notifier le parent avec l'UUID
            onRecover(inputUuid.trim(), incidents.length);

            // Fermer le modal
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsValidating(false);
        }
    };

    // Fermer avec Escape
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem'
                }}
                onClick={onClose}
            >
                {/* Modal */}
                <div
                    style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        maxWidth: '500px',
                        width: '100%',
                        padding: '2rem',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        position: 'relative'
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={handleKeyDown}
                >
                    {/* Bouton fermer */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '0.5rem',
                            borderRadius: '6px',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6';
                            e.currentTarget.style.color = '#111827';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#6b7280';
                        }}
                    >
                        <X size={20} />
                    </button>

                    {/* En-tête */}
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <div
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem'
                            }}
                        >
                            <Key size={32} style={{ color: '#3b82f6' }} />
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Récupérer mes incidents
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '0.9375rem' }}>
                            Saisissez votre identifiant de suivi pour retrouver vos incidents
                        </p>
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label
                                htmlFor="uuid-input"
                                style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem',
                                    color: '#374151'
                                }}
                            >
                                Identifiant de suivi
                            </label>
                            <input
                                id="uuid-input"
                                type="text"
                                value={inputUuid}
                                onChange={(e) => {
                                    setInputUuid(e.target.value);
                                    setError('');
                                }}
                                placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: `1px solid ${error ? '#ef4444' : '#d1d5db'}`,
                                    borderRadius: '8px',
                                    fontSize: '0.9375rem',
                                    fontFamily: 'monospace',
                                    outline: 'none',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => {
                                    if (!error) {
                                        e.currentTarget.style.borderColor = '#3b82f6';
                                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                                    }
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = error ? '#ef4444' : '#d1d5db';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                autoFocus
                            />
                            <p style={{
                                fontSize: '0.75rem',
                                color: '#6b7280',
                                marginTop: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                            }}>
                                <AlertCircle size={12} />
                                Format attendu : 8-4-4-4-12 caractères hexadécimaux
                            </p>
                        </div>

                        {/* Message d'erreur */}
                        {error && (
                            <div
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '8px',
                                    marginBottom: '1.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    color: '#dc2626',
                                    fontSize: '0.875rem'
                                }}
                            >
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Boutons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: 'white',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '8px',
                                    fontSize: '0.9375rem',
                                    fontWeight: '500',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                }}
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={isValidating || !inputUuid.trim()}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: isValidating || !inputUuid.trim() ? '#9ca3af' : '#3b82f6',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '0.9375rem',
                                    fontWeight: '500',
                                    color: 'white',
                                    cursor: isValidating || !inputUuid.trim() ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isValidating && inputUuid.trim()) {
                                        e.currentTarget.style.backgroundColor = '#2563eb';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isValidating && inputUuid.trim()) {
                                        e.currentTarget.style.backgroundColor = '#3b82f6';
                                    }
                                }}
                            >
                                {isValidating ? (
                                    <>
                                        <div
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid white',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }}
                                        />
                                        Vérification...
                                    </>
                                ) : (
                                    <>
                                        <Check size={16} />
                                        Valider
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Information supplémentaire */}
                    <div
                        style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: '#f9fafb',
                            borderRadius: '8px',
                            fontSize: '0.8125rem',
                            color: '#6b7280',
                            lineHeight: '1.5'
                        }}
                    >
                        <strong style={{ color: '#374151' }}>💡 Astuce :</strong> Vous pouvez retrouver
                        votre identifiant sur l'appareil où vous avez déclaré vos incidents.
                        Il est affiché en haut de la page "Mes Incidents".
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
        </>
    );
};

export default RecoverUuidModal;
