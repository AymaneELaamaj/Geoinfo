package ma.ehtp.geoinfo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.entity.Province;
import ma.ehtp.geoinfo.repository.ProvinceRepository;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service pour la gestion des provinces
 * Fournit les données géographiques au format GeoJSON
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProvinceService {

    private final ProvinceRepository provinceRepository;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Récupère toutes les provinces au format GeoJSON
     * Utilise ST_AsGeoJSON de PostGIS pour convertir les géométries
     * 
     * @return String JSON au format GeoJSON FeatureCollection
     */
    @Transactional(readOnly = true)
    public String getProvincesAsGeoJSON() {
        log.info("Génération du GeoJSON pour toutes les provinces");

        try {
            // Requête SQL qui génère directement un GeoJSON complet
            String sql = """
                    SELECT json_build_object(
                        'type', 'FeatureCollection',
                        'features', json_agg(
                            json_build_object(
                                'type', 'Feature',
                                'geometry', ST_AsGeoJSON(geometry::geometry)::json,
                                'properties', json_build_object(
                                    'id', id,
                                    'nom', nom,
                                    'code', code
                                )
                            )
                        )
                    )::text
                    FROM provinces
                    WHERE geometry IS NOT NULL
                    """;

            String geoJson = jdbcTemplate.queryForObject(sql, String.class);

            log.info("GeoJSON généré avec succès");

            return geoJson != null ? geoJson : "{\"type\":\"FeatureCollection\",\"features\":[]}";

        } catch (Exception e) {
            log.error("Erreur lors de la génération du GeoJSON", e);
            // Retourner un GeoJSON vide en cas d'erreur
            return "{\"type\":\"FeatureCollection\",\"features\":[]}";
        }
    }

    /**
     * Récupère toutes les provinces
     * 
     * @return Liste des provinces
     */
    @Transactional(readOnly = true)
    public List<Province> getAllProvinces() {
        return provinceRepository.findAll();
    }
}
