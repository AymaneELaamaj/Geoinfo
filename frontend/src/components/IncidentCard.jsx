import { MapPin, Calendar, Eye } from 'lucide-react';
import { getSecteurNom, getSecteurColor, getStatut } from '../data/constants';
import { formatDate } from '../utils/formatters';

/**
 * Composant réutilisable pour afficher une carte d'incident
 * @param {Object} incident - Données de l'incident
 * @param {Function} onView - Callback pour voir les détails (optionnel)
 * @param {React.Component} actions - Actions personnalisées (optionnel)
 */
const IncidentCard = ({ incident, onView, actions }) => {
  return (
    <div className="card" style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* En-tête */}
          <div style={{ marginBottom: '0.75rem' }}>
            <span style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600',
              color: getSecteurColor(incident.secteurId)
            }}>
              {getSecteurNom(incident.secteurId)}
            </span>
            <span style={{ 
              margin: '0 0.5rem',
              color: 'var(--text-secondary)'
            }}>
              •
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              #{incident.id}
            </span>
          </div>

          {/* Type d'incident */}
          <h4 style={{ 
            margin: '0 0 0.5rem 0',
            fontSize: '1.1rem',
            color: 'var(--text-primary)'
          }}>
            {incident.typeIncident}
          </h4>

          {/* Description */}
          <p style={{ 
            margin: '0 0 0.75rem 0',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: '1.5'
          }}>
            {incident.description}
          </p>

          {/* Informations supplémentaires */}
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <MapPin size={14} />
              <span>{incident.province}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={14} />
              <span>{formatDate(incident.dateDeclaration)}</span>
            </div>
          </div>

          {/* Statut */}
          <span className={`badge badge-${getStatut(incident.statut).color}`}>
            {getStatut(incident.statut).label}
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
          {onView && (
            <button
              onClick={() => onView(incident)}
              className="btn btn-sm btn-secondary"
              title="Voir les détails"
            >
              <Eye size={16} />
            </button>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;

