/**
 * NOUVEAU JEU DE DONNÉES DE TEST
 * Données réalistes pour tester toutes les fonctionnalités de l'application
 */

/**
 * Génère un ensemble complet d'incidents de test
 * TOTAL: 30 incidents répartis intelligemment
 */
export const generateMockIncidents = () => {
 const incidents = [
    // ========== SECTEUR 1: INFRASTRUCTURE (6 incidents) ==========
    {
      id: 1,
      secteurId: 1,
      // 🛑 CORRECTION 1: Renommer 'typeIncident' en 'titre'
      titre: 'Route endommagée', 
      description: 'Nids-de-poule dangereux sur l\'avenue Mohammed V, risque d\'accident',
      latitude: 33.5731,
      longitude: -7.5898,
      // 🛑 CORRECTION 2: Utiliser 'provinceId' (Integer) au lieu de 'province' (String)
      provinceId: 1, // Supposons que 1 est l'ID de Casablanca
      statut: 'declare', 
      dateDeclaration: '2025-11-18T10:30:00.000Z',
      // 🛑 CORRECTION 3: Renommer 'photo' en 'photoURL'
      photoURL: 'https://picsum.photos/400/300?random=1', 
    },
    // ... autres incidents mockés
  ];
  return incidents;
};

/**
 * Calcule les statistiques à partir des incidents
 */
export const calculateStats = (incidents) => {
  const stats = {
    total: incidents.length,
    parSecteur: {},
    parProvince: {},
    parStatut: {},
    traites: 0,
    enCours: 0,
    nouveaux: 0,
  };

  incidents.forEach(incident => {
    // Par secteur
    stats.parSecteur[incident.secteurId] = (stats.parSecteur[incident.secteurId] || 0) + 1;

    // Par province
    stats.parProvince[incident.province] = (stats.parProvince[incident.province] || 0) + 1;

    // Par statut
    stats.parStatut[incident.statut] = (stats.parStatut[incident.statut] || 0) + 1;

    // Compteurs spécifiques
    if (incident.statut === 'traite') stats.traites++;
    if (incident.statut === 'en_cours' || incident.statut === 'pris_en_compte') stats.enCours++;
    if (incident.statut === 'declare' || incident.statut === 'publie') stats.nouveaux++;
  });

  return stats;
};
