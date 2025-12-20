import { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  MapPin,
  BarChart3
} from 'lucide-react';
import { incidentsAPI } from '../services/api';
import { SECTEURS, STATUTS_INCIDENTS, getSecteurNom, getStatut } from '../data/constants';

/**
 * Page Tableau de Bord - Affiche les statistiques sur les incidents
 * Connecté au backend Spring Boot
 */
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Charge les incidents et calcule les statistiques
   */
  useEffect(() => {
    const fetchStatsFromIncidents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer tous les incidents
        const incidents = await incidentsAPI.getAll();
        
        // Calculer les statistiques
        const total = incidents.length;
        const traites = incidents.filter(i => i.statut === 'TRAITE').length;
        const enCours = incidents.filter(i => i.statut === 'EN_COURS_DE_TRAITEMENT').length;
        const rejetes = incidents.filter(i => i.statut === 'REJETE').length;
        const valides = incidents.filter(i => i.statut === 'VALIDE').length;
        const priseEnCompte = incidents.filter(i => i.statut === 'PRISE_EN_COMPTE').length;
        
        // Calculer les stats par secteur
        const secteurStats = (SECTEURS || []).filter(secteur => secteur && secteur.id).reduce((acc, secteur) => {
          const incidentsSecteur = incidents.filter(i => i.secteurId === secteur.id);
          acc[secteur.id] = {
            nom: secteur.nom,
            total: incidentsSecteur.length,
            traites: incidentsSecteur.filter(i => i.statut === 'TRAITE').length
          };
          return acc;
        }, {});

        // Calculer les stats par province (exemple avec des données simulées)
        const parProvince = incidents.reduce((acc, incident) => {
          const province = incident.province || 'Province inconnue';
          acc[province] = (acc[province] || 0) + 1;
          return acc;
        }, {});

        // Calculer les stats par statut
        const parStatut = incidents.reduce((acc, incident) => {
          const statut = incident.statut || 'STATUT_INCONNU';
          acc[statut] = (acc[statut] || 0) + 1;
          return acc;
        }, {});

        setStats({
          total,
          traites,
          enCours,
          rejetes,
          valides,
          priseEnCompte,
          parSecteur: secteurStats,
          parProvince,
          parStatut,
          incidents: incidents.slice(0, 5) // Les 5 derniers incidents pour l'affichage
        });
        
      } catch (err) {
        console.error('Erreur de récupération des statistiques:', err);
        setError('Impossible de charger les statistiques. Vérifiez que le backend (port 8085) est démarré.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatsFromIncidents();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spin" style={{ display: 'inline-block', marginBottom: '1rem' }}>
            <Clock size={48} />
          </div>
          <p>Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
          <p style={{ color: '#ef4444' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calcul du taux de résolution
  const tauxResolution = stats.total > 0 
    ? ((stats.traites / stats.total) * 100).toFixed(1)
    : 0;

  return (
    <div className="page">
      <div className="container">
        {/* En-tête */}
        <div className="dashboard-header" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 className="page-title">
              <BarChart3 size={32} style={{ marginRight: '0.75rem' }} />
              Tableau de Bord
            </h1>
            <p className="page-subtitle">
              Vue d'ensemble et statistiques des incidents signalés
            </p>
          </div>
        </div>

        {/* Cartes de statistiques principales */}
        <div className="grid-4" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#3b82f6' }}>
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Incidents</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#10b981' }}>
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.traites}</div>
              <div className="stat-label">Incidents Traités</div>
              <div className="stat-extra" style={{ color: '#10b981', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                {tauxResolution}% de résolution
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#f59e0b' }}>
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.enCours}</div>
              <div className="stat-label">En Cours de Traitement</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: '#8b5cf6' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stats.nouveaux}</div>
              <div className="stat-label">Nouveaux Incidents</div>
            </div>
          </div>
        </div>

        {/* Répartition par Secteur */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <BarChart3 size={24} style={{ marginRight: '0.5rem' }} />
            Répartition par Secteur
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {SECTEURS?.filter(secteur => secteur && secteur.id).map((secteur) => {
              const count = (stats.parSecteur && stats.parSecteur[secteur.id] && stats.parSecteur[secteur.id].total) || 0;
              const percentage = stats.total > 0 
                ? ((count / stats.total) * 100).toFixed(1)
                : 0;
              
              return (
                <div key={secteur.id}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: secteur.color
                      }} />
                      <span style={{ fontWeight: '500' }}>{secteur.nom}</span>
                    </div>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}>
                      <span style={{ 
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                      }}>
                        {percentage}%
                      </span>
                      <span style={{ 
                        fontWeight: '600',
                        minWidth: '40px',
                        textAlign: 'right'
                      }}>
                        {count}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: 'var(--bg-secondary)',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: secteur.color,
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          {/* Top 5 Provinces */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <MapPin size={24} style={{ marginRight: '0.5rem' }} />
              Top 5 Provinces
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(stats.parProvince || {})
                .filter(([province, count]) => province && typeof count === 'number')
                .sort((a, b) => (b[1] || 0) - (a[1] || 0))
                .slice(0, 5)
                .map(([province, count], index) => {
                  const maxCount = Math.max(...Object.values(stats.parProvince || {}), 1);
                  const percentage = ((count / maxCount) * 100).toFixed(0);
                  
                  return (
                    <div key={province}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-color)',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                          }}>
                            {index + 1}
                          </div>
                          <span style={{ fontWeight: '500' }}>{province}</span>
                        </div>
                        <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                          {count}
                        </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '6px',
                        backgroundColor: 'var(--bg-secondary)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${percentage}%`,
                          height: '100%',
                          backgroundColor: 'var(--primary-color)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Distribution par Statut */}
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
              <CheckCircle size={24} style={{ marginRight: '0.5rem' }} />
              Distribution par Statut
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {STATUTS_INCIDENTS.filter(statut => statut && statut.value).map((statut) => {
                const count = (stats.parStatut && stats.parStatut[statut.value]) || 0;
                const percentage = stats.total > 0 
                  ? ((count / stats.total) * 100).toFixed(1)
                  : 0;
                
                // Ne pas afficher si count = 0
                if (count === 0) return null;
                
                return (
                  <div 
                    key={statut.value}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span className={`badge badge-${statut.color}`}>
                        {statut.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        fontSize: '0.875rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {percentage}%
                      </span>
                      <span style={{ 
                        fontWeight: '600',
                        minWidth: '30px',
                        textAlign: 'right'
                      }}>
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Résumé Global */}
        <div className="card" style={{ backgroundColor: 'var(--primary-color)', color: 'white' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '2rem'
          }}>
            <div>
              <h3 style={{ marginBottom: '0.5rem', color: 'white' }}>
                Résumé Global
              </h3>
              <p style={{ opacity: 0.9, margin: 0 }}>
                Performance et statistiques clés de la plateforme
              </p>
            </div>
            <div style={{ 
              display: 'flex',
              gap: '3rem',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                  {Object.keys(stats.parProvince || {}).length}
                </div>
                <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  Provinces couvertes
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                  {SECTEURS.length}
                </div>
                <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  Secteurs actifs
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: '700' }}>
                  {tauxResolution}%
                </div>
                <div style={{ opacity: 0.9, fontSize: '0.875rem' }}>
                  Taux de résolution
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
