import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, LogIn, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Page de Connexion
 * Permet aux utilisateurs (admin et professionnels) de se connecter
 */
const Connexion = () => {
  const navigate = useNavigate();
  const { login, loading: authLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Effacer l'erreur lors de la saisie
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(formData.email, formData.password);
      
      // Redirection selon le rôle
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'professionnel') {
        navigate('/pro');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div className="login-icon">
                <LogIn size={32} />
              </div>
              <h1 className="login-title">Connexion</h1>
              <p className="login-subtitle">
                Accédez à votre espace professionnel
              </p>
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Adresse email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-input"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '1rem' }}
                disabled={isLoading || authLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={18} className="spin" style={{ marginRight: '0.5rem' }} />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn size={18} style={{ marginRight: '0.5rem' }} />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <div className="login-info">
              <AlertCircle size={18} style={{ marginRight: '0.5rem', flexShrink: 0 }} />
              <div>
                <p style={{ marginBottom: '0.5rem', fontWeight: '600' }}>Comptes de test disponibles :</p>
                <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  <strong>Admin :</strong> admin@incidents.ma / admin123
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  <strong>Professionnel :</strong> pro@incidents.ma / pro123
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connexion;




