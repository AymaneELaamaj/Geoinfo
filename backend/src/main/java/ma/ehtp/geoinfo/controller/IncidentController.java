package ma.ehtp.geoinfo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.service.IncidentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur pour les endpoints publics d'incidents
 * Consultation et statistiques (sans authentification)
 */
@RestController
@RequestMapping("/api/incidents")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class IncidentController {

    private final IncidentService incidentService;

    /**
     * GET /api/incidents
     * Récupère tous les incidents (retourne une liste simple pour compatibilité
     * frontend)
     * 
     * @param page Numéro de page (défaut: 0)
     * @param size Taille de page (défaut: 1000 pour tout récupérer)
     * @param sort Champ de tri (défaut: dateDeclaration,desc)
     */
    @GetMapping
    public ResponseEntity<java.util.List<IncidentResponse>> getAllIncidents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size,
            @RequestParam(defaultValue = "dateDeclaration,desc") String sort) {

        log.info("GET /api/incidents : page={}, size={}", page, size);

        // Parser le tri
        String[] sortParams = sort.split(",");
        Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("asc")
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortParams[0]));

        Page<IncidentResponse> incidentsPage = incidentService.getAllIncidents(pageable);

        // Retourner uniquement le contenu (liste) pour compatibilité frontend
        return ResponseEntity.ok(incidentsPage.getContent());
    }

    /**
     * GET /api/incidents/{id}
     * Récupère un incident par son ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<IncidentResponse> getIncidentById(@PathVariable Long id) {
        log.info("GET /api/incidents/{}", id);

        IncidentResponse incident = incidentService.getIncidentById(id);

        return ResponseEntity.ok(incident);
    }

    /**
     * GET /api/incidents/by-email/{email}
     * Récupère tous les incidents associés à un email citoyen
     */
    @GetMapping("/by-email/{email}")
    public ResponseEntity<java.util.List<IncidentResponse>> getIncidentsByEmail(@PathVariable String email) {
        log.info("GET /api/incidents/by-email/{}", email);

        java.util.List<IncidentResponse> incidents = incidentService.getIncidentsByEmail(email);

        return ResponseEntity.ok(incidents);
    }

    /**
     * GET /api/incidents/search
     * Recherche d'incidents avec filtres
     * 
     * @param statut       Statut (optionnel)
     * @param secteurId    Secteur (optionnel)
     * @param typeIncident Type (optionnel)
     * @param province     Province (optionnel)
     * @param page         Numéro de page
     * @param size         Taille de page
     */
    @GetMapping("/search")
    public ResponseEntity<Page<IncidentResponse>> searchIncidents(
            @RequestParam(required = false) String statut,
            @RequestParam(required = false) Long secteurId,
            @RequestParam(required = false) String typeIncident,
            @RequestParam(required = false) String province,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("GET /api/incidents/search : statut={}, secteur={}, type={}, province={}",
                statut, secteurId, typeIncident, province);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateDeclaration"));

        Page<IncidentResponse> incidents = incidentService.searchIncidents(
                statut, secteurId, typeIncident, province, pageable);

        return ResponseEntity.ok(incidents);
    }

    /**
     * GET /api/incidents/stats
     * Récupère les statistiques globales
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        log.info("GET /api/incidents/stats");

        Map<String, Object> stats = incidentService.getStatistics();

        return ResponseEntity.ok(stats);
    }

    /**
     * PUT /api/incidents/{id}/statut
     * Met à jour le statut d'un incident (pour les professionnels)
     */
    @PutMapping("/{id}/statut")
    public ResponseEntity<IncidentResponse> updateIncidentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newStatut = body.get("statut");
        String commentaire = body.get("commentaire");

        log.info("PUT /api/incidents/{}/statut : statut={}", id, newStatut);

        IncidentResponse updated = incidentService.updateStatus(id, newStatut, commentaire);

        return ResponseEntity.ok(updated);
    }
}
