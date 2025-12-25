import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkIsPWA } from '../hooks/useIsPWA';

/**
 * Composant de garde pour protéger les routes sur PWA
 * Redirige les utilisateurs PWA essayant d'accéder aux pages admin/professionnel
 * 
 * Utilisation :
 * <Route path="/admin/*" element={<CitizenPWAGuard><AdminRoutes /></CitizenPWAGuard>} />
 */
const CitizenPWAGuard = ({ children }) => {
    const navigate = useNavigate();

    useEffect(() => {
        const isPWA = checkIsPWA();

        if (isPWA) {
            console.warn('⛔ Accès bloqué : Cette page n\'est pas accessible sur mobile/PWA');
            console.log('🔄 Redirection vers le tableau de bord citoyen...');

            // Rediriger vers le tableau de bord citoyen
            navigate('/tableau-de-bord', { replace: true });
        }
    }, [navigate]);

    // Si PWA, ne rien render (redirection en cours)
    if (checkIsPWA()) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                padding: '2rem',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
                    ⛔ Accès non autorisé
                </h2>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                    Cette page n'est pas accessible depuis l'application mobile.
                </p>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                    Redirection en cours...
                </p>
            </div>
        );
    }

    // Si desktop, afficher normalement
    return children;
};

export default CitizenPWAGuard;
