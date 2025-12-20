import { Filter } from 'lucide-react';
import { SECTEURS, PROVINCES, STATUTS_INCIDENTS } from '../data/constants';

/**
 * Composant IncidentFilters - Filtres réutilisables pour les incidents
 * @param {Object} filters - Objet contenant les valeurs des filtres actuels
 * @param {Function} onFilterChange - Fonction appelée lors du changement d'un filtre
 * @param {Function} onSearch - Fonction appelée pour effectuer la recherche
 * @param {Function} onReset - Fonction appelée lors de la réinitialisation des filtres
 */
const IncidentFilters = ({ filters, onFilterChange, onSearch, onReset }) => {
  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
        <Filter size={20} style={{ marginRight: '0.5rem' }} />
        <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Filtres</h2>
      </div>

      <div className="grid grid-5">
        {/* Filtre Secteur */}
        <div className="form-group">
          <label className="form-label">Secteur</label>
          <select 
            className="form-select"
            value={filters.secteur}
            onChange={(e) => onFilterChange('secteur', e.target.value)}
          >
            <option value="">Tous les secteurs</option>
            {SECTEURS.map(secteur => (
              <option key={secteur.id} value={secteur.id}>
                {secteur.nom}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Province */}
        <div className="form-group">
          <label className="form-label">Province</label>
          <select 
            className="form-select"
            value={filters.province}
            onChange={(e) => onFilterChange('province', e.target.value)}
          >
            <option value="">Toutes les provinces</option>
            {PROVINCES.map(province => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        {/* Filtre Statut */}
        <div className="form-group">
          <label className="form-label">Statut</label>
          <select 
            className="form-select"
            value={filters.statut}
            onChange={(e) => onFilterChange('statut', e.target.value)}
          >
            <option value="">Tous les statuts</option>
            {STATUTS_INCIDENTS.map(statut => (
              <option key={statut.id} value={statut.id}>
                {statut.label}
              </option>
            ))}
          </select>
        </div>

        {/* Bouton Chercher */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className="btn btn-primary"
            onClick={onSearch}
            style={{ width: '100%' }}
          >
            🔍 Chercher
          </button>
        </div>

        {/* Bouton Réinitialiser */}
        <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button 
            className="btn btn-secondary"
            onClick={onReset}
            style={{ width: '100%' }}
          >
            🔄 Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentFilters;

