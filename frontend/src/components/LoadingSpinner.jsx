import { Loader } from 'lucide-react';

/**
 * Composant de chargement réutilisable
 * @param {string} message - Message à afficher (optionnel)
 * @param {string} size - Taille du spinner: 'sm', 'md', 'lg' (défaut: 'md')
 */
const LoadingSpinner = ({ message = 'Chargement...', size = 'md' }) => {
  const sizes = {
    sm: 24,
    md: 48,
    lg: 64
  };

  const iconSize = sizes[size] || sizes.md;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '3rem 0',
      color: 'var(--text-secondary)'
    }}>
      <Loader size={iconSize} className="spin" style={{ marginBottom: '1rem' }} />
      {message && <p style={{ margin: 0, fontSize: '1rem' }}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;

