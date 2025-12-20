import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, AuthManager } from '../services/api';

/**
 * Context d'authentification
 * Gère l'état de connexion et les informations utilisateur
 */
export const AuthContext = createContext();

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

/**
 * Provider du contexte d'authentification
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Vérifie si un utilisateur est déjà connecté au montage
   */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Connexion d'un utilisateur via l'API backend
   * @param {string} email - Email de l'utilisateur
   * @param {string} password - Mot de passe
   * @returns {Promise<Object>} Utilisateur connecté ou erreur
   */
  const login = async (email, password) => {
    setLoading(true);
    
    try {
      // Appel à l'API backend - utiliser motDePasse au lieu de password
      const response = await authAPI.login({ email, motDePasse: password });
      
      // La fonction authAPI.login stocke déjà les données dans localStorage
      const userData = {
        ...response.utilisateur,
        token: response.token,
      };
      
      setUser(userData);
      setLoading(false);
      return userData;

    } catch (error) {
      setLoading(false);
      console.error('Erreur de connexion:', error);
      throw new Error(error.message || 'Email ou mot de passe incorrect');
    }
  };

  /**
   * Déconnexion de l'utilisateur
   */
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
    setUser(null);
    localStorage.removeItem('user');
  };

  /**
   * Vérifie si l'utilisateur est connecté
   */
  const isAuthenticated = () => {
    return user !== null;
  };

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   * @param {string} role - Rôle à vérifier
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

