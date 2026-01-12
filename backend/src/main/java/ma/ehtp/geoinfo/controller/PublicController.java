package ma.ehtp.geoinfo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.request.IncidentRequest;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.entity.Secteur;
import ma.ehtp.geoinfo.repository.SecteurRepository;
import ma.ehtp.geoinfo.service.CitoyenService;
import ma.ehtp.geoinfo.service.ProvinceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Contrôleur pour les endpoints publics (sans authentification)
 * Consultation des secteurs et provinces
 * + Déclaration anonyme d'incidents (PWA citoyens)
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class PublicController {

    private final SecteurRepository secteurRepository;
    private final CitoyenService citoyenService;
    private final ProvinceService provinceService;

    /**
     * GET /api/secteurs
     * Récupère tous les secteurs
     */
    @GetMapping("/secteurs")
    public ResponseEntity<List<Secteur>> getAllSecteurs() {
        log.info("Récupération de tous les secteurs");
        List<Secteur> secteurs = secteurRepository.findAll();
        return ResponseEntity.ok(secteurs);
    }

    /**
     * GET /api/provinces/geojson
     * Récupère toutes les provinces au format GeoJSON pour affichage sur carte
     * Utilise ST_AsGeoJSON de PostGIS pour convertir les géométries
     */
    @GetMapping("/provinces/geojson")
    public ResponseEntity<String> getProvincesGeoJSON() {
        log.info("Récupération des provinces au format GeoJSON");

        try {
            // Récupérer toutes les provinces avec géométries
            String geoJson = provinceService.getProvincesAsGeoJSON();

            return ResponseEntity.ok()
                    .header("Content-Type", "application/geo+json")
                    .body(geoJson);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération du GeoJSON des provinces", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/incidents/carte
     * Récupère les incidents pour la carte (alias public)
     */
    @GetMapping("/incidents/carte")
    public ResponseEntity<List<IncidentResponse>> getIncidentsForMap() {
        return citoyenService.getIncidentsForMap() != null
                ? ResponseEntity.ok(citoyenService.getIncidentsForMap())
                : ResponseEntity.ok(List.of());
    }

    /**
     * POST /api/public/incidents
     * Déclare un incident de manière anonyme (sans authentification)
     * Utilisé par les citoyens depuis la PWA
     * 
     * @param request Données de l'incident (IncidentRequest JSON)
     * @param photo   Photo optionnelle (multipart file)
     * @return Incident créé avec statut REDIGE
     */
    @PostMapping("/public/incidents")
    public ResponseEntity<IncidentResponse> declarerIncidentAnonymous(
            @RequestPart("incident") IncidentRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo) {

        log.info("📱 Déclaration publique d'incident (PWA) - deviceId: {}, type: {}",
                request.getDeviceId(), request.getTypeIncident());

        try {
            // Valider que le deviceId est fourni
            if (request.getDeviceId() == null || request.getDeviceId().trim().isEmpty()) {
                log.error("❌ deviceId manquant dans la requête");
                return ResponseEntity.badRequest().build();
            }

            // Appeler le service avec citizenEmail si fourni
            IncidentResponse response = citoyenService.declarerIncident(
                    request,
                    photo,
                    request.getCitizenEmail() // Email du citoyen (peut être null si mode anonyme)
            );

            log.info("✅ Incident public créé avec succès - ID: {}, deviceId: {}",
                    response.getId(), request.getDeviceId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IllegalArgumentException e) {
            log.error("❌ Validation échouée: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("❌ Erreur lors de la déclaration publique: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/public/incidents/{deviceId}
     * Récupère tous les incidents déclarés par un appareil (UUID)
     * Utilisé par la page "Mes Incidents" de la PWA
     * 
     * @param deviceId Identifiant UUID de l'appareil citoyen
     * @return Liste des incidents (tous statuts confondus)
     */
    @GetMapping("/public/incidents/{deviceId}")
    public ResponseEntity<List<IncidentResponse>> getIncidentsByDeviceId(@PathVariable String deviceId) {

        log.info("📋 Récupération des incidents pour deviceId: {}", deviceId);

        try {
            // Valider le format UUID (basique)
            if (deviceId == null || deviceId.trim().isEmpty()) {
                log.error("❌ deviceId invalide: vide ou null");
                return ResponseEntity.badRequest().build();
            }

            List<IncidentResponse> incidents = citoyenService.getIncidentsByDeviceId(deviceId);

            log.info("✅ {} incident(s) trouvé(s) pour deviceId: {}", incidents.size(), deviceId);

            return ResponseEntity.ok(incidents);

        } catch (Exception e) {
            log.error("❌ Erreur lors de la récupération des incidents: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
