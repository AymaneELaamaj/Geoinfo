import { Link } from 'react-router-dom';

/**
 * Page d'accueil - Présentation de la plateforme
 */
const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section avec fond de carte */}
      <div className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 className="hero-title">
            Plateforme de Gestion des<br />Incidents Urbains
          </h1>
          <p className="hero-description">
            Une solution moderne pour déclarer, suivre et traiter les incidents dans votre ville
          </p>
          <div className="hero-buttons">
            <Link to="/tableau-de-bord" className="btn-hero-primary">
              Voir le Tableau de Bord
            </Link>
            <Link to="/incidents" className="btn-hero-secondary">
              Liste des Incidents
            </Link>
          </div>
        </div>
      </div>

      {/* Section Fonctionnalités */}
      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Comment ça fonctionne ?</h2>
            <p>Une plateforme collaborative pour améliorer la vie des citoyens</p>
          </div>

          <div className="grid grid-3">
            <div className="feature-card">
              <div className="feature-number">1</div>
              <h3>Déclarez un incident</h3>
              <p>Signalez rapidement un incident via l'application mobile avec photo et géolocalisation automatique</p>
            </div>

            <div className="feature-card">
              <div className="feature-number">2</div>
              <h3>Suivi en temps réel</h3>
              <p>Consultez l'état de traitement de vos incidents déclarés et recevez des notifications</p>
            </div>

            <div className="feature-card">
              <div className="feature-number">3</div>
              <h3>Résolution efficace</h3>
              <p>Les professionnels traitent les incidents et vous tiennent informé des actions entreprises</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section CTA */}
      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à contribuer ?</h2>
            <p>Rejoignez la communauté et aidez à améliorer votre ville</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
              <Link to="/tableau-de-bord" className="btn-cta-primary">
                Voir les statistiques
              </Link>
              <Link to="/carte" className="btn-cta-secondary">
                Explorer la carte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;

