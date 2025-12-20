import { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  AlertTriangle,
  TrendingUp,
  FileText,
  Activity
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import IncidentCard from '../../components/IncidentCard';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboard();
      setDashboard(data);
      setError(null);
    } catch (err) {
      console.error('Erreur dashboard admin:', err);
      setError('Impossible de charger les données du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Chargement du dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-container">
          <AlertTriangle className="error-icon" />
          <h2>Erreur</h2>
          <p>{error}</p>
          <button onClick={fetchDashboard} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Tableau de Bord Administrateur</h1>
        <p className="dashboard-subtitle">
          Vue d'ensemble de la plateforme de gestion des incidents
        </p>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="stats-grid">
        <StatCard
          icon={<Clock />}
          title="En Attente"
          value={dashboard.incidentsEnAttente}
          subtitle="À valider"
          color="orange"
          trend={dashboard.incidentsEnAttente > 10 ? 'high' : 'normal'}
        />
        
        <StatCard
          icon={<CheckCircle />}
          title="Validés"
          value={dashboard.incidentsValides}
          subtitle="Publiés"
          color="green"
        />
        
        <StatCard
          icon={<XCircle />}
          title="Rejetés"
          value={dashboard.incidentsRejetes}
          subtitle="Non conformes"
          color="red"
        />
        
        <StatCard
          icon={<Activity />}
          title="Traités"
          value={dashboard.incidentsTraites}
          subtitle="Terminés"
          color="blue"
        />
      </div>

      {/* Statistiques des professionnels */}
      <div className="stats-grid-secondary">
        <StatCard
          icon={<Users />}
          title="Professionnels"
          value={dashboard.totalProfessionnels}
          subtitle={`${dashboard.professionnelsActifs} actifs`}
          color="purple"
        />
        
        <StatCard
          icon={<TrendingUp />}
          title="Taux de Validation"
          value={`${dashboard.tauxValidation?.toFixed(1) || 0}%`}
          subtitle="Incidents approuvés"
          color="indigo"
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          {/* Incidents récents */}
          <div className="recent-incidents">
            <div className="section-header">
              <h2>
                <FileText />
                Incidents Récents
              </h2>
              <button 
                onClick={() => window.location.href = '/admin/incidents'}
                className="btn-outline"
              >
                Voir tous
              </button>
            </div>
            
            <div className="incidents-list">
              {dashboard.dernierIncidents?.length > 0 ? (
                dashboard.dernierIncidents.slice(0, 5).map(incident => (
                  <IncidentCard 
                    key={incident.id} 
                    incident={incident}
                    showActions={false}
                    compact={true}
                  />
                ))
              ) : (
                <div className="empty-state">
                  <p>Aucun incident récent</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          {/* Répartition par secteur */}
          <div className="secteur-stats">
            <div className="section-header">
              <h2>Répartition par Secteur</h2>
            </div>
            
            <div className="secteur-grid">
              {dashboard.incidentsParSecteur && Object.entries(dashboard.incidentsParSecteur).map(([secteur, count]) => (
                <div key={secteur} className="secteur-item">
                  <span className="secteur-name">{secteur}</span>
                  <div className="secteur-bar">
                    <div 
                      className="secteur-progress"
                      style={{ 
                        width: `${(count / Math.max(...Object.values(dashboard.incidentsParSecteur))) * 100}%` 
                      }}
                    ></div>
                    <span className="secteur-count">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition par statut */}
          <div className="statut-stats">
            <div className="section-header">
              <h2>Répartition par Statut</h2>
            </div>
            
            <div className="statut-grid">
              {dashboard.incidentsParStatut && Object.entries(dashboard.incidentsParStatut).map(([statut, count]) => (
                <div key={statut} className="statut-item">
                  <span className="statut-badge" data-statut={statut.toLowerCase()}>
                    {statut.replace(/_/g, ' ')}
                  </span>
                  <span className="statut-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions">
        <h2>Actions Rapides</h2>
        <div className="actions-grid">
          <button 
            onClick={() => window.location.href = '/admin/incidents'}
            className="action-card"
          >
            <Clock />
            <span>Gérer les Incidents</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/professionnels'}
            className="action-card"
          >
            <Users />
            <span>Gérer les Professionnels</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/admin/rapports'}
            className="action-card"
          >
            <FileText />
            <span>Rapports & Statistiques</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;