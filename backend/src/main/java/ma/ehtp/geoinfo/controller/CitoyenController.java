package ma.ehtp.geoinfo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.request.AccountRecoveryRequest;
import ma.ehtp.geoinfo.dto.request.IncidentRequest;
import ma.ehtp.geoinfo.dto.response.AccountRecoveryResponse;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.service.CitoyenService;
import ma.ehtp.geoinfo.service.RateLimitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * Contrôleur pour les fonctionnalités citoyens
 * Gère la déclaration et la consultation des incidents
 * IMPORTANT: Seuls les citoyens peuvent déclarer des incidents
 */
@RestController
@RequestMapping("/api/citoyens")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class CitoyenController {

    private final CitoyenService citoyenService;
    private final ObjectMapper objectMapper;
    private final RateLimitService rateLimitService;

    /**
     * POST /api/citoyens/incidents
     * Déclare un nouvel incident avec photo optionnelle
     * 
     * Accepte multipart/form-data avec :
     * - data : JSON de l'incident (IncidentRequest)
     * - photo : Fichier image (optionnel)
     * 
     * RESTRICTION: ADMIN et PROFESSIONNEL ne peuvent PAS déclarer d'incidents
     * Accessible aux: visiteurs non authentifiés, citoyens
     */
    @PreAuthorize("isAnonymous() or hasRole('CITOYEN')")
    @PostMapping(value = "/incidents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentResponse> declarerIncident(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            Authentication authentication) {

        try {
            // Parser le JSON
            IncidentRequest request = objectMapper.readValue(dataJson, IncidentRequest.class);

            log.info("Réception déclaration incident : type={}, lat={}, lon={}",
                    request.getTypeIncident(), request.getLatitude(), request.getLongitude());

            // Récupérer l'email du déclarant si authentifié
            String declarantEmail = authentication != null ? authentication.getName() : null;

            // Créer l'incident
            IncidentResponse response = citoyenService.declarerIncident(request, photo, declarantEmail);

            log.info("Incident créé avec succès : id={}", response.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Erreur lors de la déclaration d'incident", e);
            throw new RuntimeException("Erreur lors de la déclaration : " + e.getMessage());
        }
    }

    /**
     * GET /api/citoyens/incidents/device/{deviceId}
     * Récupère les incidents déclarés par un appareil citoyen
     * 
     * @param deviceId Identifiant anonyme de l'appareil (UUID)
     */
    @GetMapping("/incidents/device/{deviceId}")
    public ResponseEntity<List<IncidentResponse>> getIncidentsByDeviceId(@PathVariable String deviceId) {
        log.info("Récupération incidents pour deviceId : {}", deviceId);

        List<IncidentResponse> incidents = citoyenService.getIncidentsByDeviceId(deviceId);

        return ResponseEntity.ok(incidents);
    }

    /**
     * GET /api/citoyens/incidents/carte
     * Récupère les incidents pour affichage sur carte
     * Retourne uniquement les incidents VALIDES (publiés)
     */
    @GetMapping("/incidents/carte")
    public ResponseEntity<List<IncidentResponse>> getIncidentsForMap() {
        log.info("Récupération incidents pour carte");

        List<IncidentResponse> incidents = citoyenService.getIncidentsForMap();

        log.info("Nombre d'incidents publiés : {}", incidents.size());

        return ResponseEntity.ok(incidents);
    }

    /**
     * POST /api/citoyens/recover-account
     * Récupère un compte citoyen via UUID (changement d'appareil)
     * 
     * Rate limiting: 5 tentatives par heure par IP
     */
    @PostMapping("/recover-account")
    public ResponseEntity<AccountRecoveryResponse> recoverAccount(
            @Valid @RequestBody AccountRecoveryRequest request,
            HttpServletRequest httpRequest) {

        // Récupérer l'adresse IP du client
        String ipAddress = getClientIpAddress(httpRequest);

        // Vérifier le rate limiting
        rateLimitService.checkRateLimit(ipAddress);

        // Log de sécurité
        log.info("Tentative de récupération UUID depuis IP: {}", ipAddress);

        // Récupérer le compte
        AccountRecoveryResponse response = citoyenService.recoverAccount(request.getUuid());

        log.info("Récupération réussie: {} incidents pour IP: {}", response.getIncidentsCount(), ipAddress);

        return ResponseEntity.ok(response);
    }

    /**
     * Récupère l'adresse IP réelle du client (même derrière un proxy)
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
