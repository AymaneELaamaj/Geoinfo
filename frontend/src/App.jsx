import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import MapView from './pages/MapView';
import Connexion from './pages/Connexion';
import ProfessionnelDashboard from './pages/ProfessionnelDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import GestionUtilisateurs from './pages/GestionUtilisateurs';
import DeclarerIncident from './pages/DeclarerIncident';
import TestConnectivity from './pages/TestConnectivity';

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
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/tableau-de-bord" element={<Dashboard />} />
              <Route path="/incidents" element={<Incidents />} />
              <Route path="/declarer-incident" element={<DeclarerIncident />} />
              <Route path="/carte" element={<MapView />} />
              <Route path="/test-connectivite" element={<TestConnectivity />} />
              <Route path="/connexion" element={<Connexion />} />
              
              {/* Routes protégées - Professionnel */}
              <Route 
                path="/pro" 
                element={
                  <ProtectedRoute requiredRole="PROFESSIONNEL">
                    <ProfessionnelDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/professionnel/dashboard" 
                element={
                  <ProtectedRoute requiredRole="PROFESSIONNEL">
                    <ProfessionnelDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/pro-dashboard" 
                element={
                  <ProtectedRoute requiredRole="PROFESSIONNEL">
                    <ProfessionalDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Routes protégées - Administrateur */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/utilisateurs" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <GestionUtilisateurs />
                  </ProtectedRoute>
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
