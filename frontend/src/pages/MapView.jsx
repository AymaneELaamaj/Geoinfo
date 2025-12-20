import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Filter, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// CSS pour les marqueurs personnalisés
const markerStyles = `
  .custom-incident-marker {
    transition: transform 0.2s ease, filter 0.2s ease;
  }
  
  .custom-incident-marker:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
    z-index: 1000 !important;
  }
  
  .leaflet-cluster-anim .leaflet-marker-icon, 
  .leaflet-cluster-anim .leaflet-marker-shadow {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  /* Style amélioré pour les petits clusters (2-10 incidents) */
  .marker-cluster-small {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.15)) !important;
    border: 3px solid #3b82f6 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px) !important;
  }
  
  .marker-cluster-small:hover {
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
    opacity: 0.9 !important;
    pointer-events: auto !important;
  }
  
  .marker-cluster-small div {
    background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
    color: white !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
  }
  
  /* Style amélioré pour les clusters moyens (11-50 incidents) */
  .marker-cluster-medium {
    background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(245, 158, 11, 0.15)) !important;
    border: 3px solid #f59e0b !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px) !important;
  }
  
  .marker-cluster-medium:hover {
    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
    opacity: 0.9 !important;
    pointer-events: auto !important;
  }
  
  .marker-cluster-medium div {
    background: linear-gradient(135deg, #f59e0b, #d97706) !important;
    color: white !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
  }
  
  /* Style amélioré pour les grands clusters (50+ incidents) */
  .marker-cluster-large {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(239, 68, 68, 0.15)) !important;
    border: 3px solid #ef4444 !important;
    border-radius: 50% !important;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.2) !important;
    backdrop-filter: blur(8px) !important;
    animation: pulse 2s infinite !important;
  }
  
  .marker-cluster-large:hover {
    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3) !important;
    opacity: 0.9 !important;
    animation: none !important;
    pointer-events: auto !important;
  }
  
  .marker-cluster-large div {
    background: linear-gradient(135deg, #ef4444, #dc2626) !important;
    color: white !important;
    font-weight: 700 !important;
    font-size: 14px !important;
    border-radius: 50% !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
    box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2) !important;
  }
  
  /* Animation de pulsation pour les gros clusters */
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.9;
    }
  }
  
  /* Effet de survol global pour tous les clusters - compatible avec Leaflet */
  .marker-cluster {
    cursor: pointer !important;
  }
  
  /* Permettre les événements de clic sur les clusters */
  .leaflet-marker-icon.marker-cluster {
    pointer-events: auto !important;
  }
  
  /* Désactiver les événements sur les éléments internes pour éviter les conflits */
  .marker-cluster div, .marker-cluster span {
    pointer-events: none !important;
  }
`;

// Injecter les styles dans le document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = markerStyles;
  document.head.appendChild(styleElement);
}
import { incidentsAPI, secteursAPI } from '../services/api';
import { PROVINCES_MAP, STATUTS_INCIDENTS, getStatut, getProvinceNom } from '../data/constants';

// Création d'icônes personnalisées pour les incidents
const createCustomIcon = (color, symbol) => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 16px;
        color: white;
        cursor: pointer;
        position: relative;
      ">
        ${symbol}
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 8px solid ${color};
        "></div>
      </div>
    `,
    className: 'custom-incident-marker',
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -38]
  });
};

// Icônes par type d'incident
const getIncidentIcon = (typeIncident, statut) => {
  const statutColors = {
    'REDIGE': '#6b7280',           // Gris
    'PRISE_EN_COMPTE': '#6366f1',  // Indigo
    'VALIDE': '#3b82f6',           // Bleu
    'EN_COURS_DE_TRAITEMENT': '#f59e0b', // Orange
    'TRAITE': '#10b981',           // Vert
    'REJETE': '#ef4444',           // Rouge
    'BLOQUE': '#dc2626'            // Rouge foncé
  };

  const typeSymbols = {
    'Infrastructure': '🏗️',
    'Voirie': '🛣️',
    'Environnement': '🌱',
    'Sécurité': '🚨',
    'Services Publics': '🏛️',
    'Transport': '🚌',
    'Éclairage public': '💡',
    'Assainissement': '🚰',
    'Espaces verts': '🌳',
    'Propreté': '🧹',
    'Autre': '⚠️',
    'default': '📍'
  };

  const color = statutColors[statut] || '#6b7280';
  const symbol = typeSymbols[typeIncident] || typeSymbols['default'];
  
  return createCustomIcon(color, symbol);
};

/**
 * Composant pour ajuster la vue de la carte
 */
const MapUpdater = ({ incidents }) => {
  const map = useMap();

  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = L.latLngBounds(
        incidents.map(incident => [parseFloat(incident.latitude), parseFloat(incident.longitude)])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [incidents, map]);

  return null;
};

/**
 * Page Carte - Visualisation géographique des incidents
 * Connectée au backend Spring Boot
 */
const MapView = () => {
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    secteur: '',
    province: '',
    statut: '',
  });
  const [showClusters, setShowClusters] = useState(true);
  const [secteurs, setSecteurs] = useState([]);

  // Fonction locale pour obtenir le nom du secteur
  const getSecteurNom = (secteurId) => {
    const secteur = secteurs.find(s => s.id === secteurId);
    return secteur ? secteur.nom : 'Secteur inconnu';
  };

  /**
   * Charge les incidents depuis le backend
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger les incidents
        const incidentsData = await incidentsAPI.getAll();
        console.log('Incidents récupérés du backend:', incidentsData);
        console.log('Premier incident:', incidentsData[0]);
        setIncidents(incidentsData);
        setFilteredIncidents(incidentsData);

        // Charger les secteurs
        const secteursData = await secteursAPI.getAll();
        console.log('Secteurs récupérés du backend:', secteursData);
        setSecteurs(secteursData);
      } catch (err) {
        console.error('Erreur de récupération des données:', err);
        setError('Impossible de charger les données. Vérifiez que le backend est démarré.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Initialise les incidents filtrés avec tous les incidents valides au chargement
   */
  useEffect(() => {
    // Au chargement, afficher tous les incidents avec coordonnées valides
    const validIncidents = incidents.filter(incident => {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
    
    console.log('Incidents avec coordonnées valides:', validIncidents);
    setFilteredIncidents(validIncidents);
  }, [incidents]); // Ne dépend que des incidents, pas des filtres

  /**
   * Gère le changement de filtre (sans appliquer automatiquement)
   */
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  /**
   * Applique les filtres manuellement quand on clique sur "Chercher"
   */
  const handleSearch = () => {
    let filtered = [...incidents];

    // Filtrer d'abord les incidents avec des coordonnées valides
    filtered = filtered.filter(incident => {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });

    if (filters.secteur) {
      filtered = filtered.filter(i => i.secteurId === parseInt(filters.secteur));
    }

    if (filters.province) {
      filtered = filtered.filter(i => i.provinceId === parseInt(filters.province));
    }

    if (filters.statut) {
      filtered = filtered.filter(i => i.statut === filters.statut);
    }

    console.log('Filtres appliqués:', filters);
    console.log('Incidents filtrés:', filtered);
    setFilteredIncidents(filtered);
  };

  /**
   * Réinitialise les filtres ET réaffiche tous les incidents
   */
  const resetFilters = () => {
    setFilters({ secteur: '', province: '', statut: '' });
    
    // Réafficher tous les incidents avec coordonnées valides
    const validIncidents = incidents.filter(incident => {
      const lat = parseFloat(incident.latitude);
      const lng = parseFloat(incident.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
    
    setFilteredIncidents(validIncidents);
  };



  /**
   * Formate une date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Centre de la carte (Maroc)
  const centerPosition = [32.0, -6.5];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Carte des Incidents</h1>
          <p className="page-description">
            Visualisation géographique de {filteredIncidents.length} incident(s)
          </p>
        </div>

        {/* Filtres */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Filter size={20} style={{ marginRight: '0.5rem' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Filtres</h2>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={showClusters}
                onChange={(e) => setShowClusters(e.target.checked)}
              />
              <span>Afficher en clusters</span>
            </label>
          </div>

          <div className="grid grid-4">
            <div className="form-group">
              <label className="form-label">Secteur</label>
              <select 
                className="form-select"
                value={filters.secteur}
                onChange={(e) => handleFilterChange('secteur', e.target.value)}
              >
                <option value="">Tous les secteurs</option>
                {secteurs && secteurs.map(secteur => secteur && secteur.id ? (
                  <option key={secteur.id} value={secteur.id}>
                    {secteur.nom}
                  </option>
                ) : null)}
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
                {PROVINCES_MAP && PROVINCES_MAP.map(province => province && province.id ? (
                  <option key={province.id} value={province.nom}>
                    {province.nom}
                  </option>
                ) : null)}
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
                  <option key={statut.value} value={statut.value}>
                    {statut.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
              <button 
                className="btn btn-primary"
                onClick={handleSearch}
                style={{ flex: '1' }}
              >
                🔍 Chercher
              </button>
              <button 
                className="btn btn-secondary"
                onClick={resetFilters}
                style={{ flex: '1' }}
              >
                🔄 Réinitialiser
              </button>
            </div>
          </div>
        </div>

        {/* Carte */}
        <div style={{ height: '600px', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}>
          {/* Légende flottante */}
          <div style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            zIndex: 1000,
            backgroundColor: 'rgba(55, 65, 81, 0.95)',
            color: 'white',
            borderRadius: '12px',
            padding: '16px',
            minWidth: '220px',
            fontSize: '13px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)'
          }}>
            {/* Header */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>LIVE MONITOR</span>
              </div>
              

            </div>
            
            {/* Légende */}
            <div>
              <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '12px' }}>LÉGENDE</div>
              
              {/* Types d'incidents */}
              <div style={{ marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#3b82f6', borderRadius: '50%' }}></div>
                  <span>Infrastructure</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#10b981', borderRadius: '50%' }}></div>
                  <span>Environnement</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
                  <span>Sécurité</span>
                </div>
              </div>
              
              {/* Secteurs */}
              <div style={{ marginBottom: '6px' }}>
                <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>SECTEURS</div>
                {secteurs && secteurs.map(secteur => secteur && secteur.id ? (
                  <div key={secteur.id} style={{ marginBottom: '2px' }}>
                    <span style={{ fontSize: '11px' }}>{secteur.nom}</span>
                  </div>
                ) : null)}
              </div>
              
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                Total: {filteredIncidents.length} incidents
              </div>
            </div>
          </div>
          
          <MapContainer 
            center={centerPosition} 
            zoom={6} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater incidents={filteredIncidents} />

            {showClusters ? (
              <MarkerClusterGroup
                chunkedLoading
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
                maxClusterRadius={80}
                disableClusteringAtZoom={18}
                spiderfyDistanceMultiplier={2}
              >
                {filteredIncidents.map(incident => {
                  const statut = getStatut(incident.statut);
                  
                  // Vérifier que les coordonnées sont valides
                  const lat = parseFloat(incident.latitude);
                  const lng = parseFloat(incident.longitude);
                  
                  if (isNaN(lat) || isNaN(lng)) {
                    console.warn(`Incident ${incident.id} a des coordonnées invalides:`, {lat, lng});
                    return null; // Ne pas afficher ce marqueur
                  }
                  
                  return (
                    <Marker 
                      key={incident.id}
                      position={[lat, lng]}
                      icon={getIncidentIcon(incident.typeIncident, incident.statut)}
                    >
                      <Popup>
                        <div style={{ minWidth: '250px' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                            Incident #{incident.id}
                          </h3>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Secteur:</strong> {getSecteurNom(incident.secteurId)}
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Type:</strong> {incident.typeIncident}
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Description:</strong> {incident.description}
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Province:</strong> {incident.province}
                          </div>
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Statut:</strong>{' '}
                            <span className={`badge badge-${statut.color}`}>
                              {statut.label}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            {formatDate(incident.dateDeclaration)}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            ) : (
              filteredIncidents.map(incident => {
                const statut = getStatut(incident.statut);
                
                // Vérifier que les coordonnées sont valides
                const lat = parseFloat(incident.latitude);
                const lng = parseFloat(incident.longitude);
                
                if (isNaN(lat) || isNaN(lng)) {
                  console.warn(`Incident ${incident.id} a des coordonnées invalides:`, {lat, lng});
                  return null; // Ne pas afficher ce marqueur
                }
                
                return (
                  <Marker 
                    key={incident.id}
                    position={[lat, lng]}
                    icon={getIncidentIcon(incident.typeIncident, incident.statut)}
                  >
                    <Popup>
                      <div style={{ minWidth: '250px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                          Incident #{incident.id}
                        </h3>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Secteur:</strong> {getSecteurNom(incident.secteurId)}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Type:</strong> {incident.typeIncident}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Description:</strong> {incident.description}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Province:</strong> {incident.province}
                        </div>
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong>Statut:</strong>{' '}
                          <span className={`badge badge-${statut.color}`}>
                            {statut.label}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {formatDate(incident.dateDeclaration)}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })
            )}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapView;

