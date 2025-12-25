import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import CitizenPWAGuard from './components/CitizenPWAGuard';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import MapView from './pages/MapView';
import Connexion from './pages/Connexion';
import GestionIncidentsPro from './pages/GestionIncidentsPro';
import AdminDashboard from './pages/AdminDashboard';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import DeclarerIncident from './pages/DeclarerIncident';
import MesIncidents from './pages/MesIncidents';
import TestConnectivity from './pages/TestConnectivity';
import Welcome from './pages/Welcome';
import AppBootstrap from './components/AppBootstrap';

/**
 * Composant principal de l'application
 * Gère le routage entre les différentes pages et les contexts globaux
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <Layout>
            <Routes>
              {/* Route de bienvenue - Affichée uniquement à la première installation */}
              <Route path="/welcome" element={<Welcome />} />

              {/* Routes citoyens - Protégées par AppBootstrap */}
              <Route path="/" element={<AppBootstrap><Home /></AppBootstrap>} />
              <Route path="/tableau-de-bord" element={<AppBootstrap><Dashboard /></AppBootstrap>} />
              <Route path="/incidents" element={<AppBootstrap><Incidents /></AppBootstrap>} />
              <Route path="/declarer-incident" element={<AppBootstrap><DeclarerIncident /></AppBootstrap>} />
              <Route path="/mes-incidents" element={<AppBootstrap><MesIncidents /></AppBootstrap>} />
              <Route path="/carte" element={<AppBootstrap><MapView /></AppBootstrap>} />
              <Route path="/test-connectivite" element={<TestConnectivity />} />

              {/* Connexion - Bloquée sur PWA (citoyens anonymes) */}
              <Route path="/connexion" element={
                <CitizenPWAGuard>
                  <Connexion />
                </CitizenPWAGuard>
              } />

              {/* Routes protégées - Professionnel (Bloquées sur PWA) */}
              <Route
                path="/pro"
                element={
                  <CitizenPWAGuard>
                    <ProtectedRoute requiredRole="PROFESSIONNEL">
                      <GestionIncidentsPro />
                    </ProtectedRoute>
                  </CitizenPWAGuard>
                }
              />
              <Route
                path="/professionnel/dashboard"
                element={
                  <CitizenPWAGuard>
                    <ProtectedRoute requiredRole="PROFESSIONNEL">
                      <GestionIncidentsPro />
                    </ProtectedRoute>
                  </CitizenPWAGuard>
                }
              />
              <Route
                path="/professionnel/incidents"
                element={
                  <CitizenPWAGuard>
                    <ProtectedRoute requiredRole="PROFESSIONNEL">
                      <GestionIncidentsPro />
                    </ProtectedRoute>
                  </CitizenPWAGuard>
                }
              />

              {/* Routes protégées - Administrateur (Bloquées sur PWA) */}
              <Route
                path="/admin"
                element={
                  <CitizenPWAGuard>
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  </CitizenPWAGuard>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <CitizenPWAGuard>
                    <ProtectedRoute requiredRole="ADMIN">
                      <AdminDashboard />
                    </ProtectedRoute>
                  </CitizenPWAGuard>
                }
              />
              <Route
                path="/admin/utilisateurs"
                element={
                  <CitizenPWAGuard>
                    <ProtectedRoute requiredRole="ADMIN">
                      <GestionUtilisateurs />
                    </ProtectedRoute>
                  </CitizenPWAGuard>
                }
              />
            </Routes>
          </Layout>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
