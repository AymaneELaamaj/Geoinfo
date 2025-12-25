import { Link, useLocation } from 'react-router-dom';
import { Home, AlertCircle, Map, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Barre de navigation mobile en bas de l'écran
 * Visible uniquement sur les petits écrans
 */
const BottomNavBar = () => {
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    // Vérifie si un lien est actif
    const isActive = (path) => location.pathname === path;

    // Vérifie si l'utilisateur peut déclarer un incident
    const canDeclare = !isAuthenticated() ||
        (user?.role !== 'ADMIN' && user?.role !== 'PROFESSIONNEL' &&
            user?.role !== 'admin' && user?.role !== 'professionnel');

    return (
        <nav className="bottom-nav-bar">
            <Link
                to="/"
                className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}
            >
                <Home size={22} />
                <span>Accueil</span>
            </Link>

            <Link
                to="/tableau-de-bord"
                className={`bottom-nav-item ${isActive('/tableau-de-bord') ? 'active' : ''}`}
            >
                <BarChart3 size={22} />
                <span>Stats</span>
            </Link>

            {canDeclare && (
                <Link
                    to="/declarer-incident"
                    className={`bottom-nav-item bottom-nav-primary ${isActive('/declarer-incident') ? 'active' : ''}`}
                >
                    <div className="bottom-nav-primary-icon">
                        <Plus size={26} />
                    </div>
                    <span>Signaler</span>
                </Link>
            )}

            <Link
                to="/incidents"
                className={`bottom-nav-item ${isActive('/incidents') ? 'active' : ''}`}
            >
                <AlertCircle size={22} />
                <span>Incidents</span>
            </Link>

            <Link
                to="/carte"
                className={`bottom-nav-item ${isActive('/carte') ? 'active' : ''}`}
            >
                <Map size={22} />
                <span>Carte</span>
            </Link>
        </nav>
    );
};

export default BottomNavBar;
