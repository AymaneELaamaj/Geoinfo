package ma.ehtp.geoinfo.repository;

import ma.ehtp.geoinfo.entity.Incident;
import ma.ehtp.geoinfo.entity.Secteur;
import org.locationtech.jts.geom.Point;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository pour l'entité Incident
 * Inclut des requêtes spatiales PostGIS
 */
@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {

        /**
         * Trouve tous les incidents par statut
         */
        List<Incident> findByStatut(Incident.StatutIncident statut);

        Page<Incident> findByStatut(Incident.StatutIncident statut, Pageable pageable);

        /**
         * Trouve tous les incidents par statut, triés par date de déclaration (plus
         * récent en premier)
         */
        List<Incident> findByStatutOrderByDateDeclarationDesc(Incident.StatutIncident statut);

        /**
         * Trouve tous les incidents en EXCLUANT certains statuts (pour vues publiques)
         */
        Page<Incident> findByStatutNotIn(List<Incident.StatutIncident> statuts, Pageable pageable);

        /**
         * Trouve tous les incidents d'un secteur
         */
        List<Incident> findBySecteur(Secteur secteur);

        /**
         * Trouve tous les incidents d'un professionnel
         */
        List<Incident> findByProfessionnelAffecte_Id(Long professionnelId);

        /**
         * Trouve tous les incidents par deviceId (identifiant anonyme citoyen)
         */
        List<Incident> findByDeviceId(String deviceId);

        /**
         * Trouve tous les incidents par deviceId, triés par date de déclaration (plus
         * récent en premier)
         */
        List<Incident> findByDeviceIdOrderByDateDeclarationDesc(String deviceId);

        /**
         * Trouve tous les incidents par email citoyen
         */
        List<Incident> findByCitizenEmail(String citizenEmail);

        /**
         * Trouve tous les incidents par email citoyen, triés par date de déclaration
         */
        List<Incident> findByCitizenEmailOrderByDateDeclarationDesc(String citizenEmail);

        /**
         * Trouve tous les incidents dans un rayon donné (requête spatiale PostGIS)
         * 
         * @param point        Point de référence
         * @param radiusMeters Rayon en mètres
         */
        @Query(value = "SELECT * FROM incidents i WHERE ST_DWithin(i.location, :point, :radius)", nativeQuery = true)
        List<Incident> findIncidentsNearby(@Param("point") Point point,
                        @Param("radius") double radiusMeters);

        /**
         * Compte les incidents par statut
         */
        long countByStatut(Incident.StatutIncident statut);

        /**
         * Compte les incidents d'un secteur
         */
        long countBySecteur(Secteur secteur);

        /**
         * Recherche multi-critères
         */
        @Query("SELECT i FROM Incident i WHERE " +
                        "(:statut IS NULL OR i.statut = :statut) AND " +
                        "(:secteurId IS NULL OR i.secteur.id = :secteurId) AND " +
                        "(:typeIncident IS NULL OR i.typeIncident = :typeIncident) AND " +
                        "(:province IS NULL OR i.province = :province)")
        Page<Incident> searchIncidents(@Param("statut") Incident.StatutIncident statut,
                        @Param("secteurId") Long secteurId,
                        @Param("typeIncident") String typeIncident,
                        @Param("province") String province,
                        Pageable pageable);

        /**
         * Trouve les incidents en attente de validation (pour admin)
         */
        List<Incident> findByStatutIn(List<Incident.StatutIncident> statuts);

        /**
         * Compte les incidents en excluant certains statuts (pour statistiques)
         */
        long countByStatutNotIn(List<Incident.StatutIncident> statuts);
}
