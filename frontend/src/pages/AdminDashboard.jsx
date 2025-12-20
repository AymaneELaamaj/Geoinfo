import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI, secteursAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Shield, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Users,
  Eye,
  ThumbsUp,
  ThumbsDown,
  X,
  UserPlus,
  Edit,
  Trash2
} from 'lucide-react';

/**
 * Page d'administration
 * Permet de valider/rejeter les incidents et gérer les utilisateurs
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  
  // États pour les onglets
  const [activeTab, setActiveTab] = useState('incidents'); // 'incidents' ou 'utilisateurs'
  
  // États pour les incidents
  const [incidentsEnAttente, setIncidentsEnAttente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour les utilisateurs
  const [professionnels, setProfessionnels] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  
  // États pour les modales
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isRejetModalOpen, setIsRejetModalOpen] = useState(false);
  const [motifRejet, setMotifRejet] = useState('');
  
  // États pour le formulaire professionnel
  const [isProfessionnelModalOpen, setIsProfessionnelModalOpen] = useState(false);
  const [editingProfessionnel, setEditingProfessionnel] = useState(null);
  const [professionnelForm, setProfessionnelForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    secteurAffectate: '',
    typeIncident: ''
  });

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'incidents') {
        const incidents = await adminAPI.getIncidentsEnAttente();
        setIncidentsEnAttente(incidents);
      } else {
        const [pros, secs] = await Promise.all([
          adminAPI.getAllProfessionnels(),
          secteursAPI.getAll()
        ]);
        setProfessionnels(pros);
        setSecteurs(secs);
      }
    } catch (err) {
      console.error('Erreur de chargement:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Valider un incident
   */
  const handleValider = async (incidentId) => {
    try {
      await adminAPI.validerIncident(incidentId);
      alert('✅ Incident validé et publié avec succès !');
      loadData(); // Recharger la liste
    } catch (err) {
      console.error('Erreur validation:', err);
      alert('❌ Erreur lors de la validation : ' + err.message);
    }
  };

  /**
   * Ouvrir le modal de rejet
   */
  const openRejetModal = (incident) => {
    setSelectedIncident(incident);
    setMotifRejet('');
    setIsRejetModalOpen(true);
  };

  /**
   * Rejeter un incident
   */
  const handleRejeter = async () => {
    if (!motifRejet.trim()) {
      alert('⚠️ Le motif de rejet est obligatoire !');
      return;
    }

    try {
      await adminAPI.rejeterIncident(selectedIncident.id, motifRejet);
      alert('✅ Incident rejeté avec succès !');
      setIsRejetModalOpen(false);
      setSelectedIncident(null);
      setMotifRejet('');
      loadData();
    } catch (err) {
      console.error('Erreur rejet:', err);
      alert('❌ Erreur lors du rejet : ' + err.message);
    }
  };

  /**
   * Ouvrir le modal de création/modification de professionnel
   */
  const openProfessionnelModal = (pro = null) => {
    if (pro) {
      setEditingProfessionnel(pro);
      setProfessionnelForm({
        nom: pro.nom || '',
        prenom: pro.prenom || '',
        email: pro.email || '',
        motDePasse: '', // Ne pas préremplir le mot de passe
        telephone: pro.telephone || '',
        secteurAffectate: pro.secteurAffectate || '',
        typeIncident: pro.typeIncident || ''
      });
    } else {
      setEditingProfessionnel(null);
      setProfessionnelForm({
        nom: '',
        prenom: '',
        email: '',
        motDePasse: '',
        telephone: '',
        secteurAffectate: '',
        typeIncident: ''
      });
    }
    setIsProfessionnelModalOpen(true);
  };

  /**
   * Sauvegarder un professionnel
   */
  const handleSaveProfessionnel = async (e) => {
    e.preventDefault();

    // Validation
    if (!professionnelForm.nom || !professionnelForm.email) {
      alert('⚠️ Nom et email sont obligatoires !');
      return;
    }

    if (!editingProfessionnel && !professionnelForm.motDePasse) {
      alert('⚠️ Le mot de passe est obligatoire pour un nouveau professionnel !');
      return;
    }

    try {
      if (editingProfessionnel) {
        // Modification
        const dataToUpdate = { ...professionnelForm };
        if (!dataToUpdate.motDePasse) {
          delete dataToUpdate.motDePasse; // Ne pas envoyer le mot de passe vide
        }
        await adminAPI.updateProfessionnel(editingProfessionnel.id, dataToUpdate);
        alert('✅ Professionnel modifié avec succès !');
      } else {
        // Création
        await adminAPI.createProfessionnel(professionnelForm);
        alert('✅ Professionnel créé avec succès !');
      }
      
      setIsProfessionnelModalOpen(false);
      setEditingProfessionnel(null);
      loadData();
    } catch (err) {
      console.error('Erreur sauvegarde professionnel:', err);
      alert('❌ Erreur : ' + err.message);
    }
  };

  /**
   * Supprimer un professionnel
   */
  const handleDeleteProfessionnel = async (proId) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer ce professionnel ?')) {
      return;
    }

    try {
      await adminAPI.deleteProfessionnel(proId);
      alert('✅ Professionnel supprimé avec succès !');
      loadData();
    } catch (err) {
      console.error('Erreur suppression:', err);
      alert('❌ Erreur : ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          Administration
        </h1>
        <p className="text-gray-600 mt-1">Bienvenue {user?.nom} {user?.prenom}</p>
      </div>

      {/* Onglets */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('incidents')}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'incidents'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertCircle className="w-5 h-5 inline mr-2" />
            Incidents à valider
          </button>
          <button
            onClick={() => setActiveTab('utilisateurs')}
            className={`py-2 px-4 font-medium border-b-2 transition-colors ${
              activeTab === 'utilisateurs'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-5 h-5 inline mr-2" />
            Gestion Utilisateurs
          </button>
        </nav>
      </div>

      {/* Contenu selon l'onglet actif */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'incidents' && (
        <IncidentsTab
          incidents={incidentsEnAttente}
          onValider={handleValider}
          onRejeter={openRejetModal}
        />
      )}

      {activeTab === 'utilisateurs' && (
        <UtilisateursTab
          professionnels={professionnels}
          secteurs={secteurs}
          onAdd={() => openProfessionnelModal()}
          onEdit={openProfessionnelModal}
          onDelete={handleDeleteProfessionnel}
        />
      )}

      {/* Modal de rejet */}
      {isRejetModalOpen && (
        <RejetModal
          incident={selectedIncident}
          motif={motifRejet}
          onMotifChange={setMotifRejet}
          onConfirm={handleRejeter}
          onClose={() => setIsRejetModalOpen(false)}
        />
      )}

      {/* Modal de professionnel */}
      {isProfessionnelModalOpen && (
        <ProfessionnelModal
          form={professionnelForm}
          secteurs={secteurs}
          isEditing={!!editingProfessionnel}
          onChange={setProfessionnelForm}
          onSubmit={handleSaveProfessionnel}
          onClose={() => setIsProfessionnelModalOpen(false)}
        />
      )}
    </div>
  );
};

/**
 * Composant pour l'onglet des incidents
 */
const IncidentsTab = ({ incidents, onValider, onRejeter }) => {
  if (incidents.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Aucun incident en attente
        </h3>
        <p className="text-gray-500">
          Tous les incidents ont été traités !
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          {incidents.length} incident(s) en attente de validation
        </h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Titre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Secteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {incidents.map((incident) => (
              <tr key={incident.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{incident.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {incident.titre}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {incident.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {incident.secteur?.nom || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(incident.dateCreation)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onValider(incident.id)}
                    className="mr-3 inline-flex items-center px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1" />
                    Valider
                  </button>
                  <button
                    onClick={() => onRejeter(incident)}
                    className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1" />
                    Rejeter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Composant pour l'onglet des utilisateurs
 */
const UtilisateursTab = ({ professionnels, secteurs, onAdd, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          {professionnels.length} professionnel(s) enregistré(s)
        </h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Nouveau Professionnel
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Secteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Spécialité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {professionnels.map((pro) => {
              const secteur = secteurs.find(s => s.id === pro.secteurAffectate);
              return (
                <tr key={pro.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {pro.nom} {pro.prenom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {pro.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {pro.telephone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {secteur?.nom || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {pro.typeIncident || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => onEdit(pro)}
                      className="mr-3 text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(pro.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * Modal de rejet d'incident
 */
const RejetModal = ({ incident, motif, onMotifChange, onConfirm, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Rejeter l'incident #{incident?.id}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motif de rejet <span className="text-red-500">*</span>
            </label>
            <textarea
              value={motif}
              onChange={(e) => onMotifChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows="4"
              placeholder="Expliquez pourquoi cet incident est rejeté..."
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Modal de création/modification de professionnel
 */
const ProfessionnelModal = ({ form, secteurs, isEditing, onChange, onSubmit, onClose }) => {
  const updateField = (field, value) => {
    onChange({ ...form, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 my-8">
        <form onSubmit={onSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              {isEditing ? 'Modifier' : 'Nouveau'} Professionnel
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => updateField('nom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom
              </label>
              <input
                type="text"
                value={form.prenom}
                onChange={(e) => updateField('prenom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe {!isEditing && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={form.motDePasse}
                onChange={(e) => updateField('motDePasse', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required={!isEditing}
                placeholder={isEditing ? 'Laisser vide pour ne pas modifier' : ''}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                value={form.telephone}
                onChange={(e) => updateField('telephone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secteur <span className="text-red-500">*</span>
              </label>
              <select
                value={form.secteurAffectate}
                onChange={(e) => updateField('secteurAffectate', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez un secteur</option>
                {secteurs.map((secteur) => (
                  <option key={secteur.id} value={secteur.id}>
                    {secteur.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spécialité / Type d'incident <span className="text-red-500">*</span>
              </label>
              <select
                value={form.typeIncident}
                onChange={(e) => updateField('typeIncident', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez une spécialité</option>
                <option value="EAU">Eau</option>
                <option value="ELECTRICITE">Électricité</option>
                <option value="ROUTE">Route</option>
                <option value="ASSAINISSEMENT">Assainissement</option>
                <option value="ECLAIRAGE_PUBLIC">Éclairage Public</option>
                <option value="DECHETS">Déchets</option>
                <option value="ESPACES_VERTS">Espaces Verts</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isEditing ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
