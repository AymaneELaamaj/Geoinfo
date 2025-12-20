/**
 * Composant Footer - Pied de page de l'application
 */
const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Plateforme de Gestion des Incidents. Tous droits réservés.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Plateforme collaborative pour améliorer la vie des citoyens
        </p>
      </div>
    </footer>
  );
};

export default Footer;

