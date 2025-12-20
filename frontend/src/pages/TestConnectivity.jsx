import { useState, useEffect } from 'react';
import { healthAPI, authAPI } from '../services/api';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

/**
 * Page de test de connectivité Backend-Frontend
 * Permet de diagnostiquer les problèmes de communication
 */
const TestConnectivity = () => {
  const [tests, setTests] = useState({
    health: { status: 'pending', message: '', data: null },
    connection: { status: 'pending', message: '', data: null },
    postData: { status: 'pending', message: '', data: null },
    auth: { status: 'pending', message: '', data: null }
  });

  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testName, testFn, testData = null) => {
    setTests(prev => ({
      ...prev,
      [testName]: { status: 'running', message: 'Test en cours...', data: null }
    }));

    try {
      const result = await testFn(testData);
      setTests(prev => ({
        ...prev,
        [testName]: { 
          status: 'success', 
          message: 'Test réussi ✅', 
          data: result 
        }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        [testName]: { 
          status: 'error', 
          message: error.message || 'Erreur inconnue', 
          data: null 
        }
      }));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);

    // Test 1: Santé du backend
    await runTest('health', healthAPI.health);
    
    // Test 2: Connectivité
    await runTest('connection', healthAPI.testConnection);
    
    // Test 3: Données POST
    await runTest('postData', healthAPI.testData, {
      test: 'frontend-data',
      timestamp: new Date().toISOString(),
      browser: navigator.userAgent
    });
    
    // Test 4: Authentification
    await runTest('auth', authAPI.login, {
      email: 'test@test.com',
      password: 'test123'
    });

    setIsRunning(false);
  };

  const resetTests = () => {
    setTests({
      health: { status: 'pending', message: '', data: null },
      connection: { status: 'pending', message: '', data: null },
      postData: { status: 'pending', message: '', data: null },
      auth: { status: 'pending', message: '', data: null }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'error':
        return <XCircle className="text-red-500" size={20} />;
      case 'running':
        return <Clock className="text-blue-500 animate-spin" size={20} />;
      case 'pending':
        return <AlertTriangle className="text-gray-400" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      case 'running': return 'border-blue-200 bg-blue-50';
      case 'pending': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div className="page-header">
          <h1 className="page-title">Test de Connectivité Backend-Frontend</h1>
          <p className="page-description">
            Diagnostic de la communication entre React (port 5174) et Spring Boot (port 8085)
          </p>
        </div>

        {/* Boutons d'action */}
        <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isRunning ? 0.6 : 1
            }}
          >
            {isRunning && <Clock size={16} className="animate-spin" />}
            {isRunning ? 'Tests en cours...' : 'Lancer tous les tests'}
          </button>
          
          <button
            onClick={resetTests}
            disabled={isRunning}
            className="btn-secondary"
          >
            Réinitialiser
          </button>
        </div>

        {/* Résultats des tests */}
        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Test de santé */}
          <div className={`card ${getStatusColor(tests.health.status)}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              {getStatusIcon(tests.health.status)}
              <h3 style={{ margin: 0 }}>1. Test de santé du backend</h3>
            </div>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
              GET /api/health
            </p>
            <p style={{ margin: 0, fontWeight: '500' }}>
              {tests.health.message || 'En attente...'}
            </p>
            {tests.health.data && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  Voir les données
                </summary>
                <pre style={{ 
                  background: 'var(--background)', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem'
                }}>
                  {JSON.stringify(tests.health.data, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Test de connectivité */}
          <div className={`card ${getStatusColor(tests.connection.status)}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              {getStatusIcon(tests.connection.status)}
              <h3 style={{ margin: 0 }}>2. Test de connectivité</h3>
            </div>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
              GET /api/test/connection
            </p>
            <p style={{ margin: 0, fontWeight: '500' }}>
              {tests.connection.message || 'En attente...'}
            </p>
            {tests.connection.data && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  Voir les données
                </summary>
                <pre style={{ 
                  background: 'var(--background)', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem'
                }}>
                  {JSON.stringify(tests.connection.data, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Test POST */}
          <div className={`card ${getStatusColor(tests.postData.status)}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              {getStatusIcon(tests.postData.status)}
              <h3 style={{ margin: 0 }}>3. Test de données POST</h3>
            </div>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
              POST /api/test/data
            </p>
            <p style={{ margin: 0, fontWeight: '500' }}>
              {tests.postData.message || 'En attente...'}
            </p>
            {tests.postData.data && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  Voir les données
                </summary>
                <pre style={{ 
                  background: 'var(--background)', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem'
                }}>
                  {JSON.stringify(tests.postData.data, null, 2)}
                </pre>
              </details>
            )}
          </div>

          {/* Test d'authentification */}
          <div className={`card ${getStatusColor(tests.auth.status)}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              {getStatusIcon(tests.auth.status)}
              <h3 style={{ margin: 0 }}>4. Test d'authentification</h3>
            </div>
            <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)' }}>
              POST /api/test/auth (test@test.com / test123)
            </p>
            <p style={{ margin: 0, fontWeight: '500' }}>
              {tests.auth.message || 'En attente...'}
            </p>
            {tests.auth.data && (
              <details style={{ marginTop: '0.5rem' }}>
                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  Voir les données
                </summary>
                <pre style={{ 
                  background: 'var(--background)', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  fontSize: '0.85rem',
                  marginTop: '0.5rem'
                }}>
                  {JSON.stringify(tests.auth.data, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Informations de diagnostic */}
        <div className="card" style={{ marginTop: '2rem', background: 'var(--background)' }}>
          <h3 style={{ marginBottom: '1rem' }}>Informations de diagnostic</h3>
          <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div><strong>Frontend:</strong> React + Vite sur http://localhost:5174</div>
            <div><strong>Backend:</strong> Spring Boot sur http://localhost:8085</div>
            <div><strong>API Base URL:</strong> {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8085/api'}</div>
            <div><strong>User Agent:</strong> {navigator.userAgent}</div>
            <div><strong>Timestamp:</strong> {new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestConnectivity;