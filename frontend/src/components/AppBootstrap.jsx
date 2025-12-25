import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirstTimeUser } from '../hooks/useFirstTimeUser';

/**
 * Composant Bootstrap pour gérer la redirection initiale
 * Redirige vers /welcome si c'est un nouvel utilisateur
 * Sinon, affiche les enfants normalement
 */
const AppBootstrap = ({ children }) => {
    const navigate = useNavigate();
    const { isFirstTime, isLoading } = useFirstTimeUser();

    useEffect(() => {
        if (!isLoading && isFirstTime) {
            // Nouveau utilisateur détecté → Redirection vers Welcome
            navigate('/welcome', { replace: true });
        }
    }, [isFirstTime, isLoading, navigate]);

    // Afficher un loader pendant la vérification
    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 1) 0%, rgba(30, 41, 59, 1) 100%)'
            }}>
                <div style={{
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.9)'
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        border: '4px solid rgba(96, 165, 250, 0.3)',
                        borderTopColor: '#3b82f6',
                        borderRadius: '50%',
                        margin: '0 auto 1rem',
                        animation: 'spin 1s linear infinite'
                    }} />
                    <p>Chargement...</p>
                </div>
            </div>
        );
    }

    return children;
};

export default AppBootstrap;
