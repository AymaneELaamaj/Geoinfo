package ma.ehtp.geoinfo.repository;

import ma.ehtp.geoinfo.entity.Secteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Secteur
 */
@Repository
public interface SecteurRepository extends JpaRepository<Secteur, Long> {

    /**
     * Trouve un secteur par son nom
     */
    Optional<Secteur> findByNom(String nom);

    /**
     * Vérifie si un secteur existe par nom
     */
    boolean existsByNom(String nom);
}
