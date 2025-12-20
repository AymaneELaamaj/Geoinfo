import { createContext, useContext, useState, useEffect } from 'react';
import { incidentsAPI, citoyensAPI } from '../services/api';

/**
 * Context global de l'application
 * Gère les données des incidents et les statistiques de manière centralisée
 */
const AppContext = createContext();

/**
 * Hook personnalisé pour utiliser le contexte
 */
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp doit être utilisé à l\'intérieur d\'un AppProvider');
  }
  return context;
};

/**
 * Provider du contexte global
 */
export const AppProvider = ({ children }) => {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Charge les données au montage
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * Charge les incidents depuis l'API et calcule les statistiques
   */
  const loadData = async () => {
    setLoading(true);
    try {
      // Récupérer les incidents depuis l'API
      const incidentsData = await incidentsAPI.getAll();
      setIncidents(incidentsData);
      
      // Calculer les statistiques
      const total = incidentsData.length;
      const statsData = {
        total,
        declare: incidentsData.filter(i => i.statut === 'REDIGE').length,
        valide: incidentsData.filter(i => i.statut === 'VALIDE').length,
        enCours: incidentsData.filter(i => i.statut === 'EN_COURS_DE_TRAITEMENT').length,
        traite: incidentsData.filter(i => i.statut === 'TRAITE').length,
        rejete: incidentsData.filter(i => i.statut === 'REJETE').length,
        bloque: incidentsData.filter(i => i.statut === 'BLOQUE').length,
        priseEnCompte: incidentsData.filter(i => i.statut === 'PRISE_EN_COMPTE').length
      };
      
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données depuis l\'API:', error);
      // Définir des données vides en cas d'erreur
      setIncidents([]);
      setStats({
        total: 0,
        declare: 0,
        valide: 0,
        enCours: 0,
        traite: 0,
        rejete: 0,
        bloque: 0,
        priseEnCompte: 0
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Recharge les données
   */
  const refreshData = async () => {
    await loadData();
  };

  /**
   * Met à jour le statut d'un incident via l'API
   * @param {number} incidentId - ID de l'incident
   * @param {string} newStatut - Nouveau statut
   * @param {string} motifRejet - Motif de rejet optionnel
   */
  const updateIncidentStatut = async (incidentId, newStatut, motifRejet = '') => {
    try {
      // Préparer les données de mise à jour
      const updateData = {
        statut: newStatut,
        dateDeclaration: new Date().toISOString()
      };
      
      if (motifRejet) {
        updateData.motifRejet = motifRejet;
      }
      
      // Appel à l'API pour mettre à jour l'incident
      await incidentsAPI.update(incidentId, updateData);
      
      // Recharger les données pour refléter les changements
      await loadData();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'incident:', error);
      throw error;
    }
  };

  /**
   * Valider un incident (Admin)
   * @param {number} incidentId - ID de l'incident
   */
  const validerIncident = async (incidentId) => {
    await updateIncidentStatut(incidentId, 'VALIDE');
  };

  /**
   * Rejeter un incident (Admin)
   * @param {number} incidentId - ID de l'incident
   * @param {string} motif - Motif du rejet
   */
  const rejeterIncident = async (incidentId, motif) => {
    await updateIncidentStatut(incidentId, 'REJETE', motif);
  };

  const value = {
    incidents,
    stats,
    loading,
    refreshData,
    updateIncidentStatut,
    validerIncident,
    rejeterIncident,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;

