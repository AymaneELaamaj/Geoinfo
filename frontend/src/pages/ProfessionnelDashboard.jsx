import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Briefcase, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Eye,
  PlayCircle,
  StopCircle,
  Ban,
  ArrowRight,
  X
} from 'lucide-react';

/**
 * Dashboard Professionnel
 * Affiche uniquement les incidents VALIDE_PUBLIE du secteur et type du professionnel
 */
const ProfessionnelDashboard = () => {
  const { user } = useAuth();
  
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal de traitement
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isTraitementModalOpen, setIsTraitementModalOpen] = useState(false);
  const [nouveauStatut, setNouveauStatut] = useState('');
  const [descriptionTraitement, setDescriptionTraitement] = useState('');

  useEffect(() => {
    loadIncidents();
  }, []);

  /**
   * Charge les incidents du professionnel
   * Filtre automatique : VALIDE_PUBLIE + secteur + typeIncident
   */
  const loadIncidents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.professionnel.getMesIncidents({
        statut: 'VALIDE_PUBLIE',
        page: 0,
        size: 50
      });
      
      // Si la réponse est paginée
      const incidentsList = response.content || response;
      setIncidents(incidentsList);
    } catch (err) {
      console.error('Erreur chargement incidents:', err);
      setError(err.message || 'Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ouvre le modal de traitement
   */
  const openTraitementModal = (incident) => {
    setSelectedIncident(incident);
    setNouveauStatut('');
    setDescriptionTraitement('');
    setIsTraitementModalOpen(true);
  };

  /**
   * Ferme le modal
   */
  const closeTraitementModal = () => {
    setIsTraitementModalOpen(false);
    setSelectedIncident(null);
    setNouveauStatut('');
    setDescriptionTraitement('');
  };

  /**
   * Soumet le changement de statut
   */
  const handleSubmitTraitement = async (e) => {
    e.preventDefault();

    if (!nouveauStatut) {
      alert('⚠️ Veuillez sélectionner un statut !');
      return;
    }

    try {
      switch (nouveauStatut) {
        case 'PRIS_EN_COMPTE':
          await api.professionnel.prendreEnCompte(selectedIncident.id);
          alert('✅ Incident pris en compte !');
          break;

        case 'EN_COURS':
          await api.professionnel.demarrerTraitement(selectedIncident.id);
          alert('✅ Traitement démarré !');
          break;

        case 'TRAITE':
          if (!descriptionTraitement.trim()) {
            alert('⚠️ La description du traitement est obligatoire !');
            return;
          }
          await api.professionnel.traiterIncident(selectedIncident.id, descriptionTraitement);
          alert('✅ Incident traité avec succès !');
          break;

        case 'BLOQUE':
          if (!descriptionTraitement.trim()) {
            alert('⚠️ Le motif de blocage est obligatoire !');
            return;
          }
          await api.professionnel.bloquerIncident(selectedIncident.id, descriptionTraitement);
          alert('⚠️ Incident bloqué');
          break;

        default:
          alert('⚠️ Statut non reconnu');
          return;
      }

      closeTraitementModal();
      loadIncidents(); // Recharger la liste
    } catch (err) {
      console.error('Erreur traitement:', err);
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
          <Briefcase className="w-8 h-8 text-purple-600" />
          Mes Incidents
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenue {user?.nom} {user?.prenom} - Secteur : {user?.secteurAffectate} - Spécialité : {user?.typeIncident}
        </p>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Liste des incidents */}
      {incidents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucun incident disponible
          </h3>
          <p className="text-gray-500">
            Aucun incident validé ne correspond à votre secteur et spécialité.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-800">
              {incidents.length} incident(s) validé(s) disponible(s)
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Ces incidents sont dans votre secteur et correspondent à votre spécialité
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {incidents.map((incident) => (
              <div key={incident.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold text-gray-900">
                        #{incident.id}
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {incident.statut}
                      </span>
                      {incident.typeIncident && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {incident.typeIncident}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {incident.titre}
                    </h3>

                    <p className="text-gray-600 mb-3">
                      {incident.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Secteur :</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {incident.secteur?.nom || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Province :</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {incident.province?.nom || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Date :</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatDate(incident.dateCreation)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Adresse :</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {incident.adresse || 'Non précisée'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openTraitementModal(incident)}
                    className="ml-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Traiter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de traitement */}
      {isTraitementModalOpen && (
        <TraitementModal
          incident={selectedIncident}
          nouveauStatut={nouveauStatut}
          description={descriptionTraitement}
          onStatutChange={setNouveauStatut}
          onDescriptionChange={setDescriptionTraitement}
          onSubmit={handleSubmitTraitement}
          onClose={closeTraitementModal}
        />
      )}
    </div>
  );
};

/**
 * Modal de traitement d'incident
 */
const TraitementModal = ({
  incident,
  nouveauStatut,
  description,
  onStatutChange,
  onDescriptionChange,
  onSubmit,
  onClose
}) => {
  const needsDescription = nouveauStatut === 'TRAITE' || nouveauStatut === 'BLOQUE';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={onSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              Traiter l'incident #{incident?.id}
            </h3>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Détails de l'incident */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2">{incident?.titre}</h4>
            <p className="text-sm text-gray-600 mb-3">{incident?.description}</p>
            <div className="text-sm text-gray-500">
              Secteur : {incident?.secteur?.nom} | Type : {incident?.typeIncident}
            </div>
          </div>

          {/* Sélection du nouveau statut */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau statut <span className="text-red-500">*</span>
            </label>
            <select
              value={nouveauStatut}
              onChange={(e) => onStatutChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">-- Sélectionnez un statut --</option>
              <option value="PRIS_EN_COMPTE">✅ Pris en compte</option>
              <option value="EN_COURS">🔄 En cours de traitement</option>
              <option value="TRAITE">✔️ Traité (terminé)</option>
              <option value="BLOQUE">🚫 Bloqué</option>
            </select>
          </div>

          {/* Description (obligatoire pour TRAITE et BLOQUE) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {nouveauStatut === 'TRAITE' && 'Description du traitement'}
              {nouveauStatut === 'BLOQUE' && 'Motif de blocage'}
              {!needsDescription && 'Commentaire (optionnel)'}
              {needsDescription && <span className="text-red-500"> *</span>}
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              rows="4"
              placeholder={
                nouveauStatut === 'TRAITE'
                  ? 'Décrivez les actions effectuées pour résoudre cet incident...'
                  : nouveauStatut === 'BLOQUE'
                  ? 'Expliquez pourquoi cet incident est bloqué...'
                  : 'Ajoutez un commentaire...'
              }
              required={needsDescription}
            />
            {needsDescription && (
              <p className="text-sm text-gray-500 mt-1">
                Ce champ est obligatoire pour ce statut
              </p>
            )}
          </div>

          {/* Guide des statuts */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h5 className="text-sm font-semibold text-blue-900 mb-2">
              📘 Guide des statuts :
            </h5>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>Pris en compte :</strong> Vous avez vu l'incident et allez le traiter</li>
              <li><strong>En cours :</strong> Vous êtes en train de résoudre le problème</li>
              <li><strong>Traité :</strong> Le problème est résolu (description obligatoire)</li>
              <li><strong>Bloqué :</strong> Impossible de traiter pour l'instant (motif obligatoire)</li>
            </ul>
          </div>

          {/* Boutons d'action */}
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionnelDashboard;
