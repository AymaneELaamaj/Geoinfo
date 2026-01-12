package ma.ehtp.geoinfo.repository;

import ma.ehtp.geoinfo.entity.Province;
import org.locationtech.jts.geom.Point;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository pour l'entité Province
 * Inclut des requêtes spatiales PostGIS pour l'intersection
 */
@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {

    /**
     * Trouve une province par son nom
     */
    Optional<Province> findByNom(String nom);

    /**
     * Trouve la province contenant un point donné (intersection spatiale)
     * Utilise ST_Contains de PostGIS avec cast explicite vers geometry
     * IMPORTANT: Cast nécessaire car la colonne est stockée en type geography
     * 
     * @param point Point géographique (latitude, longitude)
     * @return Province contenant ce point
     */
    @Query(value = "SELECT * FROM provinces p WHERE p.geometry IS NOT NULL AND ST_Contains(p.geometry::geometry, :point) LIMIT 1", nativeQuery = true)
    Optional<Province> findProvinceContainingPoint(@Param("point") Point point);

    /**
     * Vérifie si une province existe par nom
     */
    boolean existsByNom(String nom);
}
