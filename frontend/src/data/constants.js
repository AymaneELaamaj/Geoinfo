/**
 * Constantes de l'application
 * Synchronisées avec le backend Spring Boot
 */

/**
 * Secteurs d'intervention (à adapter selon votre base de données)
 */
export const SECTEURS = [
  { id: 1, nom: 'Infrastructure', color: '#3b82f6' },
  { id: 2, nom: 'Environnement', color: '#10b981' },
  { id: 3, nom: 'Sécurité', color: '#ef4444' },
  { id: 4, nom: 'Services Publics', color: '#f59e0b' },
  { id: 5, nom: 'Transport', color: '#8b5cf6' },
  { id: 6, nom: 'Santé', color: '#ec4899' }
];

/**
 * Types d'incidents par secteur
 */
export const TYPES_INCIDENTS = {
  1: ['Route endommagée', 'Trottoir défectueux', 'Éclairage public', 'Signalisation'],
  2: ['Déchets sauvages', 'Pollution', 'Espaces verts', 'Eaux usées'],
  3: ['Vandalisme', 'Danger public', 'Insécurité'],
  4: ['Coupure eau', 'Coupure électricité', 'Services administratifs'],
  5: ['Stationnement illégal', 'Transport public', 'Circulation'],
  6: ['Nuisances sonores', 'Insalubrité', 'Animaux errants'],
};

/**
 * Statuts des incidents (synchronisé avec l'enum backend)
 */
export const STATUTS_INCIDENTS = [
  { value: 'REDIGE', label: 'Rédigé', color: '#6b7280' },
  { value: 'PRISE_EN_COMPTE', label: 'Prise en compte', color: '#6366f1' },
  { value: 'VALIDE', label: 'Validé', color: '#3b82f6' },
  { value: 'EN_COURS_DE_TRAITEMENT', label: 'En cours de traitement', color: '#f59e0b' },
  { value: 'TRAITE', label: 'Traité', color: '#10b981' },
  { value: 'REJETE', label: 'Rejeté', color: '#ef4444' },
  { value: 'BLOQUE', label: 'Bloqué', color: '#dc2626' }
];

/**
 * Provinces (correspondant aux données de la base)
 * ATTENTION: Ces IDs doivent correspondre exactement aux provinces dans votre base PostgreSQL
 */
export const PROVINCES_MAP = [
  { id: 1, nom: 'Rabat' },
  { id: 2, nom: 'Casablanca' },
  { id: 3, nom: 'Fès' },
  { id: 4, nom: 'Marrakech' },
  { id: 5, nom: 'Tanger' },
  { id: 6, nom: 'Agadir' }
];

/**
 * Fonctions utilitaires
 */

/**
 * Récupère le nom d'un secteur par son ID
 */
export const getSecteurNom = (secteurId) => {
  if (!secteurId) return 'N/A';
  const secteur = SECTEURS.find(s => s.id === parseInt(secteurId));
  return secteur ? secteur.nom : `Secteur ${secteurId}`;
};

/**
 * Récupère la couleur d'un secteur par son ID
 */
export const getSecteurColor = (secteurId) => {
  if (!secteurId) return '#6b7280';
  const secteur = SECTEURS.find(s => s.id === parseInt(secteurId));
  return secteur ? secteur.color : '#6b7280';
};

/**
 * Récupère les informations d'un statut
 */
export const getStatut = (statutValue) => {
  if (!statutValue) return { label: 'N/A', color: '#6b7280' };
  const statut = STATUTS_INCIDENTS.find(s => s.value === statutValue);
  return statut || { label: statutValue, color: '#6b7280' };
};

/**
 * Récupère le nom d'une province par son ID
 */
export const getProvinceNom = (provinceId) => {
  if (!provinceId) return 'N/A';
  const id = parseInt(provinceId);
  const province = PROVINCES_MAP.find(p => p.id === id);
  return province ? province.nom : `Province ${id}`;
};

/**
 * Récupère les types d'incidents d'un secteur
 */
export const getTypesIncidentsBySecteur = (secteurId) => {
  return TYPES_INCIDENTS[secteurId] || [];
};
