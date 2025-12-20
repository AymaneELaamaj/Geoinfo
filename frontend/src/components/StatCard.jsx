/**
 * Composant StatCard - Carte de statistique réutilisable
 * @param {string} title - Titre de la statistique
 * @param {number} value - Valeur à afficher
 * @param {React.Component} icon - Icône à afficher
 * @param {string} color - Couleur de la bordure gauche
 */
const StatCard = ({ title, value, icon, color = '#3b82f6' }) => {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            {title}
          </p>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{value}</h2>
        </div>
        <div style={{ color: color }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

