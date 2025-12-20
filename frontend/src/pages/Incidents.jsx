import { useState, useEffect } from 'react';
import { Filter, MapPin, Calendar, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
// 🛑 SUPPRIMER: import { generateMockIncidents } from '../data/mockData'; 

// Import de l'API adaptée au backend
import { incidentsAPI, adminAPI } from '../services/api'; 
import { useAuth } from '../contexts/AuthContext';
import { 
  SECTEURS, 
  PROVINCES_MAP,
  STATUTS_INCIDENTS
} from '../data/constants';

/**
 * Fonctions utilitaires pour le rendu des incidents
 */
const getStatut = (statutValue) => {
  return STATUTS_INCIDENTS.find(statut => statut.value === statutValue) || 
         { value: statutValue, label: statutValue, color: '#6b7280' };
};

const getSecteurColor = (secteurId) => {
  const secteur = SECTEURS.find(s => s.id === secteurId);
  return secteur ? secteur.color : '#6b7280';
};

const getSecteurNom = (secteurId) => {
  const secteur = SECTEURS.find(s => s.id === secteurId);
  return secteur ? secteur.nom : 'Inconnu';
};

const getProvinceNom = (provinceId) => {
  const province = PROVINCES_MAP.find(p => p.id === provinceId);
  return province ? province.nom : 'Inconnu';
};

/**
 * Page Liste des Incidents - Affichage avec filtres et pagination
 */
const Incidents = () => {
  const { user } = useAuth(); // Récupérer l'utilisateur connecté
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // 👈 Gestion du chargement
  const [error, setError] = useState(null); // 👈 Gestion de l'erreur
  const [filters, setFilters] = useState({
    secteur: '',
    province: '',
    statut: '',
  });

  // États pour la modale de validation/rejet
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // 'valider' ou 'rejeter'
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [motif, setMotif] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const incidentsParPage = 10;

  /**
    * Charge les données du backend au montage du composant
    */
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 🚀 APPEL AU BACKEND
        const data = await incidentsAPI.getAll(); 

        setIncidents(data);
        setFilteredIncidents(data);
        
      } catch (err) {
        console.error("Erreur de récupération des incidents:", err);
        setError("Erreur de chargement des incidents. Vérifiez que le backend Spring Boot (port 8085) est démarré.");
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  /**
    * Fonction de recherche manuelle
    */
  const handleSearch = () => {
    let filtered = [...incidents];

    if (filters.secteur) {
      filtered = filtered.filter(i => i.secteurId === parseInt(filters.secteur));
    }

    // Filtrage par province (utilise provinceId du backend)
    if (filters.province) {
      filtered = filtered.filter(i => i.provinceId === parseInt(filters.province)); 
    }

    if (filters.statut) {
      filtered = filtered.filter(i => i.statut === filters.statut);
    }

    setFilteredIncidents(filtered);
    setCurrentPage(1);
  };

  /**
    * Gère le changement de filtre (sans filtrage automatique)
    */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Ouvre la modale de validation/rejet
   */
  const openModal = (incident, action) => {
    setSelectedIncident(incident);
    setModalAction(action);
    setMotif('');
    setShowModal(true);
  };

  /**
   * Ferme la modale
   */
  const closeModal = () => {
    setShowModal(false);
    setSelectedIncident(null);
    setModalAction(null);
    setMotif('');
  };

  /**
   * Soumet la validation ou le rejet
   */
  const handleSubmitAction = async () => {
    if (modalAction === 'rejeter' && !motif.trim()) {
      alert('⚠️ Le motif de rejet est obligatoire !');
      return;
    }

    setSubmitting(true);
    try {
      if (modalAction === 'valider') {
        await adminAPI.validerIncident(selectedIncident.id);
        alert('✅ Incident validé avec succès !');
      } else if (modalAction === 'rejeter') {
        await adminAPI.rejeterIncident(selectedIncident.id, motif);
        alert('✅ Incident rejeté avec succès !');
      }

      // Recharger les incidents
      const data = await incidentsAPI.getAll();
      setIncidents(data);
      setFilteredIncidents(data);
      
      closeModal();
    } catch (err) {
      console.error('Erreur lors de l\'action:', err);
      alert('❌ Erreur : ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /**
    * Réinitialise tous les filtres et affiche tous les incidents
    */
  const resetFilters = () => {
    setFilters({
      secteur: '',
      province: '',
      statut: '',
    });
    setFilteredIncidents(incidents);
    setCurrentPage(1);
  };

  /**
    * Formate une date en format lisible
    */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Gestion de l'état de chargement
  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Clock size={48} />
          </div>
          <p>Chargement des incidents...</p>
        </div>
      </div>
    );
  }

  // Gestion de l'état d'erreur
  if (error) {
    return (
        <div className="page">
          <div className="container" style={{ textAlign: 'center', padding: '4rem 0', color: 'red' }}>
            <AlertCircle size={48} style={{ display: 'inline-block', marginBottom: '1rem' }} />
            <p style={{ fontWeight: '600' }}>Erreur de connexion :</p>
            <p>{error}</p>
          </div>
        </div>
      );
  }

  // Pagination
  const indexDernierIncident = currentPage * incidentsParPage;
  const indexPremierIncident = indexDernierIncident - incidentsParPage;
  const incidentsActuels = filteredIncidents.slice(indexPremierIncident, indexDernierIncident);
  const nombrePages = Math.ceil(filteredIncidents.length / incidentsParPage);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Liste des Incidents</h1>
          <p className="page-description">
            {filteredIncidents.length} incident(s) trouvé(s)
          </p>
        </div>

        {/* Filtres */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Filter size={20} style={{ marginRight: '0.5rem' }} />
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Filtres</h2>
          </div>

          <div className="grid grid-5">
            <div className="form-group">
              <label className="form-label">Secteur</label>
              <select 
                className="form-select"
                value={filters.secteur}
                onChange={(e) => handleFilterChange('secteur', e.target.value)}
              >
                <option value="">Tous les secteurs</option>
                {SECTEURS.map(secteur => (
                  <option key={secteur.id} value={secteur.id}>
                    {secteur.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Province</label>
              <select 
                className="form-select"
                value={filters.province}
                onChange={(e) => handleFilterChange('province', e.target.value)}
              >
                <option value="">Toutes les provinces</option>
                {/* 🛑 CORRECTION: Utiliser PROVINCES_MAP pour récupérer l'ID */}
                {PROVINCES_MAP.map(province => ( 
                  <option key={province.id} value={province.id}>
                    {province.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Statut</label>
              <select 
                className="form-select"
                value={filters.statut}
                onChange={(e) => handleFilterChange('statut', e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {STATUTS_INCIDENTS.map(statut => (
                  <option key={statut.id} value={statut.id}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSearch}
                style={{ width: '100%' }}
              >
                🔍 Chercher
              </button>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                className="btn btn-secondary"
                onClick={resetFilters}
                style={{ width: '100%' }}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des incidents */}
        {incidentsActuels.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <AlertCircle size={48} color="#6b7280" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              {incidents.length === 0 ? "Aucun incident n'est enregistré dans la base de données." : "Aucun incident trouvé avec ces critères."}
            </p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Secteur</th>
                    <th>Type</th>
                    <th>Description</th>
                    <th>Province</th>
                    <th>Statut</th>
                    <th>Date</th>
                    {user?.role === 'ADMIN' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {incidentsActuels.map(incident => {
                    const statut = getStatut(incident.statut);
                    const secteurColor = getSecteurColor(incident.secteurId);
                    
                    return (
                      <tr key={incident.id}>
                        <td style={{ fontWeight: '600' }}>#{incident.id}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ 
                              width: '12px', 
                              height: '12px', 
                              borderRadius: '50%',
                              backgroundColor: secteurColor 
                            }} />
                            {getSecteurNom(incident.secteurId)}
                          </div>
                        </td>
                        {/* 🛑 CORRECTION: Utiliser 'titre' du DTO à la place de 'typeIncident' */}
                        <td>{incident.typeIncident}</td> 
                        <td style={{ maxWidth: '300px' }}>
                          <div style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {incident.description}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <MapPin size={14} />
                            {/* 🛑 CORRECTION: Afficher le nom à partir de l'ID */}
                            {getProvinceNom(incident.provinceId)} 
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${statut.color}`}>
                            {statut.label}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                            <Calendar size={14} />
                            {formatDate(incident.dateDeclaration)}
                          </div>
                        </td>
                        {user?.role === 'ADMIN' && (
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              {incident.statut !== 'VALIDE_PUBLIE' && incident.statut !== 'REJETE' ? (
                                <>
                                  <button
                                    onClick={() => openModal(incident, 'valider')}
                                    className="btn btn-sm btn-success"
                                    style={{
                                      padding: '0.375rem 0.75rem',
                                      fontSize: '0.875rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      backgroundColor: '#10b981',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      color: 'white',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <CheckCircle size={16} />
                                    Valider
                                  </button>
                                  <button
                                    onClick={() => openModal(incident, 'rejeter')}
                                    className="btn btn-sm btn-danger"
                                    style={{
                                      padding: '0.375rem 0.75rem',
                                      fontSize: '0.875rem',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.25rem',
                                      backgroundColor: '#ef4444',
                                      border: 'none',
                                      borderRadius: '0.375rem',
                                      color: 'white',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <XCircle size={16} />
                                    Rejeter
                                  </button>
                                </>
                              ) : (
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>—</span>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {nombrePages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </button>

                {[...Array(nombrePages)].map((_, index) => {
                  const pageNumber = index + 1;
                  // Affiche seulement quelques pages autour de la page actuelle
                  if (
                    pageNumber === 1 ||
                    pageNumber === nombrePages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setCurrentPage(pageNumber)}
                        className={currentPage === pageNumber ? 'active' : ''}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber}>...</span>;
                  }
                  return null;
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, nombrePages))}
                  disabled={currentPage === nombrePages}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* MODALE DE VALIDATION/REJET */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '0.5rem',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              marginBottom: '1rem',
              color: modalAction === 'valider' ? '#10b981' : '#ef4444'
            }}>
              {modalAction === 'valider' ? (
                <>
                  <CheckCircle size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Valider l'incident
                </>
              ) : (
                <>
                  <XCircle size={24} style={{ display: 'inline', marginRight: '0.5rem' }} />
                  Rejeter l'incident
                </>
              )}
            </h3>

            <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
                <strong>Incident #{selectedIncident?.id}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                {selectedIncident?.description}
              </p>
            </div>

            {modalAction === 'rejeter' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  marginBottom: '0.5rem',
                  color: '#374151'
                }}>
                  Motif de rejet <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                  placeholder="Veuillez saisir le motif du rejet..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>
            )}

            {modalAction === 'valider' && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '0.375rem', border: '1px solid #86efac' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#166534' }}>
                  ✅ Cet incident sera validé et publié. Les professionnels pourront le consulter et le traiter.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={closeModal}
                disabled={submitting}
                style={{
                  padding: '0.5rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={submitting}
                style={{
                  padding: '0.5rem 1rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  backgroundColor: modalAction === 'valider' ? '#10b981' : '#ef4444',
                  color: 'white',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                {submitting ? 'En cours...' : (modalAction === 'valider' ? 'Confirmer la validation' : 'Confirmer le rejet')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Incidents;