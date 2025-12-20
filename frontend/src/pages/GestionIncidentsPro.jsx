import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './admin/GestionIncidents.css';

const GestionIncidentsPro = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assignes');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('tous');
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, [activeTab]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (activeTab) {
        case 'assignes':
          endpoint = '/professionnel/incidents/assignes';
          break;
        case 'secteur':
          endpoint = '/professionnel/incidents/secteur';
          break;
        case 'historique':
          endpoint = '/professionnel/incidents/historique';
          break;
        default:
          endpoint = '/professionnel/incidents/assignes';
      }
      
      const response = await api.get(endpoint);
      setIncidents(response.data);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du chargement des incidents:', err);
      setError('Impossible de charger les incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedIncident || !newStatus) return;
    
    try {
      setActionLoading(true);
      await api.post(`/professionnel/incidents/${selectedIncident.id}/statut`, {
        statut: newStatus,
        commentaire: statusComment
      });
      
      // Actualiser la liste des incidents
      await fetchIncidents();
      
      // Fermer le modal
      setShowStatusModal(false);
      setSelectedIncident(null);
      setNewStatus('');
      setStatusComment('');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignToMe = async (incidentId) => {
    try {
      setActionLoading(true);
      await api.post(`/professionnel/incidents/${incidentId}/assigner`);
      await fetchIncidents();
    } catch (err) {
      console.error('Erreur lors de l\'assignation:', err);
      alert('Erreur lors de l\'assignation');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadgeClass = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'status-orange';
      case 'VALIDE': return 'status-blue';
      case 'EN_COURS': return 'status-purple';
      case 'RESOLU': return 'status-green';
      case 'REJETE': return 'status-red';
      default: return 'status-gray';
    }
  };

  const getStatusText = (statut) => {
    switch (statut) {
      case 'EN_ATTENTE': return 'En Attente';
      case 'VALIDE': return 'Validé';
      case 'EN_COURS': return 'En Cours';
      case 'RESOLU': return 'Résolu';
      case 'REJETE': return 'Rejeté';
      default: return statut;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = incident.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         incident.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'tous' || incident.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetailsModal = (incident) => {
    setSelectedIncident(incident);
    setShowDetailsModal(true);
  };

  const openStatusModal = (incident) => {
    setSelectedIncident(incident);
    setNewStatus(incident.statut);
    setStatusComment('');
    setShowStatusModal(true);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Chargement des incidents...</p>
      </div>
    );
  }

  return (
    <div className="gestion-incidents">
      <div className="page-header">
        <h1>Gestion des Incidents</h1>
        <p>Gérez vos incidents assignés et ceux de votre secteur</p>
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'assignes' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignes')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8.5" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            <line x1="20" y1="8" x2="20" y2="14" stroke="currentColor" strokeWidth="2"/>
            <line x1="23" y1="11" x2="17" y2="11" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Assignés à Moi
        </button>
        <button
          className={`tab ${activeTab === 'secteur' ? 'active' : ''}`}
          onClick={() => setActiveTab('secteur')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Mon Secteur
        </button>
        <button
          className={`tab ${activeTab === 'historique' ? 'active' : ''}`}
          onClick={() => setActiveTab('historique')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Historique
        </button>
      </div>

      {/* Barre de filtres */}
      <div className="filters-bar">
        <div className="search-box">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher un incident..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-btn"
          >
            <option value="tous">Tous les statuts</option>
            <option value="EN_ATTENTE">En Attente</option>
            <option value="VALIDE">Validé</option>
            <option value="EN_COURS">En Cours</option>
            <option value="RESOLU">Résolu</option>
            <option value="REJETE">Rejeté</option>
          </select>
        </div>
      </div>

      {/* Liste des incidents */}
      <div className="incidents-container">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchIncidents}>Réessayer</button>
          </div>
        )}

        {filteredIncidents.length === 0 && !loading ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <h3>Aucun incident trouvé</h3>
            <p>Aucun incident ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="incidents-grid">
            {filteredIncidents.map(incident => (
              <div key={incident.id} className="incident-card">
                <div className="incident-header">
                  <h3>{incident.titre}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(incident.statut)}`}>
                    {getStatusText(incident.statut)}
                  </span>
                </div>
                
                <div className="incident-body">
                  <p className="incident-description">{incident.description}</p>
                  
                  <div className="incident-meta">
                    <div className="meta-item">
                      <strong>Citoyen:</strong> {incident.citoyen?.nom} {incident.citoyen?.prenom}
                    </div>
                    <div className="meta-item">
                      <strong>Localisation:</strong> {incident.localisation}
                    </div>
                    <div className="meta-item">
                      <strong>Date:</strong> {formatDate(incident.dateCreation)}
                    </div>
                    <div className="meta-item">
                      <strong>Priorité:</strong> {incident.priorite}
                    </div>
                    
                    {incident.professionnelAssigne && (
                      <div className="meta-item">
                        <strong>Assigné à:</strong> {incident.professionnelAssigne.nom} {incident.professionnelAssigne.prenom}
                      </div>
                    )}
                  </div>

                  {incident.photo && (
                    <div className="incident-photo">
                      <img src={incident.photo} alt="Photo de l'incident" />
                    </div>
                  )}
                </div>

                <div className="incident-actions">
                  <button
                    onClick={() => openDetailsModal(incident)}
                    className="btn-details"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                    Détails
                  </button>

                  {activeTab === 'secteur' && !incident.professionnelAssigne && (
                    <button
                      onClick={() => handleAssignToMe(incident.id)}
                      className="btn-assign"
                      disabled={actionLoading}
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2"/>
                        <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      M'assigner
                    </button>
                  )}

                  {(activeTab === 'assignes' || 
                    (incident.professionnelAssigne?.id === user?.id)) && (
                    <button
                      onClick={() => openStatusModal(incident)}
                      className="btn-validate"
                    >
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <polyline points="9,11 12,14 22,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21,12v7a2,2 0,0,1-2,2H5a2,2 0,0,1-2-2V5a2,2 0,0,1,2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Mettre à Jour
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal des détails */}
      {showDetailsModal && selectedIncident && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'Incident #{selectedIncident.id}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="incident-details">
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Titre</label>
                    <p>{selectedIncident.titre}</p>
                  </div>
                  <div className="detail-group">
                    <label>Statut</label>
                    <p>
                      <span className={`status-badge ${getStatusBadgeClass(selectedIncident.statut)}`}>
                        {getStatusText(selectedIncident.statut)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="detail-group">
                  <label>Description</label>
                  <p>{selectedIncident.description}</p>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label>Localisation</label>
                    <p>{selectedIncident.localisation}</p>
                  </div>
                  <div className="detail-group">
                    <label>Priorité</label>
                    <p>{selectedIncident.priorite}</p>
                  </div>
                </div>

                <div className="detail-row">
                  <div className="detail-group">
                    <label>Date de Création</label>
                    <p>{formatDate(selectedIncident.dateCreation)}</p>
                  </div>
                  <div className="detail-group">
                    <label>Citoyen</label>
                    <p>{selectedIncident.citoyen?.nom} {selectedIncident.citoyen?.prenom}</p>
                  </div>
                </div>

                {selectedIncident.professionnelAssigne && (
                  <div className="detail-group">
                    <label>Professionnel Assigné</label>
                    <p>{selectedIncident.professionnelAssigne.nom} {selectedIncident.professionnelAssigne.prenom}</p>
                  </div>
                )}

                {selectedIncident.commentaireResolution && (
                  <div className="detail-group">
                    <label>Commentaire de Résolution</label>
                    <p>{selectedIncident.commentaireResolution}</p>
                  </div>
                )}

                {selectedIncident.photo && (
                  <div className="detail-group">
                    <label>Photo</label>
                    <div className="incident-photo-large">
                      <img src={selectedIncident.photo} alt="Photo de l'incident" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de mise à jour du statut */}
      {showStatusModal && selectedIncident && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Mettre à Jour le Statut</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="incident-summary">
                <h3>{selectedIncident.titre}</h3>
                <p>{selectedIncident.description}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="status">Nouveau Statut</label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="VALIDE">Validé</option>
                  <option value="EN_COURS">En Cours</option>
                  <option value="RESOLU">Résolu</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="comment">Commentaire (optionnel)</label>
                <textarea
                  id="comment"
                  rows="4"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Ajoutez un commentaire sur cette mise à jour..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowStatusModal(false)}
                className="btn-cancel"
              >
                Annuler
              </button>
              <button
                onClick={handleStatusUpdate}
                className="btn-validate"
                disabled={actionLoading}
              >
                {actionLoading ? 'Mise à jour...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionIncidentsPro;