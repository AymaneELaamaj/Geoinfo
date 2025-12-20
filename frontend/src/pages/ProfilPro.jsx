import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './ProfilPro.css';

const ProfilPro = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('profil');
  
  const [profileData, setProfileData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    specialite: '',
    secteur: '',
    disponibilite: true
  });

  const [passwordData, setPasswordData] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmerMotDePasse: ''
  });

  const [stats, setStats] = useState({
    totalIncidents: 0,
    incidentsResolus: 0,
    incidentsEnCours: 0,
    tauxResolution: 0,
    tempsReponse: 0
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        nom: user.nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        specialite: user.specialite || '',
        secteur: user.secteur || '',
        disponibilite: user.disponibilite !== false
      });
    }
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await api.get('/professionnel/stats');
      setStats(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err);
    }
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put('/professionnel/profil', profileData);
      updateUser(response.data);
      setSuccess('Profil mis à jour avec succès');
    } catch (err) {
      console.error('Erreur lors de la mise à jour du profil:', err);
      setError('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    if (passwordData.nouveauMotDePasse !== passwordData.confirmerMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      setSaving(false);
      return;
    }

    if (passwordData.nouveauMotDePasse.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      setSaving(false);
      return;
    }

    try {
      await api.put('/professionnel/mot-de-passe', {
        ancienMotDePasse: passwordData.ancienMotDePasse,
        nouveauMotDePasse: passwordData.nouveauMotDePasse
      });
      
      setPasswordData({
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmerMotDePasse: ''
      });
      
      setSuccess('Mot de passe modifié avec succès');
    } catch (err) {
      console.error('Erreur lors du changement de mot de passe:', err);
      setError(err.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleDisponibiliteToggle = async () => {
    try {
      const newDisponibilite = !profileData.disponibilite;
      await api.put('/professionnel/disponibilite', { disponibilite: newDisponibilite });
      
      setProfileData(prev => ({ ...prev, disponibilite: newDisponibilite }));
      updateUser({ ...user, disponibilite: newDisponibilite });
      
      setSuccess(`Disponibilité ${newDisponibilite ? 'activée' : 'désactivée'} avec succès`);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', err);
      setError('Erreur lors de la mise à jour de la disponibilité');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Chargement du profil...</p>
      </div>
    );
  }

  return (
    <div className="profil-pro">
      <div className="page-header">
        <h1>Mon Profil</h1>
        <p>Gérez vos informations personnelles et paramètres</p>
      </div>

      {/* Alertes */}
      {error && (
        <div className="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" strokeWidth="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polyline points="9,11 12,14 22,4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {success}
        </div>
      )}

      {/* Onglets */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profil' ? 'active' : ''}`}
          onClick={() => setActiveTab('profil')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Informations Personnelles
        </button>
        <button
          className={`tab ${activeTab === 'securite' ? 'active' : ''}`}
          onClick={() => setActiveTab('securite')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
            <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Sécurité
        </button>
        <button
          className={`tab ${activeTab === 'statistiques' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistiques')}
        >
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/>
            <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/>
            <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Statistiques
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="tab-content">
        {activeTab === 'profil' && (
          <div className="profile-section">
            <div className="section-card">
              <div className="section-header">
                <h2>Informations Personnelles</h2>
                <div className="disponibilite-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={profileData.disponibilite}
                      onChange={handleDisponibiliteToggle}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className={`status-text ${profileData.disponibilite ? 'available' : 'unavailable'}`}>
                    {profileData.disponibilite ? 'Disponible' : 'Non Disponible'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleProfileSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="prenom">Prénom</label>
                    <input
                      type="text"
                      id="prenom"
                      value={profileData.prenom}
                      onChange={(e) => handleProfileChange('prenom', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="nom">Nom</label>
                    <input
                      type="text"
                      id="nom"
                      value={profileData.nom}
                      onChange={(e) => handleProfileChange('nom', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="telephone">Téléphone</label>
                    <input
                      type="tel"
                      id="telephone"
                      value={profileData.telephone}
                      onChange={(e) => handleProfileChange('telephone', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="specialite">Spécialité</label>
                    <select
                      id="specialite"
                      value={profileData.specialite}
                      onChange={(e) => handleProfileChange('specialite', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner une spécialité</option>
                      <option value="ECLAIRAGE">Éclairage Public</option>
                      <option value="VOIRIE">Voirie</option>
                      <option value="ESPACES_VERTS">Espaces Verts</option>
                      <option value="ASSAINISSEMENT">Assainissement</option>
                      <option value="SIGNALISATION">Signalisation</option>
                      <option value="MAINTENANCE">Maintenance Générale</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="secteur">Secteur</label>
                    <select
                      id="secteur"
                      value={profileData.secteur}
                      onChange={(e) => handleProfileChange('secteur', e.target.value)}
                      required
                    >
                      <option value="">Sélectionner un secteur</option>
                      <option value="CENTRE">Centre-Ville</option>
                      <option value="EST">Secteur Est</option>
                      <option value="OUEST">Secteur Ouest</option>
                      <option value="NORD">Secteur Nord</option>
                      <option value="SUD">Secteur Sud</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? (
                      <>
                        <svg className="loading-spinner" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeOpacity="0.3"/>
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'securite' && (
          <div className="security-section">
            <div className="section-card">
              <div className="section-header">
                <h2>Changer le Mot de Passe</h2>
              </div>

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label htmlFor="ancienMotDePasse">Mot de passe actuel</label>
                  <input
                    type="password"
                    id="ancienMotDePasse"
                    value={passwordData.ancienMotDePasse}
                    onChange={(e) => handlePasswordChange('ancienMotDePasse', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nouveauMotDePasse">Nouveau mot de passe</label>
                  <input
                    type="password"
                    id="nouveauMotDePasse"
                    value={passwordData.nouveauMotDePasse}
                    onChange={(e) => handlePasswordChange('nouveauMotDePasse', e.target.value)}
                    required
                    minLength="8"
                  />
                  <small className="form-hint">Le mot de passe doit contenir au moins 8 caractères</small>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmerMotDePasse">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    id="confirmerMotDePasse"
                    value={passwordData.confirmerMotDePasse}
                    onChange={(e) => handlePasswordChange('confirmerMotDePasse', e.target.value)}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={saving}>
                    {saving ? 'Modification...' : 'Modifier le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'statistiques' && (
          <div className="stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.totalIncidents}</div>
                  <div className="stat-label">Total Incidents</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon resolved">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.incidentsResolus}</div>
                  <div className="stat-label">Incidents Résolus</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon in-progress">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.incidentsEnCours}</div>
                  <div className="stat-label">En Cours</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon rate">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" strokeWidth="2"/>
                    <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2"/>
                    <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stats.tauxResolution}%</div>
                  <div className="stat-label">Taux de Résolution</div>
                </div>
              </div>
            </div>

            <div className="performance-card">
              <h3>Performance</h3>
              <div className="performance-metrics">
                <div className="metric">
                  <label>Temps de réponse moyen</label>
                  <div className="metric-value">{stats.tempsReponse}h</div>
                </div>
                <div className="metric">
                  <label>Évaluation globale</label>
                  <div className="rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        viewBox="0 0 24 24"
                        fill={star <= 4 ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilPro;