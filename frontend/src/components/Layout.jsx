import Navbar from './Navbar';
import Footer from './Footer';
import InstallBanner from './pwa/InstallBanner';
import OfflineIndicator from './pwa/OfflineIndicator';
import BottomNavBar from './mobile/BottomNavBar';

/**
 * Composant de mise en page principal
 * Intègre la navigation, le contenu et les composants PWA globaux
 */
const Layout = ({ children }) => {
  return (
    <div className="app-layout">
      {/* Bannière d'installation PWA */}
      <InstallBanner />

      {/* Indicateur hors-ligne */}
      <OfflineIndicator />

      {/* Navigation principale */}
      <Navbar />

      {/* Contenu principal */}
      <main className="main-content">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Navigation mobile en bas */}
      <BottomNavBar />
    </div>
  );
};

export default Layout;
