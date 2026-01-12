package ma.ehtp.geoinfo.repository;

import ma.ehtp.geoinfo.entity.Professionnel;
import ma.ehtp.geoinfo.entity.Secteur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Professionnel
 */
@Repository
public interface ProfessionnelRepository extends JpaRepository<Professionnel, Long> {

    /**
     * Trouve tous les professionnels d'un secteur par ID
     */
    List<Professionnel> findBySecteurId(Long secteurId);

    /**
     * Trouve tous les professionnels d'un secteur
     */
    List<Professionnel> findBySecteur(Secteur secteur);

    /**
     * Trouve tous les professionnels par type d'incident
     */
    List<Professionnel> findByTypeIncident(Professionnel.TypeIncident typeIncident);

    /**
     * Trouve tous les professionnels disponibles d'un secteur
     */
    List<Professionnel> findBySecteurIdAndDisponibleTrue(Long secteurId);

    /**
     * Trouve tous les professionnels actifs
     */
    List<Professionnel> findByActifTrue();
}
