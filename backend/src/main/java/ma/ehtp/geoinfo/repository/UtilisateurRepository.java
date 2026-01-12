package ma.ehtp.geoinfo.repository;

import ma.ehtp.geoinfo.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Utilisateur
 * Gère les opérations CRUD et les requêtes personnalisées
 */
@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    /**
     * Trouve un utilisateur par son email
     * Utilisé pour l'authentification
     */
    Optional<Utilisateur> findByEmail(String email);

    /**
     * Vérifie si un email existe déjà
     */
    boolean existsByEmail(String email);

    /**
     * Trouve tous les utilisateurs par rôle
     */
    java.util.List<Utilisateur> findByRole(Utilisateur.Role role);

    /**
     * Trouve tous les utilisateurs actifs
     */
    java.util.List<Utilisateur> findByActifTrue();
}
