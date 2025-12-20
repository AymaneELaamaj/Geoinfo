/**
 * Service API centralisé avec configuration Axios
 * Intégration complète Backend Spring Boot <-> Frontend React
 */

// Configuration de base
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api';

/**
 * Gestion centralisée du token d'authentification
 */
class AuthManager {
  static getToken() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const userData = JSON.parse(user);
        return userData.token;
      } catch (e) {
        console.warn('Token invalide dans localStorage');
        this.clearToken();
        return null;
      }
    }
    return null;
  }

  static setToken(token, userData = null) {
    if (userData) {
      localStorage.setItem('user', JSON.stringify({ token, ...userData }));
    } else {
      localStorage.setItem('token', token);
    }
  }

  static clearToken() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  static isAuthenticated() {
    const token = this.getToken();
    return token !== null;
  }

  static getUser() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        return JSON.parse(user);
      } catch (e) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Configuration Axios centralisée
 */
class ApiClient {
  constructor() {
    this.client = this.createAxiosInstance();
    this.setupInterceptors();
  }

  createAxiosInstance() {
    // Créer une instance Axios si disponible, sinon utiliser fetch
    if (typeof window !== 'undefined' && window.axios) {
      return window.axios.create({
        baseURL: API_BASE_URL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        withCredentials: true
      });
    }
    return null;
  }

  setupInterceptors() {
    if (!this.client) return;

    // Intercepteur de requête - Ajouter le token
    this.client.interceptors.request.use(
      (config) => {
        const token = AuthManager.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Intercepteur de réponse - Gérer les erreurs
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Response Error:', error);
        
        if (error.response?.status === 401) {
          AuthManager.clearToken();
          window.location.href = '/connexion';
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        if (error.response?.status >= 500) {
          throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
        }

        throw error;
      }
    );
  }

  async request(config) {
    if (this.client) {
      const response = await this.client.request(config);
      return response.data;
    } else {
      // Fallback avec fetch si Axios n'est pas disponible
      return this.fetchRequest(config);
    }
  }

  async fetchRequest({ method = 'GET', url, data, headers = {} }) {
    const token = AuthManager.getToken();
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      defaultHeaders.Authorization = `Bearer ${token}`;
    }

    const config = {
      method,
      headers: { ...defaultHeaders, ...headers },
      credentials: 'include'
    };

    if (data) {
      if (data instanceof FormData) {
        delete config.headers['Content-Type']; // Laisser le navigateur définir le boundary
        config.body = data;
      } else {
        config.body = JSON.stringify(data);
      }
    }

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    console.log(`🚀 Fetch Request: ${method} ${fullUrl}`);
    
    const response = await fetch(fullUrl, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        AuthManager.clearToken();
        window.location.href = '/connexion';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      const errorText = await response.text();
      throw new Error(errorText || `Erreur HTTP: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  }
}

// Instance globale du client API
const apiClient = new ApiClient();

/**
 * Endpoints de test et santé
 */
export const healthAPI = {
  // Test de santé du backend
  health: () => apiClient.request({ method: 'GET', url: '/health' }),
  
  // Test de connectivité
  testConnection: () => apiClient.request({ method: 'GET', url: '/test/connection' }),
  
  // Test POST
  testData: (data) => apiClient.request({ 
    method: 'POST', 
    url: '/test/data',
    data 
  }),
  
  // Test d'authentification
  testAuth: (credentials) => apiClient.request({
    method: 'POST',
    url: '/test/auth',
    data: credentials
  })
};

/**
 * Service pour la gestion des incidents
 */
export const incidentsAPI = {
  // Récupère tous les incidents
  getAll: () => apiClient.request({ method: 'GET', url: '/incidents' }),

  // Récupère un incident par ID
  getById: (id) => apiClient.request({ method: 'GET', url: `/incidents/${id}` }),

  // Met à jour un incident
  update: (id, data) => apiClient.request({ 
    method: 'PUT', 
    url: `/incidents/${id}`,
    data 
  }),

  // Supprime un incident
  delete: (id) => apiClient.request({ method: 'DELETE', url: `/incidents/${id}` })
};

/**
 * Service pour les citoyens (déclaration d'incidents)
 */
export const citoyensAPI = {
  // Déclare un nouvel incident avec photo
  declarerIncident: async (incidentData, photo = null) => {
    const formData = new FormData();
    
    // Ajouter les données JSON
    formData.append('data', new Blob([JSON.stringify(incidentData)], { 
      type: 'application/json' 
    }));
    
    // Ajouter la photo si elle existe
    if (photo) {
      formData.append('photo', photo);
    }

    return apiClient.request({
      method: 'POST',
      url: '/citoyens/incidents',
      data: formData,
      headers: {} // Laisser le navigateur définir Content-Type pour FormData
    });
  },

  // Récupère les statistiques des incidents par citoyen
  getStatsIncidents: (citoyenId) => 
    apiClient.request({ method: 'GET', url: `/citoyens/${citoyenId}/incidents/stats` })
};

/**
 * Service pour la gestion des professionnels
 */
export const professionnelsAPI = {
  getAll: () => apiClient.request({ method: 'GET', url: '/professionnels' }),
  getById: (id) => apiClient.request({ method: 'GET', url: `/professionnels/${id}` }),
  add: (data) => apiClient.request({ method: 'POST', url: '/professionnels', data }),
  delete: (id) => apiClient.request({ method: 'DELETE', url: `/professionnels/${id}` })
};

/**
 * Service pour la gestion des secteurs
 */
export const secteursAPI = {
  getAll: () => apiClient.request({ method: 'GET', url: '/secteurs' }),
  getById: (id) => apiClient.request({ method: 'GET', url: `/secteurs/${id}` }),
  add: (data) => apiClient.request({ method: 'POST', url: '/secteurs', data }),
  update: (id, data) => apiClient.request({ method: 'PUT', url: `/secteurs/${id}`, data }),
  delete: (id) => apiClient.request({ method: 'DELETE', url: `/secteurs/${id}` })
};

/**
 * Service pour la gestion des provinces
 */
export const provincesAPI = {
  getAll: () => apiClient.request({ method: 'GET', url: '/provinces' }),
  getById: (id) => apiClient.request({ method: 'GET', url: `/provinces/${id}` })
};

/**
 * Service pour la gestion des utilisateurs
 */
export const utilisateursAPI = {
  getAll: () => apiClient.request({ method: 'GET', url: '/utilisateurs' }),
  getById: (id) => apiClient.request({ method: 'GET', url: `/utilisateurs/${id}` }),
  add: (data) => apiClient.request({ method: 'POST', url: '/utilisateurs', data }),
  update: (id, data) => apiClient.request({ method: 'PUT', url: `/utilisateurs/${id}`, data }),
  delete: (id) => apiClient.request({ method: 'DELETE', url: `/utilisateurs/${id}` })
};

/**
 * Service d'authentification
 */
export const authAPI = {
  // Connexion utilisateur avec le nouveau système JWT
  login: async (credentials) => {
    try {
      const response = await apiClient.request({
        method: 'POST',
        url: '/auth/login',
        data: credentials
      });
      
      // Stocker les informations d'authentification
      AuthManager.setToken(response.token, response.utilisateur);
      localStorage.setItem('role', response.role);
      
      return response;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw new Error('Identifiants incorrects');
    }
  },

  // Récupérer l'utilisateur connecté
  me: () => apiClient.request({ method: 'GET', url: '/auth/me' }),

  // Déconnexion
  logout: () => {
    AuthManager.clearToken();
    localStorage.removeItem('role');
    window.location.href = '/connexion';
  },

  // Récupère l'utilisateur actuel
  getCurrentUser: () => AuthManager.getUser(),

  // Vérifie si l'utilisateur est authentifié
  isAuthenticated: () => AuthManager.isAuthenticated(),

  // Récupère le rôle de l'utilisateur
  getUserRole: () => localStorage.getItem('role'),

  // Vérifie les permissions
  isAdmin: () => localStorage.getItem('role') === 'ADMIN',
  isProfessionnel: () => localStorage.getItem('role') === 'PROFESSIONNEL',
  isCitoyen: () => localStorage.getItem('role') === 'CITOYEN'
};

// Export du client API et du gestionnaire d'authentification
export { AuthManager, ApiClient };

/**
 * Service pour les fonctionnalités ADMINISTRATEUR
 */
export const adminAPI = {
  // Gestion des incidents
  getIncidentsEnAttente: () => apiClient.request({ method: 'GET', url: '/admin/incidents/en-attente' }),
  validerIncident: (id) => apiClient.request({ method: 'PUT', url: `/admin/incidents/${id}/valider` }),
  rejeterIncident: (id, motif) => apiClient.request({ 
    method: 'PUT', 
    url: `/admin/incidents/${id}/rejeter`,
    data: { motifRejet: motif }
  }),
  getIncidentsRejetes: () => apiClient.request({ method: 'GET', url: '/admin/incidents/rejetes' }),

  // Affectation
  affecterIncident: (incidentId, professionnelId) => apiClient.request({
    method: 'POST',
    url: `/admin/incidents/${incidentId}/affecter/${professionnelId}`
  }),
  reaffecterIncident: (incidentId, professionnelId) => apiClient.request({
    method: 'PUT',
    url: `/admin/incidents/${incidentId}/reaffecter/${professionnelId}`
  }),

  // Gestion des professionnels
  getAllProfessionnels: () => apiClient.request({ method: 'GET', url: '/admin/professionnels' }),
  createProfessionnel: (data) => apiClient.request({ 
    method: 'POST', 
    url: '/admin/professionnels',
    data
  }),
  updateProfessionnel: (id, data) => apiClient.request({
    method: 'PUT',
    url: `/admin/professionnels/${id}`,
    data
  }),
  toggleProfessionnelStatus: (id) => apiClient.request({
    method: 'PATCH',
    url: `/admin/professionnels/${id}/toggle-status`
  }),
  deleteProfessionnel: (id) => apiClient.request({
    method: 'DELETE',
    url: `/admin/professionnels/${id}`
  }),

  // Dashboard et statistiques
  getDashboard: () => apiClient.request({ method: 'GET', url: '/admin/dashboard' }),
  getHistorique: (page = 0, size = 20) => apiClient.request({
    method: 'GET',
    url: `/admin/historique?page=${page}&size=${size}`
  }),
  getStatistiquesBySecteur: () => apiClient.request({
    method: 'GET',
    url: '/admin/statistiques/secteurs'
  }),
  getRapportProfessionnels: () => apiClient.request({
    method: 'GET',
    url: '/admin/rapports/professionnels'
  }),
  exportData: (type) => apiClient.request({
    method: 'GET',
    url: `/admin/export/${type}`
  })
};

/**
 * Service pour les fonctionnalités PROFESSIONNEL
 */
const professionnelAPI = {
  // Gestion des incidents
  getMesIncidents: (params = {}) => {
    const { statut, page = 0, size = 10, sortBy = 'dateCreation', sortDir = 'desc' } = params;
    let url = `/professionnel/incidents?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`;
    if (statut) url += `&statut=${statut}`;
    
    return apiClient.request({ method: 'GET', url });
  },
  getIncidentById: (id) => apiClient.request({ method: 'GET', url: `/professionnel/incidents/${id}` }),

  // Changement de statut
  prendreEnCompte: (id) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/prendre-en-compte`
  }),
  demarrerTraitement: (id) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/demarrer-traitement`
  }),
  traiterIncident: (id, description) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/traiter`,
    data: { descriptionTraitement: description }
  }),
  bloquerIncident: (id, motif) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/bloquer`,
    data: { motifBlocage: motif }
  }),
  debloquerIncident: (id) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/debloquer`
  }),

  // Dashboard et profil
  getDashboard: () => apiClient.request({ method: 'GET', url: '/professionnel/dashboard' }),
  getProfil: () => apiClient.request({ method: 'GET', url: '/professionnel/profil' }),
  updateProfil: (data) => apiClient.request({
    method: 'PUT',
    url: '/professionnel/profil',
    data
  }),

  // Fonctionnalités avancées
  getHistorique: (page = 0, size = 20) => apiClient.request({
    method: 'GET',
    url: `/professionnel/historique?page=${page}&size=${size}`
  }),
  getStatistiques: () => apiClient.request({ method: 'GET', url: '/professionnel/statistiques' }),
  getCollegues: () => apiClient.request({ method: 'GET', url: '/professionnel/collegues' }),
  marquerUrgent: (id) => apiClient.request({
    method: 'PUT',
    url: `/professionnel/incidents/${id}/marquer-urgent`
  }),
  ajouterCommentaire: (id, commentaire) => apiClient.request({
    method: 'POST',
    url: `/professionnel/incidents/${id}/commentaire`,
    data: commentaire
  })
};

// Export par défaut
const api = {
  health: healthAPI,
  incidents: incidentsAPI,
  citoyens: citoyensAPI,
  professionnels: professionnelsAPI,
  secteurs: secteursAPI,
  provinces: provincesAPI,
  utilisateurs: utilisateursAPI,
  auth: authAPI,
  admin: adminAPI,
  professionnel: professionnelAPI
};

export default api;

// Export nommé de l'objet api pour compatibilité
export { api };