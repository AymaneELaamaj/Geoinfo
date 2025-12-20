import { useState, useEffect } from 'react';
import { 
  Check, 
  X, 
  Eye, 
  Clock,
  AlertTriangle,
  Filter,
  Search,
  Users
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import './GestionIncidents.css';

const GestionIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [incidentsRejetes, setIncidentsRejetes] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('en-attente');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'reject', 'details', 'assign'

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const [enAttente, rejetes] = await Promise.all([
        adminAPI.getIncidentsEnAttente(),
        adminAPI.getIncidentsRejetes()
      ]);
      setIncidents(enAttente);
      setIncidentsRejetes(rejetes);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const validerIncident = async (id) => {
    try {
      await adminAPI.validerIncident(id);
      setIncidents(incidents.filter(i => i.id !== id));
      // Notification de succès
      showNotification('Incident validé avec succès', 'success');
    } catch (error) {
      console.error('Erreur validation:', error);
      showNotification('Erreur lors de la validation', 'error');
    }
  };

  const rejeterIncident = async () => {
    if (!motifRejet.trim()) {
      showNotification('Veuillez fournir un motif de rejet', 'warning');
      return;
    }

    try {
      await adminAPI.rejeterIncident(selectedIncident.id, motifRejet);
      setIncidents(incidents.filter(i => i.id !== selectedIncident.id));
      setMotifRejet('');
      setSelectedIncident(null);
      setShowModal(false);
      showNotification('Incident rejeté', 'success');
      fetchIncidents(); // Refresh pour mettre à jour la liste rejetés
    } catch (error) {
      console.error('Erreur rejet:', error);
      showNotification('Erreur lors du rejet', 'error');
    }
  };

  const showNotification = (message, type) => {
    // Implémentation simple de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      z-index: 1000;
      animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') notification.style.backgroundColor = '#10b981';
    else if (type === 'error') notification.style.backgroundColor = '#ef4444';
    else if (type === 'warning') notification.style.backgroundColor = '#f59e0b';
    
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const openModal = (type, incident = null) => {
    setModalType(type);
    setSelectedIncident(incident);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIncident(null);
    setMotifRejet('');
  };

  const getStatutBadge = (statut) => {
    const statuts = {
      REDIGE: { color: 'orange', text: 'En attente' },
      REJETE: { color: 'red', text: 'Rejeté' },
      VALIDE: { color: 'green', text: 'Validé' }
    };
    
    const s = statuts[statut] || { color: 'gray', text: statut };
    return (
      <span className={`status-badge status-${s.color}`}>
        {s.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="gestion-incidents">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement des incidents...</p>
        </div>
      </div>
    );
  }

  const currentIncidents = activeTab === 'en-attente' ? incidents : incidentsRejetes;

  return (
    <div className="gestion-incidents">
      <div className="page-header">
        <h1>Gestion des Incidents</h1>
        <p>Validation et rejet des incidents déclarés par les citoyens</p>
      </div>

      {/* Onglets */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'en-attente' ? 'active' : ''}`}
          onClick={() => setActiveTab('en-attente')}
        >
          <Clock />
          En Attente ({incidents.length})
        </button>
        <button
          className={`tab ${activeTab === 'rejetes' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejetes')}
        >
          <X />
          Rejetés ({incidentsRejetes.length})
        </button>
      </div>

      {/* Filtres et recherche */}
      <div className="filters-bar">
        <div className="search-box">
          <Search />
          <input type="text" placeholder="Rechercher un incident..." />
        </div>
        <div className="filters">
          <button className="filter-btn">
            <Filter />
            Filtres
          </button>
        </div>
      </div>

      {/* Liste des incidents */}
      <div className="incidents-container">
        {currentIncidents.length === 0 ? (
          <div className="empty-state">
            <AlertTriangle />
            <h3>
              {activeTab === 'en-attente' 
                ? 'Aucun incident en attente' 
                : 'Aucun incident rejeté'
              }
            </h3>
            <p>
              {activeTab === 'en-attente' 
                ? 'Tous les incidents ont été traités.' 
                : 'Aucun incident n\'a été rejeté.'
              }
            </p>
          </div>
        ) : (
          <div className="incidents-grid">
            {currentIncidents.map(incident => (
              <div key={incident.id} className="incident-card">
                <div className="incident-header">
                  <h3>{incident.titre}</h3>
                  {getStatutBadge(incident.statut)}
                </div>
                
                <div className="incident-body">
                  <p className="incident-description">
                    {incident.description}
                  </p>
                  
                  <div className="incident-meta">
                    <div className="meta-item">
                      <strong>Secteur:</strong> {incident.secteur?.nomSecteur || 'Non spécifié'}
                    </div>
                    <div className="meta-item">
                      <strong>Date:</strong> {new Date(incident.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="meta-item">
                      <strong>Localisation:</strong> {incident.localisation || 'Non spécifiée'}
                    </div>
                    {incident.motifRejet && (
                      <div className="meta-item rejection-reason">
                        <strong>Motif de rejet:</strong> {incident.motifRejet}
                      </div>
                    )}
                  </div>
                  
                  {incident.photoUrl && (
                    <div className="incident-photo">
                      <img src={incident.photoUrl} alt="Incident" />
                    </div>
                  )}
                </div>
                
                {activeTab === 'en-attente' && (
                  <div className="incident-actions">
                    <button
                      onClick={() => validerIncident(incident.id)}
                      className="btn-validate"
                      title="Valider l'incident"
                    >
                      <Check />
                      Valider
                    </button>
                    
                    <button
                      onClick={() => openModal('reject', incident)}
                      className="btn-reject"
                      title="Rejeter l'incident"
                    >
                      <X />
                      Rejeter
                    </button>
                    
                    <button
                      onClick={() => openModal('details', incident)}
                      className="btn-details"
                      title="Voir les détails"
                    >
                      <Eye />
                      Détails
                    </button>
                    
                    <button
                      onClick={() => openModal('assign', incident)}
                      className="btn-assign"
                      title="Affecter à un professionnel"
                    >
                      <Users />
                      Affecter
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de rejet */}
      {showModal && modalType === 'reject' && selectedIncident && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Rejeter l'incident</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="incident-summary">
                <h3>{selectedIncident.titre}</h3>
                <p>{selectedIncident.description}</p>
              </div>
              
              <div className="form-group">
                <label htmlFor="motifRejet">Motif du rejet *</label>
                <textarea
                  id="motifRejet"
                  value={motifRejet}
                  onChange={(e) => setMotifRejet(e.target.value)}
                  placeholder="Expliquez pourquoi cet incident est rejeté..."
                  rows={5}
                  required
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeModal} className="btn-cancel">
                Annuler
              </button>
              <button onClick={rejeterIncident} className="btn-confirm-reject">
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails */}
      {showModal && modalType === 'details' && selectedIncident && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal modal-large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'incident</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="incident-details">
                <div className="detail-group">
                  <label>Titre</label>
                  <p>{selectedIncident.titre}</p>
                </div>
                
                <div className="detail-group">
                  <label>Description</label>
                  <p>{selectedIncident.description}</p>
                </div>
                
                <div className="detail-row">
                  <div className="detail-group">
                    <label>Secteur</label>
                    <p>{selectedIncident.secteur?.nomSecteur || 'Non spécifié'}</p>
                  </div>
                  
                  <div className="detail-group">
                    <label>Date de création</label>
                    <p>{new Date(selectedIncident.dateCreation).toLocaleString('fr-FR')}</p>
                  </div>
                </div>
                
                <div className="detail-group">
                  <label>Localisation</label>
                  <p>{selectedIncident.localisation || 'Non spécifiée'}</p>
                </div>
                
                {selectedIncident.photoUrl && (
                  <div className="detail-group">
                    <label>Photo</label>
                    <div className="incident-photo-large">
                      <img src={selectedIncident.photoUrl} alt="Incident" />
                    </div>
                  </div>
                )}
                
                <div className="detail-group">
                  <label>Statut</label>
                  {getStatutBadge(selectedIncident.statut)}
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button onClick={closeModal} className="btn-cancel">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionIncidents;