package ma.ehtp.geoinfo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.repository.UtilisateurRepository;
import ma.ehtp.geoinfo.service.ProfessionnelService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur pour les fonctionnalités professionnels
 * Gère le traitement des incidents
 */
@RestController
@RequestMapping("/api/professionnel")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('PROFESSIONNEL')")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class ProfessionnelController {

    private final ProfessionnelService professionnelService;
    private final UtilisateurRepository utilisateurRepository;

    /**
     * GET /api/professionnel/incidents
     * Récupère les incidents du professionnel connecté
     */
    @GetMapping("/incidents")
    public ResponseEntity<List<IncidentResponse>> getIncidents(Authentication authentication) {
        Long professionnelId = getProfessionnelId(authentication);

        log.info("Professionnel {} : récupération incidents", professionnelId);

        List<IncidentResponse> incidents = professionnelService.getIncidentsProfessionnel(professionnelId);

        return ResponseEntity.ok(incidents);
    }

    /**
     * PUT /api/professionnel/incidents/{id}/prendre-en-compte
     * Prend en compte un incident (VALIDE → PRIS_EN_COMPTE)
     */
    @PutMapping("/incidents/{id}/prendre-en-compte")
    public ResponseEntity<IncidentResponse> prendreEnCompte(
            @PathVariable Long id,
            Authentication authentication) {

        Long professionnelId = getProfessionnelId(authentication);

        log.info("Professionnel {} : prise en compte incident {}", professionnelId, id);

        IncidentResponse incident = professionnelService.prendreEnCompte(id, professionnelId);

        return ResponseEntity.ok(incident);
    }

    /**
     * PUT /api/professionnel/incidents/{id}/demarrer-traitement
     * Démarre le traitement (PRIS_EN_COMPTE → EN_COURS_DE_TRAITEMENT)
     */
    @PutMapping("/incidents/{id}/demarrer-traitement")
    public ResponseEntity<IncidentResponse> demarrerTraitement(
            @PathVariable Long id,
            Authentication authentication) {

        Long professionnelId = getProfessionnelId(authentication);

        log.info("Professionnel {} : démarrage traitement incident {}", professionnelId, id);

        IncidentResponse incident = professionnelService.demarrerTraitement(id, professionnelId);

        return ResponseEntity.ok(incident);
    }

    /**
     * PUT /api/professionnel/incidents/{id}/traiter
     * Termine le traitement (EN_COURS_DE_TRAITEMENT → TRAITE)
     */
    @PutMapping("/incidents/{id}/traiter")
    public ResponseEntity<IncidentResponse> traiterIncident(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        Long professionnelId = getProfessionnelId(authentication);
        String descriptionTraitement = body.get("descriptionTraitement");

        log.info("Professionnel {} : traitement incident {}", professionnelId, id);

        IncidentResponse incident = professionnelService.traiterIncident(id, professionnelId, descriptionTraitement);

        return ResponseEntity.ok(incident);
    }

    /**
     * PUT /api/professionnel/incidents/{id}/bloquer
     * Bloque temporairement un incident
     */
    @PutMapping("/incidents/{id}/bloquer")
    public ResponseEntity<IncidentResponse> bloquerIncident(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        Long professionnelId = getProfessionnelId(authentication);
        String motif = body.get("motif");

        log.info("Professionnel {} : blocage incident {}", professionnelId, id);

        IncidentResponse incident = professionnelService.bloquerIncident(id, professionnelId, motif);

        return ResponseEntity.ok(incident);
    }

    /**
     * PUT /api/professionnel/incidents/{id}/debloquer
     * Débloque un incident (BLOQUE → EN_COURS_DE_TRAITEMENT)
     */
    @PutMapping("/incidents/{id}/debloquer")
    public ResponseEntity<IncidentResponse> debloquerIncident(
            @PathVariable Long id,
            Authentication authentication) {

        Long professionnelId = getProfessionnelId(authentication);

        log.info("Professionnel {} : déblocage incident {}", professionnelId, id);

        IncidentResponse incident = professionnelService.debloquerIncident(id, professionnelId);

        return ResponseEntity.ok(incident);
    }

    /**
     * PUT /api/professionnel/incidents/{id}/update-statut
     * Met à jour le statut d'un incident de manière flexible (SANS CONTRAINTE
     * D'ENCHAÎNEMENT)
     * Permet au professionnel de choisir n'importe quel statut
     */
    @PutMapping("/incidents/{id}/update-statut")
    public ResponseEntity<IncidentResponse> updateStatut(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        Long professionnelId = getProfessionnelId(authentication);
        String statut = body.get("statut");
        String commentaire = body.get("commentaire");

        log.info("Professionnel {} : mise à jour statut incident {} vers {}", professionnelId, id, statut);

        IncidentResponse incident = professionnelService.updateStatut(id, professionnelId, statut, commentaire);

        return ResponseEntity.ok(incident);
    }

    /**
     * GET /api/professionnel/dashboard
     * Récupère les statistiques pour le dashboard professionnel
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats(Authentication authentication) {
        Long professionnelId = getProfessionnelId(authentication);

        log.info("Professionnel {} : récupération statistiques dashboard", professionnelId);

        // TODO: Implémenter les statistiques complètes
        Map<String, Object> stats = Map.of(
                "message", "Dashboard stats - À implémenter en Phase 6");

        return ResponseEntity.ok(stats);
    }

    /**
     * Récupère l'ID du professionnel connecté
     */
    private Long getProfessionnelId(Authentication authentication) {
        String email = authentication.getName();
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"))
                .getId();
    }
}
