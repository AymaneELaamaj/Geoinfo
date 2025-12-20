import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, LogOut, User, Shield, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Composant de navigation principal de l'application
 * S'adapte selon l'état d'authentification et le rôle de l'utilisateur
 */
const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  /**
   * Vérifie si un lien est actif
   */
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  /**
   * Gère la déconnexion
   */
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <AlertCircle size={24} />
          </div>
          <span className="brand-text">Gestion Incidents</span>
        </Link>
        
        <ul className="navbar-menu">
          {/* Liens publics - toujours visibles */}
          <li>
            <Link to="/" className={isActive('/')}>
              Accueil
            </Link>
          </li>
          <li>
            <Link to="/tableau-de-bord" className={isActive('/tableau-de-bord')}>
              Tableau de bord
            </Link>
          </li>
          <li>
            <Link to="/incidents" className={isActive('/incidents')}>
              Incidents
            </Link>
          </li>
          <li>
            <Link to="/declarer-incident" className={isActive('/declarer-incident')}>
              Déclarer un incident
            </Link>
          </li>
          <li>
            <Link to="/carte" className={isActive('/carte')}>
              Carte SIG
            </Link>
          </li>

          {/* Liens spécifiques selon l'authentification */}
          {isAuthenticated() ? (
            <>
              {/* Lien selon le rôle */}
              {user?.role === 'admin' && (
                <li>
                  <Link to="/admin" className={isActive('/admin')}>
                    <Shield size={18} style={{ marginRight: '0.25rem' }} />
                    Administration
                  </Link>
                </li>
              )}
              {user?.role === 'professionnel' && (
                <li>
                  <Link to="/pro" className={isActive('/pro')}>
                    <Briefcase size={18} style={{ marginRight: '0.25rem' }} />
                    Mes Incidents
                  </Link>
                </li>
              )}

              {/* Informations utilisateur et déconnexion */}
              <li className="nav-user-info">
                <User size={18} />
                <span>{user?.prenom} {user?.nom}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="nav-logout-btn">
                  <LogOut size={18} />
                  Déconnexion
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/connexion" className={`${isActive('/connexion')} nav-connexion-link`}>
                Connexion
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;

