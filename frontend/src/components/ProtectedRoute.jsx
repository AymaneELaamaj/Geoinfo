import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authService from '../services/authService';

/**
 * Composant pour protéger les routes nécessitant une authentification
 * @param {Object} props - Props du composant
 * @param {React.Component} props.children - Composant à protéger
 * @param {string|string[]} props.requiredRole - Rôle(s) requis pour accéder
 * @param {boolean} props.adminOnly - Si true, n'autorise que les admins
 * @param {boolean} props.professionnelOnly - Si true, n'autorise que les professionnels
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  adminOnly = false, 
  professionnelOnly = false 
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // Attendre la vérification de l'authentification
  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="loading-spinner">Chargement...</div>
        </div>
      </div>
    );
  }

  // Vérifier l'authentification
  if (!isAuthenticated || !authService.isAuthenticated()) {
    return <Navigate to="/connexion" replace />;
  }

  const userRole = authService.getRole();

  // Vérifications de rôles spécifiques
  if (adminOnly && !authService.isAdmin()) {
    return <Navigate to="/" replace />;
  }

  if (professionnelOnly && !authService.isProfessionnel()) {
    return <Navigate to="/" replace />;
  }

  // Vérifier le rôle requis
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!allowedRoles.includes(userRole)) {
      // Redirection intelligente basée sur le rôle
      if (userRole === 'ADMIN') {
        return <Navigate to="/admin" replace />;
      } else if (userRole === 'PROFESSIONNEL') {
        return <Navigate to="/professionnel" replace />;
      } else {
        return <Navigate to="/" replace />;
      }
    }
  }

  return children;
};

export default ProtectedRoute;

