import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Save,
  X,
  Mail,
  Phone,
  Briefcase,
  Shield
} from 'lucide-react';
import { SECTEURS, TYPES_INCIDENTS } from '../data/constants';

/**
 * Page de gestion des utilisateurs (Admin)
 * CRUD complet des utilisateurs professionnels
 */
const GestionUtilisateurs = () => {
  // Liste des utilisateurs mockés (en production, viendrait du backend)
  const [utilisateurs, setUtilisateurs] = useState([
    {
      id: 2,
      email: 'pro@incidents.ma',
      nom: 'Bennani',
      prenom: 'Mohammed',
      telephone: '0612345678',
      role: 'professionnel',
      secteur: 1,
      typeIncident: 'Route endommagée',
    },
    {
      id: 3,
      email: 'pro2@incidents.ma',
      nom: 'Alami',
      prenom: 'Fatima',
      telephone: '0623456789',
      role: 'professionnel',
      secteur: 2,
      typeIncident: 'Déchets sauvages',
    },
    {
      id: 4,
      email: 'pro3@incidents.ma',
      nom: 'Tazi',
      prenom: 'Karim',
      telephone: '0634567890',
      role: 'professionnel',
      secteur: 3,
      typeIncident: 'Vol',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Formulaire
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    telephone: '',
    password: '',
    secteur: '',
    typeIncident: '',
  });

  /**
   * Ouvre le modal pour créer un utilisateur
   */
  const handleCreate = () => {
    setIsEditMode(false);
    setCurrentUser(null);
    setFormData({
      email: '',
      nom: '',
      prenom: '',
      telephone: '',
      password: '',
      secteur: '',
      typeIncident: '',
    });
    setIsModalOpen(true);
  };

  /**
   * Ouvre le modal pour éditer un utilisateur
   */
  const handleEdit = (user) => {
    setIsEditMode(true);
    setCurrentUser(user);
    setFormData({
      email: user.email,
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      password: '',
      secteur: user.secteur,
      typeIncident: user.typeIncident,
    });
    setIsModalOpen(true);
  };

  /**
   * Supprime un utilisateur
   */
  const handleDelete = (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      setUtilisateurs(utilisateurs.filter(u => u.id !== userId));
    }
  };

  /**
   * Ferme le modal
   */
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setFormData({
      email: '',
      nom: '',
      prenom: '',
      telephone: '',
      password: '',
      secteur: '',
      typeIncident: '',
    });
  };

  /**
   * Gère les changements dans le formulaire
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Sauvegarde l'utilisateur
   */
  const handleSave = (e) => {
    e.preventDefault();
    
    if (isEditMode) {
      // Mise à jour
      setUtilisateurs(utilisateurs.map(u => 
        u.id === currentUser.id 
          ? { ...u, ...formData, password: undefined } // Ne pas mettre à jour le mot de passe si vide
          : u
      ));
    } else {
      // Création
      const newUser = {
        id: Math.max(...utilisateurs.map(u => u.id)) + 1,
        ...formData,
        role: 'professionnel'
      };
      setUtilisateurs([...utilisateurs, newUser]);
    }
    
    closeModal();
  };

  // Types d'incidents pour le secteur sélectionné
  const typesIncidents = formData.secteur 
    ? TYPES_INCIDENTS[parseInt(formData.secteur)] || []
    : [];

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Link to="/admin" className="btn btn-secondary">
                <ArrowLeft size={18} />
              </Link>
              <h1 className="page-title" style={{ margin: 0 }}>
                <Users size={32} style={{ marginRight: '0.75rem' }} />
                Gestion des Utilisateurs
              </h1>
            </div>
            <p className="page-subtitle">
              Créez et gérez les comptes des professionnels
            </p>
          </div>
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus size={18} style={{ marginRight: '0.5rem' }} />
            Nouvel utilisateur
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid-3" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{utilisateurs.length}</div>
              <div className="stat-label">Professionnels</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
              <Briefcase size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{SECTEURS.length}</div>
              <div className="stat-label">Secteurs couverts</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">1</div>
              <div className="stat-label">Administrateur</div>
            </div>
          </div>
        </div>

        {/* Liste des utilisateurs */}
        <div className="card">
          <h3 style={{ marginBottom: '1.5rem' }}>
            Liste des professionnels ({utilisateurs.length})
          </h3>
          
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nom complet</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Secteur</th>
                  <th>Type d'incident</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {utilisateurs.map(user => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.prenom} {user.nom}</strong>
                    </td>
                    <td>
                      <Mail size={14} style={{ marginRight: '0.25rem' }} />
                      {user.email}
                    </td>
                    <td>
                      <Phone size={14} style={{ marginRight: '0.25rem' }} />
                      {user.telephone}
                    </td>
                    <td>
                      <span style={{ 
                        color: SECTEURS.find(s => s.id === user.secteur)?.color,
                        fontWeight: '600'
                      }}>
                        {SECTEURS.find(s => s.id === user.secteur)?.nom}
                      </span>
                    </td>
                    <td>
                      {user.typeIncident || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>Non spécifié</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn btn-sm btn-secondary"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="btn btn-sm btn-danger"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de création/édition */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <form onSubmit={handleSave}>
                <div className="modal-header">
                  <h2>
                    {isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
                  </h2>
                  <button type="button" onClick={closeModal} className="modal-close">
                    <X size={24} />
                  </button>
                </div>

                <div className="modal-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="prenom">
                        Prénom <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="nom">
                        Nom <span style={{ color: 'red' }}>*</span>
                      </label>
                      <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      <Mail size={18} style={{ marginRight: '0.5rem' }} />
                      Email <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="telephone">
                      <Phone size={18} style={{ marginRight: '0.5rem' }} />
                      Téléphone <span style={{ color: 'red' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="telephone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="06XXXXXXXX"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="password">
                      Mot de passe {!isEditMode && <span style={{ color: 'red' }}>*</span>}
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="form-input"
                      placeholder={isEditMode ? "Laisser vide pour ne pas modifier" : "••••••••"}
                      required={!isEditMode}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="secteur">
                      <Briefcase size={18} style={{ marginRight: '0.5rem' }} />
                      Secteur <span style={{ color: 'red' }}>*</span>
                    </label>
                    <select
                      id="secteur"
                      name="secteur"
                      value={formData.secteur}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Sélectionner un secteur</option>
                      {SECTEURS.map(secteur => (
                        <option key={secteur.id} value={secteur.id}>
                          {secteur.nom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="typeIncident">
                      Type d'incident <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>(optionnel)</span>
                    </label>
                    <select
                      id="typeIncident"
                      name="typeIncident"
                      value={formData.typeIncident}
                      onChange={handleChange}
                      className="form-input"
                      disabled={!formData.secteur}
                    >
                      <option value="">
                        {formData.secteur ? 'Sélectionner un type (optionnel)' : 'Sélectionner d\'abord un secteur'}
                      </option>
                      {typesIncidents.map(type => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    <X size={18} style={{ marginRight: '0.5rem' }} />
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <Save size={18} style={{ marginRight: '0.5rem' }} />
                    {isEditMode ? 'Mettre à jour' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GestionUtilisateurs;

