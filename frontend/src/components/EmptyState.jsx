import { AlertCircle } from 'lucide-react';

/**
 * Composant pour afficher un état vide
 * @param {React.Component} icon - Icône à afficher (optionnel)
 * @param {string} title - Titre du message
 * @param {string} description - Description (optionnelle)
 * @param {React.Component} action - Action optionnelle (bouton, lien, etc.)
 */
const EmptyState = ({ 
  icon: Icon = AlertCircle, 
  title = 'Aucune donnée',
  description,
  action 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '3rem 1rem',
      textAlign: 'center'
    }}>
      <Icon 
        size={64} 
        style={{ 
          marginBottom: '1.5rem', 
          color: 'var(--text-secondary)',
          opacity: 0.5 
        }} 
      />
      <h3 style={{ 
        margin: '0 0 0.5rem 0',
        color: 'var(--text-primary)',
        fontSize: '1.25rem'
      }}>
        {title}
      </h3>
      {description && (
        <p style={{ 
          margin: '0 0 1.5rem 0',
          color: 'var(--text-secondary)',
          maxWidth: '400px'
        }}>
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;

