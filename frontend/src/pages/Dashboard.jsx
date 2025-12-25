import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2
} from 'lucide-react';
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  isAfter,
  format,
  eachDayOfInterval,
  subWeeks
} from 'date-fns';
import { fr } from 'date-fns/locale';

// Import des nouveaux composants dashboard
import StatCard from '../components/dashboard/StatCard';
import LineChartCard from '../components/dashboard/LineChartCard';
import DonutChartCard from '../components/dashboard/DonutChartCard';
import ProvincesList from '../components/dashboard/ProvincesList';
import TimeFilter from '../components/dashboard/TimeFilter';
import PerformanceCard from '../components/dashboard/PerformanceCard';

// API et constantes
import { incidentsAPI } from '../services/api';
import { SECTEURS, STATUTS_INCIDENTS } from '../data/constants';

import './Dashboard.css';

/**
 * Tableau de Bord Principal - Design Professionnel
 * Interface moderne inspirée de Stripe/AWS/Vercel
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  /**
   * Charger les incidents au montage
   */
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await incidentsAPI.getAll();
      setIncidents(data);
    } catch (err) {
      console.error('Erreur de récupération des incidents:', err);
      setError('Impossible de charger les données. Vérifiez que le backend est démarré.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrer les incidents par période
   */
  const filteredIncidents = useMemo(() => {
    if (!incidents.length) return [];

    const now = new Date();
    let startDate;

    switch (selectedPeriod) {
      case 'today':
        startDate = startOfDay(now);
        break;
      case 'week':
        startDate = startOfWeek(now, { locale: fr });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      default:
        startDate = startOfWeek(now, { locale: fr });
    }

    return incidents.filter(incident => {
      if (!incident.dateDeclaration) return true;
      const incidentDate = new Date(incident.dateDeclaration);
      return isAfter(incidentDate, startDate);
    });
  }, [incidents, selectedPeriod]);

  /**
   * Calculer les statistiques
   */
  const stats = useMemo(() => {
    const total = filteredIncidents.length;
    const traites = filteredIncidents.filter(i => i.statut === 'TRAITE').length;
    const enCours = filteredIncidents.filter(i => i.statut === 'EN_COURS_DE_TRAITEMENT').length;
    const valides = filteredIncidents.filter(i => i.statut === 'VALIDE').length;
    const priseEnCompte = filteredIncidents.filter(i => i.statut === 'PRISE_EN_COMPTE').length;
    const rediges = filteredIncidents.filter(i => i.statut === 'REDIGE').length;
    const nouveaux = valides + priseEnCompte + rediges;

    const tauxResolution = total > 0 ? ((traites / total) * 100).toFixed(1) : 0;

    return { total, traites, enCours, nouveaux, tauxResolution };
  }, [filteredIncidents]);

  /**
   * Données pour le graphique donut (par secteur)
   */
  const secteurData = useMemo(() => {
    return SECTEURS.map(secteur => {
      const count = filteredIncidents.filter(i => i.secteurId === secteur.id).length;
      return {
        name: secteur.nom,
        value: count,
        color: secteur.color
      };
    }).filter(item => item.value > 0);
  }, [filteredIncidents]);

  /**
   * Données pour le graphique d'évolution (7 derniers jours)
   */
  const evolutionData = useMemo(() => {
    const now = new Date();
    const days = eachDayOfInterval({
      start: subWeeks(now, 1),
      end: now
    });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayIncidents = incidents.filter(i => {
        if (!i.dateDeclaration) return false;
        const date = new Date(i.dateDeclaration);
        return date >= dayStart && date < dayEnd;
      });

      return {
        name: format(day, 'EEE', { locale: fr }),
        declares: dayIncidents.length,
        traites: dayIncidents.filter(i => i.statut === 'TRAITE').length,
        enCours: dayIncidents.filter(i => i.statut === 'EN_COURS_DE_TRAITEMENT').length
      };
    });
  }, [incidents]);

  /**
   * Données pour les provinces
   */
  const provinceData = useMemo(() => {
    const provinceCount = {};
    filteredIncidents.forEach(incident => {
      const province = incident.province || 'Inconnu';
      provinceCount[province] = (provinceCount[province] || 0) + 1;
    });

    return Object.entries(provinceCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [filteredIncidents]);



  // État de chargement
  if (loading) {
    return (
      <div className="dashboard-loading">
        <Loader2 className="dashboard-loading-spinner" size={48} />
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="dashboard-error">
        <AlertCircle size={48} />
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={fetchIncidents} className="dashboard-retry-btn">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-icon">
            <BarChart3 size={28} />
          </div>
          <div>
            <h1 className="dashboard-title">Tableau de Bord</h1>
            <p className="dashboard-subtitle">
              Vue d'ensemble des incidents et performances
            </p>
          </div>
        </div>
      </header>

      {/* Filtres temporels */}
      <div className="dashboard-filters">
        <TimeFilter
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
          onRefresh={fetchIncidents}
          loading={loading}
        />
      </div>

      {/* Cartes KPI */}
      <div className="dashboard-stats-grid">
        <StatCard
          icon={AlertCircle}
          label="Total Incidents"
          value={stats.total}
          color="primary"
          trendLabel="sur la période"
        />
        <StatCard
          icon={CheckCircle}
          label="Incidents Traités"
          value={stats.traites}
          trend={parseFloat(stats.tauxResolution)}
          trendLabel="de résolution"
          color="success"
        />
        <StatCard
          icon={Clock}
          label="En Cours"
          value={stats.enCours}
          color="warning"
          trendLabel="en traitement"
        />
        <StatCard
          icon={TrendingUp}
          label="Nouveaux"
          value={stats.nouveaux}
          color="info"
          trendLabel="à traiter"
        />
      </div>

      {/* Graphiques */}
      <div className="dashboard-charts-grid">
        <div className="dashboard-chart-item">
          <LineChartCard
            data={evolutionData}
            title="Évolution sur 7 jours"
          />
        </div>
        <div className="dashboard-chart-item">
          <DonutChartCard
            data={secteurData}
            title="Répartition par Secteur"
          />
        </div>
      </div>

      {/* Section inférieure */}
      <div className="dashboard-bottom-grid">
        <div className="dashboard-bottom-item">
          <ProvincesList
            data={provinceData}
            title="Top 5 Provinces"
            onViewMap={() => navigate('/carte')}
          />
        </div>
        <div className="dashboard-bottom-item">
          <PerformanceCard
            tauxResolution={parseFloat(stats.tauxResolution)}
            provincesCount={Object.keys(
              filteredIncidents.reduce((acc, i) => {
                if (i.province) acc[i.province] = true;
                return acc;
              }, {})
            ).length}
            secteursCount={SECTEURS.length}
            incidentsBlocked={filteredIncidents.filter(i => i.statut === 'BLOQUE').length}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
