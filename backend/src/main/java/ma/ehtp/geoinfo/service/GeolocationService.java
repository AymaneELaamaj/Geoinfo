package ma.ehtp.geoinfo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.entity.Province;
import ma.ehtp.geoinfo.repository.ProvinceRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Service de géolocalisation
 * Utilise PostGIS pour les calculs spatiaux
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeolocationService {

    private final ProvinceRepository provinceRepository;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

    /**
     * Crée un Point PostGIS à partir de coordonnées GPS
     * 
     * @param latitude  Latitude
     * @param longitude Longitude
     * @return Point PostGIS (SRID 4326)
     */
    public Point createPoint(Double latitude, Double longitude) {
        if (latitude == null || longitude == null) {
            throw new IllegalArgumentException("Latitude et longitude sont obligatoires");
        }

        // Valider les coordonnées
        if (latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("Latitude invalide : " + latitude + " (doit être entre -90 et 90)");
        }
        if (longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Longitude invalide : " + longitude + " (doit être entre -180 et 180)");
        }

        // Créer le point (longitude, latitude - ordre important pour PostGIS!)
        Coordinate coordinate = new Coordinate(longitude, latitude);
        Point point = geometryFactory.createPoint(coordinate);
        point.setSRID(4326); // WGS84

        log.debug("Point créé : lat={}, lon={}", latitude, longitude);

        return point;
    }

    /**
     * Trouve la province contenant un point donné
     * Utilise PRIORITAIREMENT l'intersection spatiale PostGIS (ST_Contains)
     * Fallback sur approximation géographique si géométries absentes
     * 
     * @param latitude  Latitude
     * @param longitude Longitude
     * @return Nom de la province
     */
    public String findProvinceByCoordinates(Double latitude, Double longitude) {
        log.info("🗺️ Recherche de province pour coordonnées: lat={}, lon={}", latitude, longitude);

        try {
            // Créer le point PostGIS
            Point point = createPoint(latitude, longitude);
            log.debug("📍 Point PostGIS créé: POINT({} {}) SRID=4326", longitude, latitude);

            // MÉTHODE 1 : Intersection spatiale PostGIS (PRIORITAIRE)
            Optional<Province> province = provinceRepository.findProvinceContainingPoint(point);

            if (province.isPresent()) {
                String provinceName = province.get().getNom();
                log.info("✅ Province trouvée par INTERSECTION SPATIALE PostGIS: {}", provinceName);
                log.info("🎯 Méthode utilisée: ST_Contains avec géométries MultiPolygon");
                return provinceName;
            } else {
                // MÉTHODE 2 : Fallback approximation géographique
                log.warn("⚠️ AUCUNE province trouvée par intersection spatiale pour ({}, {})", latitude, longitude);
                log.warn("💡 Cause possible: Géométries de provinces non chargées OU point hors du Maroc");
                log.warn("🔄 Basculement vers approximation géographique...");

                String approximation = determineProvinceByApproximation(latitude, longitude);
                log.info("📍 Province déterminée par APPROXIMATION: {}", approximation);
                return approximation;
            }
        } catch (Exception e) {
            log.error("❌ ERREUR lors de la recherche spatiale de province pour ({}, {})", latitude, longitude);
            log.error("💥 Message d'erreur: {}", e.getMessage());
            log.error("🔄 Basculement forcé vers approximation géographique...", e);

            String approximation = determineProvinceByApproximation(latitude, longitude);
            log.info("📍 Province déterminée par FALLBACK APRÈS ERREUR: {}", approximation);
            return approximation;
        }
    }

    /**
     * Détermine la province par approximation géographique
     * ⚠️ MÉTHODE DE SECOURS utilisée UNIQUEMENT si géométries PostGIS absentes
     * Basée sur la proximité aux centres des grandes villes (~55km de rayon)
     * 
     * @param latitude  Latitude
     * @param longitude Longitude
     * @return Nom de la province approximative
     */
    private String determineProvinceByApproximation(Double latitude, Double longitude) {
        log.warn("⚠️ APPROXIMATION GÉOGRAPHIQUE activée pour ({}, {})", latitude, longitude);
        log.debug("🔍 Recherche de la ville la plus proche (rayon ~55km)...");

        // Coordonnées approximatives des grandes villes marocaines (rayon ~50km)
        double radius = 0.5; // ~55km

        // Casablanca : ~33.5731, -7.5898
        if (isNear(latitude, longitude, 33.5731, -7.5898, radius)) {
            return "Casablanca-Settat";
        }

        // Rabat : ~34.0209, -6.8416
        if (isNear(latitude, longitude, 34.0209, -6.8416, radius)) {
            return "Rabat-Salé-Kénitra";
        }

        // Marrakech : ~31.6295, -7.9811
        if (isNear(latitude, longitude, 31.6295, -7.9811, radius)) {
            return "Marrakech-Safi";
        }

        // Fès : ~34.0181, -5.0078
        if (isNear(latitude, longitude, 34.0181, -5.0078, radius)) {
            return "Fès-Meknès";
        }

        // Tanger : ~35.7595, -5.8340
        if (isNear(latitude, longitude, 35.7595, -5.8340, radius)) {
            return "Tanger-Tétouan-Al Hoceïma";
        }

        // Agadir : ~30.4278, -9.5981
        if (isNear(latitude, longitude, 30.4278, -9.5981, radius)) {
            return "Souss-Massa";
        }

        // Meknès : ~33.8935, -5.5473
        if (isNear(latitude, longitude, 33.8935, -5.5473, radius)) {
            return "Fès-Meknès";
        }

        // Oujda : ~34.6814, -1.9086
        if (isNear(latitude, longitude, 34.6814, -1.9086, radius)) {
            return "Oriental";
        }

        // Béni Mellal : ~32.3373, -6.3498
        if (isNear(latitude, longitude, 32.3373, -6.3498, radius)) {
            return "Béni Mellal-Khénifra";
        }

        // Laâyoune : ~27.1536, -13.2033
        if (isNear(latitude, longitude, 27.1536, -13.2033, radius)) {
            return "Laâyoune-Sakia El Hamra";
        }

        // Si aucune correspondance : retourner "Maroc" au lieu de "Province inconnue"
        log.info("⚠️ Aucune correspondance trouvée pour ({}, {}) - utilisation de 'Maroc' par défaut",
                latitude, longitude);
        return "Maroc";
    }

    /**
     * Vérifie si un point est proche d'une référence
     * 
     * @param lat1      Latitude point 1
     * @param lon1      Longitude point 1
     * @param lat2      Latitude point 2
     * @param lon2      Longitude point 2
     * @param threshold Seuil de distance en degrés
     * @return true si les points sont proches
     */
    private boolean isNear(Double lat1, Double lon1, Double lat2, Double lon2, Double threshold) {
        double distance = Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
        return distance <= threshold;
    }

    /**
     * Calcule la distance entre deux points en kilomètres (formule de Haversine)
     * 
     * @param lat1 Latitude point 1
     * @param lon1 Longitude point 1
     * @param lat2 Latitude point 2
     * @param lon2 Longitude point 2
     * @return Distance en kilomètres
     */
    public double calculateDistance(Double lat1, Double lon1, Double lat2, Double lon2) {
        final int EARTH_RADIUS = 6371; // Rayon de la Terre en km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }
}
