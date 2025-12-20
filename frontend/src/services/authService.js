// src/services/authService.js
import api from './api';

const authService = {
  // Connexion
  async login(email, motDePasse) {
    try {
      const response = await api.post('/auth/login', { email, motDePasse });
      const { token, role, utilisateur } = response.data;
      
      // Stocker dans localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      localStorage.setItem('user', JSON.stringify(utilisateur));
      
      return response.data;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  },
  
  // Déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    window.location.href = '/connexion';
  },
  
  // Récupérer utilisateur connecté
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Récupérer token
  getToken() {
    return localStorage.getItem('token');
  },
  
  // Récupérer rôle
  getRole() {
    return localStorage.getItem('role');
  },
  
  // Vérifier si authentifié
  isAuthenticated() {
    return !!this.getToken();
  },
  
  // Vérifier si admin
  isAdmin() {
    return this.getRole() === 'ADMIN';
  },
  
  // Vérifier si professionnel
  isProfessionnel() {
    return this.getRole() === 'PROFESSIONNEL';
  },
  
  // Vérifier si citoyen
  isCitoyen() {
    return this.getRole() === 'CITOYEN';
  },
  
  // Récupérer infos utilisateur depuis le serveur
  async me() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      this.logout();
      throw error;
    }
  }
};

export default authService;