import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Calendar, MapPin, AlertCircle, CheckCircle, Clock, XCircle, Play, AlertTriangle } from 'lucide-react';

const ProfessionalDashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [nouveauStatut, setNouveauStatut] = useState('');
  const [descriptionTraitement, setDescriptionTraitement] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Charger les incidents du secteur du professionnel
  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/incidents/pro/mes-incidents');
      setIncidents(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des incidents:', error);
      alert('❌ Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (incident) => {
    setSelectedIncident(incident);
    setNouveauStatut(incident.statut);
    setDescriptionTraitement('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedIncident(null);
    setNouveauStatut('');
    setDescriptionTraitement('');
  };

  const handleSubmit = async () => {
    if (!nouveauStatut) {
      alert('⚠️ Veuillez sélectionner un statut');
      return;
    }

    if (!descriptionTraitement.trim()) {
      alert('⚠️ Veuillez saisir une description du traitement (rétro-info obligatoire)');
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/incidents/${selectedIncident.id}/traiter`, {
        nouveauStatut,
        descriptionTraitement
      });

      alert('✅ Incident mis à jour avec succès !');
      closeModal();
      loadIncidents(); // Recharger la liste
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      alert('❌ Erreur lors de la mise à jour de l\'incident');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatutBadge = (statut) => {
    const badges = {
      'VALIDE_PUBLIE': { color: 'green', label: 'Validé et Publié', icon: CheckCircle },
      'PRIS_EN_COMPTE': { color: 'blue', label: 'Pris en compte', icon: CheckCircle },
      'EN_COURS': { color: 'yellow', label: 'En cours', icon: Clock },
      'TRAITE': { color: 'purple', label: 'Traité', icon: CheckCircle },
      'BLOQUE': { color: 'red', label: 'Bloqué', icon: AlertTriangle },
      'REDIRIGE': { color: 'orange', label: 'Redirigé', icon: Play }
    };

    const badge = badges[statut] || { color: 'gray', label: statut, icon: AlertCircle };
    const Icon = badge.icon;

    return (
      <span className={`badge badge-${badge.color}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{ color: 'var(--text-secondary)' }}>Chargement des incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* En-tête */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' }}>
          🛠️ Dashboard Professionnel
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
          Bienvenue <strong>{user?.nom}</strong> - Secteur: <strong>{user?.secteur || 'Non défini'}</strong>
        </p>
      </div>

      {/* Statistiques */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '0.5rem' }}>
            {incidents.length}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>Incidents à traiter</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#10b981', marginBottom: '0.5rem' }}>
            {incidents.filter(i => i.statut === 'TRAITE').length}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>Incidents traités</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', color: '#f59e0b', marginBottom: '0.5rem' }}>
            {incidents.filter(i => i.statut === 'EN_COURS').length}
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>En cours</p>
        </div>
      </div>

      {/* Liste des incidents */}
      <div className="card">
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          📋 Mes Incidents ({incidents.length})
        </h2>

        {incidents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <AlertCircle size={48} color="#6b7280" style={{ margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              Aucun incident à traiter dans votre secteur pour le moment.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Province</th>
                  <th>Statut</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map(incident => (
                  <tr key={incident.id}>
                    <td style={{ fontWeight: '600' }}>#{incident.id}</td>
                    <td>{incident.typeIncident || 'N/A'}</td>
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
                        {incident.provinceId}
                      </div>
                    </td>
                    <td>{getStatutBadge(incident.statut)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.875rem' }}>
                        <Calendar size={14} />
                        {formatDate(incident.dateDeclaration)}
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => openModal(incident)}
                        className="btn btn-sm btn-primary"
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        <CheckCircle size={16} />
                        Traiter
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de traitement */}
      {showModal && selectedIncident && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={closeModal}
        >
          <div 
            className="card"
            style={{
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* En-tête */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '2px solid var(--primary)',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '12px 12px 0 0'
            }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>
                🛠️ Traiter l'incident #{selectedIncident.id}
              </h3>
            </div>

            {/* Contenu */}
            <div style={{ padding: '1.5rem' }}>
              {/* Informations incident */}
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Type:</strong> {selectedIncident.typeIncident || 'N/A'}
                </p>
                <p style={{ marginBottom: '0.5rem' }}>
                  <strong>Description:</strong> {selectedIncident.description}
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>Statut actuel:</strong> {getStatutBadge(selectedIncident.statut)}
                </p>
              </div>

              {/* Sélection du nouveau statut */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Nouveau Statut <span style={{ color: 'red' }}>*</span>
                </label>
                <select
                  value={nouveauStatut}
                  onChange={(e) => setNouveauStatut(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                >
                  <option value="">-- Sélectionner un statut --</option>
                  <option value="PRIS_EN_COMPTE">Pris en compte</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TRAITE">Traité</option>
                  <option value="BLOQUE">Bloqué</option>
                  <option value="REDIRIGE">Redirigé</option>
                </select>
              </div>

              {/* Description du traitement */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Description du traitement (Rétro-info) <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  value={descriptionTraitement}
                  onChange={(e) => setDescriptionTraitement(e.target.value)}
                  placeholder="Décrivez les actions effectuées, les observations, les éventuels blocages..."
                  rows={6}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  Cette information sera enregistrée et visible par les administrateurs.
                </p>
              </div>

              {/* Boutons */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    backgroundColor: 'white',
                    color: '#374151',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    opacity: submitting ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submitting ? (
                    <>
                      <div className="spinner" style={{ width: '16px', height: '16px' }}></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalDashboard;
