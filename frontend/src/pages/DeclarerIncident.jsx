import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Camera, 
  Upload, 
  Send, 
  AlertCircle,
  CheckCircle2,
  Info,
  User,
  MapIcon,
  FileText,
  Tag
} from 'lucide-react';
import { citoyensAPI, secteursAPI } from '../services/api';
import { PROVINCES_MAP } from '../data/constants';

/**
 * Page de déclaration d'incident
 * Utilise l'API backend pour créer un nouvel incident
 */
const DeclarerIncident = () => {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    typeIncident: '',
    latitude: '',
    longitude: '',
    secteurId: '',
    provinceId: '',
    ime: ''
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [secteurs, setSecteurs] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormValid, setIsFormValid] = useState(false);

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'titre':
        if (!value.trim()) errors.titre = 'Le titre est obligatoire';
        else if (value.length < 5) errors.titre = 'Le titre doit contenir au moins 5 caractères';
        else if (value.length > 100) errors.titre = 'Le titre ne peut pas dépasser 100 caractères';
        break;
      case 'description':
        if (!value.trim()) errors.description = 'La description est obligatoire';
        else if (value.length < 20) errors.description = 'La description doit contenir au moins 20 caractères';
        break;
      case 'typeIncident':
        if (!value) errors.typeIncident = 'Le type d\'incident est obligatoire';
        break;
      case 'secteurId':
        if (!value) errors.secteurId = 'Le secteur est obligatoire';
        break;
      case 'ime':
        if (!value) errors.ime = 'L\'IME est obligatoire';
        else if (!/^\d{8,12}$/.test(value)) errors.ime = 'L\'IME doit contenir entre 8 et 12 chiffres';
        break;
      default:
        break;
    }
    
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validation en temps réel
    const fieldError = validateField(name, value);
    setFieldErrors(prev => ({
      ...prev,
      ...fieldError,
      [name]: fieldError[name] || undefined
    }));
    
    // Effacer les messages globaux
    if (error) setError('');
    if (message) setMessage('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Charger les secteurs depuis l'API
  useEffect(() => {
    const loadSecteurs = async () => {
      try {
        const data = await secteursAPI.getAll();
        console.log('Secteurs chargés depuis l\'API:', data);
        setSecteurs(data);
      } catch (err) {
        console.error('Erreur lors du chargement des secteurs:', err);
        setError('Impossible de charger les secteurs');
      }
    };
    loadSecteurs();
  }, []);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('La géolocalisation n\'est pas supportée par ce navigateur');
      return;
    }
    
    setIsLocationLoading(true);
    setError(''); // Effacer les erreurs précédentes
    
    // Essayer d'abord avec enableHighAccuracy: false (plus rapide)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setIsLocationLoading(false);
        setMessage('Position obtenue avec succès!');
        setTimeout(() => setMessage(''), 3000); // Effacer le message après 3s
      },
      (error) => {
        // Si la première tentative échoue, essayer avec enableHighAccuracy: true
        if (error.code === error.TIMEOUT) {
          console.log('Première tentative expirée, essai avec haute précision...');
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setFormData(prev => ({
                ...prev,
                latitude: position.coords.latitude.toFixed(6),
                longitude: position.coords.longitude.toFixed(6)
              }));
              setIsLocationLoading(false);
              setMessage('Position obtenue avec succès!');
              setTimeout(() => setMessage(''), 3000);
            },
            (error) => {
              setIsLocationLoading(false);
              let errorMessage = 'Impossible d\'obtenir la géolocalisation: ';
              switch(error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage += 'Permission refusée. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.';
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage += 'Position indisponible. Vérifiez que le GPS/localisation est activé sur votre appareil.';
                  break;
                case error.TIMEOUT:
                  errorMessage += 'Délai d\'attente dépassé. Vous pouvez saisir les coordonnées manuellement.';
                  break;
                default:
                  errorMessage += 'Erreur inconnue.';
                  break;
              }
              setError(errorMessage);
            },
            {
              enableHighAccuracy: true,
              timeout: 30000, // 30 secondes pour haute précision
              maximumAge: 0
            }
          );
        } else {
          setIsLocationLoading(false);
          let errorMessage = 'Impossible d\'obtenir la géolocalisation: ';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Permission refusée. Veuillez autoriser la géolocalisation dans les paramètres de votre navigateur.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Position indisponible. Vérifiez que le GPS/localisation est activé sur votre appareil.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Délai d\'attente dépassé. Vous pouvez saisir les coordonnées manuellement.';
              break;
            default:
              errorMessage += 'Erreur inconnue.';
              break;
          }
          setError(errorMessage);
        }
      },
      {
        enableHighAccuracy: false, // Plus rapide
        timeout: 15000, // 15 secondes
        maximumAge: 60000 // Accepter une position de moins d'1 minute
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      // Validation complète du formulaire
      const allErrors = {};
      Object.keys(formData).forEach(key => {
        if (['titre', 'description', 'typeIncident', 'secteurId', 'ime'].includes(key)) {
          const fieldError = validateField(key, formData[key]);
          Object.assign(allErrors, fieldError);
        }
      });
      
      if (Object.keys(allErrors).length > 0) {
        setFieldErrors(allErrors);
        throw new Error('Veuillez corriger les erreurs dans le formulaire');
      }

      // Préparer les données pour l'API
      const incidentData = {
        ...formData,
        secteurId: parseInt(formData.secteurId),
        provinceId: 0, // Temporairement désactivé pour éviter l'erreur de contrainte
        ime: parseInt(formData.ime),
        dateDeclaration: new Date().toISOString(),
        statut: 'REDIGE'
      };

      // Envoyer à l'API
      const result = await citoyensAPI.declarerIncident(incidentData, photo);
      
      setMessage('Incident déclaré avec succès ! ID: ' + result.id);
      
      // Réinitialiser le formulaire
      setFormData({
        titre: '',
        description: '',
        typeIncident: '',
        latitude: '',
        longitude: '',
        secteurId: '',
        provinceId: '',
        ime: ''
      });
      setPhoto(null);
      setPhotoPreview(null);
      
    } catch (err) {
      setError('Erreur lors de la déclaration: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '600px' }}>
        <div className="page-header">
          <h1 className="page-title">Déclarer un incident</h1>
          <p className="page-description">
            Signalez un incident dans votre ville de manière rapide et efficace
          </p>
          
          {/* Indicateur de progression */}
          <div className="progress-indicator" style={{ marginTop: '1.5rem' }}>
            <div className="step-indicators" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="step active" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>1</div>
                <span style={{ fontSize: '14px', color: 'var(--primary-color)', fontWeight: '500' }}>Informations</span>
              </div>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border-color)', margin: 'auto 0' }}></div>
              <div className="step" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>2</div>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Localisation</span>
              </div>
              <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--border-color)', margin: 'auto 0' }}></div>
              <div className="step" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--border-color)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600' }}>3</div>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Confirmation</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card">
          {/* Titre */}
          <div className="form-group">
            <label htmlFor="titre" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} />
              Titre de l'incident *
            </label>
            <input
              type="text"
              id="titre"
              name="titre"
              value={formData.titre}
              onChange={handleChange}
              className={`form-input ${fieldErrors.titre ? 'error' : formData.titre.length >= 5 ? 'success' : ''}`}
              placeholder="Ex: Nid de poule sur l'avenue Mohammed V"
              maxLength="100"
              required
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
              {fieldErrors.titre && (
                <span style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <AlertCircle size={12} />
                  {fieldErrors.titre}
                </span>
              )}
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                {formData.titre.length}/100
              </span>
            </div>
            <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={12} />
              Soyez précis et concis. Ex: "Fuite d'eau rue X" ou "Éclairage défaillant avenue Y"
            </div>
          </div>

          {/* Description */}
          <div className="form-group enhanced">
            <label htmlFor="description" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={16} />
              Description détaillée *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`form-textarea ${fieldErrors.description ? 'error' : ''}`}
              rows="5"
              placeholder="📝 Décrivez l'incident observé (localisation, nature du problème, urgence...)"
              required
            />
            {fieldErrors.description && (
              <span className="form-error-message" style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                <AlertCircle size={12} />
                {fieldErrors.description}
              </span>
            )}

          </div>

          {/* Type d'incident */}
          <div className="form-group">
            <label htmlFor="typeIncident" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Tag size={16} />
              Catégorie d'incident *
            </label>
            <select
              id="typeIncident"
              name="typeIncident"
              value={formData.typeIncident}
              onChange={handleChange}
              className={`form-select ${fieldErrors.typeIncident ? 'error' : formData.typeIncident ? 'success' : ''}`}
              required
            >
              <option value="">🏷️ Sélectionner la catégorie</option>
              <option value="Voirie">🛣️ Voirie (nids-de-poule, chaussée dégradée)</option>
              <option value="Éclairage public">💡 Éclairage public (lampadaire défaillant)</option>
              <option value="Assainissement">🚰 Assainissement (fuite, égout bouché)</option>
              <option value="Espaces verts">🌳 Espaces verts (arbres dangereux, jardins)</option>
              <option value="Propreté">🧹 Propreté urbaine (déchets, graffitis)</option>
              <option value="Sécurité">🛡️ Sécurité publique (signalisation défaillante)</option>
              <option value="Transport">🚌 Transport public (arrêt endommagé)</option>
              <option value="Autre">❓ Autre incident urbain</option>
            </select>
            {fieldErrors.typeIncident && (
              <span style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <AlertCircle size={12} />
                {fieldErrors.typeIncident}
              </span>
            )}
          </div>

          {/* Secteur */}
          <div className="form-group">
            <label htmlFor="secteurId" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapIcon size={16} />
              Secteur géographique *
            </label>
            <select
              id="secteurId"
              name="secteurId"
              value={formData.secteurId}
              onChange={handleChange}
              className={`form-select ${fieldErrors.secteurId ? 'error' : formData.secteurId ? 'success' : ''}`}
              required
            >
              <option value="">📍 Choisir votre secteur</option>
              {secteurs.map(secteur => (
                <option key={secteur.idSecteur} value={secteur.idSecteur}>
                  🏘️ {secteur.nomSecteur}
                </option>
              ))}
            </select>
            {fieldErrors.secteurId && (
              <span style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <AlertCircle size={12} />
                {fieldErrors.secteurId}
              </span>
            )}
            <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={12} />
              Le secteur permet d'orienter votre signalement vers le service compétent
            </div>
          </div>

          {/* Province */}
          <div className="form-group">
            <label htmlFor="provinceId" className="form-label">
              Province
            </label>
            <select
              id="provinceId"
              name="provinceId"
              value={formData.provinceId}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Sélectionner une province</option>
              {PROVINCES_MAP.map(province => (
                <option key={province.id} value={province.id}>
                  {province.nom}
                </option>
              ))}
            </select>
          </div>

          {/* IME du citoyen */}
          <div className="form-group">
            <label htmlFor="ime" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={16} />
              IME (Identifiant Municipal Électronique) *
            </label>
            <input
              type="text"
              id="ime"
              name="ime"
              value={formData.ime}
              onChange={handleChange}
              className={`form-input ${fieldErrors.ime ? 'error' : formData.ime && /^\d{8,12}$/.test(formData.ime) ? 'success' : ''}`}
              placeholder="Ex: 123456789012"
              maxLength="12"
              pattern="[0-9]{8,12}"
              required
            />
            {fieldErrors.ime && (
              <span style={{ color: 'var(--danger-color)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                <AlertCircle size={12} />
                {fieldErrors.ime}
              </span>
            )}
            <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={12} />
              Votre IME se trouve sur votre carte d'identité électronique ou certificat de résidence
            </div>
          </div>

          {/* Géolocalisation */}
          <div className="form-group" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <MapPin size={16} />
              Localisation de l'incident
            </label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Latitude (ex: 34.0209)"
                  readOnly={!formData.latitude}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Latitude</span>
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Longitude (ex: -6.8417)"
                  readOnly={!formData.longitude}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Longitude</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={isLocationLoading}
              className={`btn-secondary ${isLocationLoading ? 'loading' : ''}`}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                width: '100%',
                justifyContent: 'center',
                backgroundColor: formData.latitude && formData.longitude ? 'var(--success-color)' : undefined,
                color: formData.latitude && formData.longitude ? 'white' : undefined
              }}
            >
              {isLocationLoading ? (
                <>
                  <Upload size={16} className="spin" />
                  Localisation en cours...
                </>
              ) : formData.latitude && formData.longitude ? (
                <>
                  <CheckCircle2 size={16} />
                  Position enregistrée ✓
                </>
              ) : (
                <>
                  <MapPin size={16} />
                  📍 Obtenir ma position actuelle
                </>
              )}
            </button>
            <div className="form-help" style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Info size={12} />
              La géolocalisation précise aide les services à localiser rapidement l'incident
            </div>
          </div>

          {/* Photo */}
          <div className="form-group">
            <label htmlFor="photo" className="form-label">
              Photo (optionnelle)
            </label>
            <div className="file-upload">
              <input
                type="file"
                id="photo"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="photo" className="file-upload-label">
                <Camera size={20} />
                Ajouter une photo
              </label>
            </div>
            {photoPreview && (
              <div style={{ marginTop: '1rem' }}>
                <img
                  src={photoPreview}
                  alt="Prévisualisation"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                />
              </div>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          {message && (
            <div className="alert alert-success">
              {message}
            </div>
          )}

          {/* Résumé avant soumission */}
          {formData.titre && formData.description && formData.typeIncident && formData.secteurId && formData.ime && (
            <div style={{ 
              border: '1px solid var(--success-color)', 
              borderRadius: '8px', 
              padding: '1rem', 
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              marginBottom: '1rem'
            }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--success-color)' }}>
                <CheckCircle2 size={16} />
                Résumé de votre déclaration
              </h4>
              <div style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                <p><strong>Incident:</strong> {formData.titre}</p>
                <p><strong>Type:</strong> {formData.typeIncident}</p>
                <p><strong>Secteur:</strong> {secteurs.find(s => s.idSecteur == formData.secteurId)?.nomSecteur || 'N/A'}</p>
                {formData.latitude && formData.longitude && (
                  <p><strong>Position:</strong> GPS activée ✓</p>
                )}
              </div>
            </div>
          )}

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key])}
            className="btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '1rem',
              fontSize: '16px',
              fontWeight: '600',
              opacity: isSubmitting || Object.keys(fieldErrors).some(key => fieldErrors[key]) ? 0.6 : 1
            }}
          >
            {isSubmitting ? (
              <>
                <Upload size={20} className="spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send size={20} />
                🚀 Envoyer ma déclaration
              </>
            )}
          </button>
          
          <div className="form-help" style={{ 
            fontSize: '12px', 
            color: 'var(--text-secondary)', 
            marginTop: '1rem', 
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            justifyContent: 'center'
          }}>
            <Info size={12} />
            Vous recevrez un numéro de suivi après validation de votre déclaration
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeclarerIncident;