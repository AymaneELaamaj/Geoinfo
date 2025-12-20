/**
 * Utilitaires de formatage pour l'application
 */

/**
 * Formate une date en format français
 * @param {string} dateString - Date au format ISO
 * @param {boolean} includeTime - Inclure l'heure ou non
 * @returns {string} Date formatée
 */
export const formatDate = (dateString, includeTime = true) => {
  const date = new Date(dateString);
  const options = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return date.toLocaleDateString('fr-FR', options);
};

/**
 * Formate un nombre avec des séparateurs de milliers
 * @param {number} num - Nombre à formater
 * @returns {string} Nombre formaté
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Calcule un pourcentage
 * @param {number} value - Valeur
 * @param {number} total - Total
 * @param {number} decimals - Nombre de décimales
 * @returns {string} Pourcentage formaté
 */
export const calculatePercentage = (value, total, decimals = 1) => {
  if (total === 0) return '0';
  return ((value / total) * 100).toFixed(decimals);
};

/**
 * Tronque un texte et ajoute des points de suspension
 * @param {string} text - Texte à tronquer
 * @param {number} maxLength - Longueur maximale
 * @returns {string} Texte tronqué
 */
export const truncateText = (text, maxLength = 100) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formate les coordonnées géographiques
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {string} Coordonnées formatées
 */
export const formatCoordinates = (lat, lon) => {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
};

