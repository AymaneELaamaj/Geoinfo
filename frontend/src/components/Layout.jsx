import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Composant Layout - Structure principale de l'application
 * Enveloppe toutes les pages avec la navigation et le footer
 */
const Layout = ({ children }) => {
  return (
    <div className="app">
      <Navbar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

