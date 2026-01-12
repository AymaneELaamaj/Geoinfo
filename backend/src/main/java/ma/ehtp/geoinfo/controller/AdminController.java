package ma.ehtp.geoinfo.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.request.ProfessionnelRequest;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.entity.Professionnel;
import ma.ehtp.geoinfo.entity.Secteur;
import ma.ehtp.geoinfo.entity.Utilisateur;
import ma.ehtp.geoinfo.repository.ProfessionnelRepository;
import ma.ehtp.geoinfo.repository.SecteurRepository;
import ma.ehtp.geoinfo.repository.UtilisateurRepository;
import ma.ehtp.geoinfo.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur pour les fonctionnalités administrateur
 * Gère la validation, le rejet et la gestion des utilisateurs
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class AdminController {

    private final AdminService adminService;
    private final ProfessionnelRepository professionnelRepository;
    private final SecteurRepository secteurRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * GET /api/admin/incidents/en-attente
     * Récupère les incidents en attente de validation
     */
    @GetMapping("/incidents/en-attente")
    public ResponseEntity<List<IncidentResponse>> getIncidentsEnAttente() {
        log.info("Admin : récupération incidents en attente");

        List<IncidentResponse> incidents = adminService.getIncidentsEnAttente();

        return ResponseEntity.ok(incidents);
    }

    /**
     * PUT /api/admin/incidents/{id}/valider
     * Valide un incident (REDIGE → VALIDE)
     */
    @PutMapping("/incidents/{id}/valider")
    public ResponseEntity<IncidentResponse> validerIncident(@PathVariable Long id) {
        log.info("Admin : validation incident {}", id);

        IncidentResponse incident = adminService.validerIncident(id);

        return ResponseEntity.ok(incident);
    }

    /**
     * PUT /api/admin/incidents/{id}/rejeter
     * Rejette un incident avec un motif
     */
    @PutMapping("/incidents/{id}/rejeter")
    public ResponseEntity<IncidentResponse> rejeterIncident(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String motifRejet = body.get("motifRejet");

        log.info("Admin : rejet incident {} avec motif : {}", id, motifRejet);

        IncidentResponse incident = adminService.rejeterIncident(id, motifRejet);

        return ResponseEntity.ok(incident);
    }

    /**
     * POST /api/admin/incidents/{incidentId}/affecter/{professionnelId}
     * Affecte un incident à un professionnel
     */
    @PostMapping("/incidents/{incidentId}/affecter/{professionnelId}")
    public ResponseEntity<IncidentResponse> affecterIncident(
            @PathVariable Long incidentId,
            @PathVariable Long professionnelId) {

        log.info("Admin : affectation incident {} au professionnel {}", incidentId, professionnelId);

        IncidentResponse incident = adminService.affecterIncident(incidentId, professionnelId);

        return ResponseEntity.ok(incident);
    }

    /**
     * GET /api/admin/professionnels
     * Récupère tous les professionnels
     */
    @GetMapping("/professionnels")
    public ResponseEntity<List<Professionnel>> getAllProfessionnels() {
        log.info("Admin : récupération de tous les professionnels");

        List<Professionnel> professionnels = adminService.getAllProfessionnels();

        return ResponseEntity.ok(professionnels);
    }

    /**
     * POST /api/admin/professionnels
     * Crée un nouveau professionnel
     */
    @PostMapping("/professionnels")
    public ResponseEntity<Professionnel> creerProfessionnel(@Valid @RequestBody ProfessionnelRequest request) {
        log.info("Admin : création professionnel {} - secteur={}, type={}",
                request.getEmail(), request.getSecteurAffectate(), request.getTypeIncident());

        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Un utilisateur avec cet email existe déjà");
        }

        // Vérifier le secteur
        if (request.getSecteurAffectate() == null) {
            throw new IllegalArgumentException("Le secteur est obligatoire");
        }

        // Charger le secteur
        Secteur secteur = secteurRepository.findById(request.getSecteurAffectate())
                .orElseThrow(
                        () -> new RuntimeException("Secteur non trouvé avec l'id: " + request.getSecteurAffectate()));

        // Valider le type d'incident
        Professionnel.TypeIncident typeIncident;
        try {
            typeIncident = Professionnel.TypeIncident.valueOf(request.getTypeIncident());
        } catch (IllegalArgumentException | NullPointerException e) {
            log.error("Type d'incident invalide: {}", request.getTypeIncident());
            throw new IllegalArgumentException("Type d'incident invalide: " + request.getTypeIncident() +
                    ". Valeurs acceptées: EAU, ELECTRICITE, ROUTE, ASSAINISSEMENT, ECLAIRAGE_PUBLIC, DECHETS, ESPACES_VERTS, SECURITE, AUTRE");
        }

        // Créer le professionnel
        Professionnel professionnel = new Professionnel();
        professionnel.setNom(request.getNom());
        professionnel.setPrenom(request.getPrenom() != null ? request.getPrenom() : "");
        professionnel.setEmail(request.getEmail());
        professionnel.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        professionnel.setTelephone(request.getTelephone());
        professionnel.setRole(Utilisateur.Role.PROFESSIONNEL);
        professionnel.setSecteur(secteur); // Utiliser la relation objet
        professionnel.setTypeIncident(typeIncident);
        professionnel.setActif(true);
        professionnel.setDisponible(true);

        professionnel = professionnelRepository.save(professionnel);

        log.info("Professionnel créé : id={}, secteur={}, type={}",
                professionnel.getId(), secteur.getNom(), typeIncident);

        return ResponseEntity.status(HttpStatus.CREATED).body(professionnel);
    }

    /**
     * PUT /api/admin/professionnels/{id}
     * Met à jour un professionnel
     */
    @PutMapping("/professionnels/{id}")
    public ResponseEntity<Professionnel> updateProfessionnel(
            @PathVariable Long id,
            @Valid @RequestBody ProfessionnelRequest request) {

        log.info("Admin : mise à jour professionnel {}", id);

        Professionnel professionnel = professionnelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        // Charger le secteur
        Secteur secteur = secteurRepository.findById(request.getSecteurAffectate())
                .orElseThrow(
                        () -> new RuntimeException("Secteur non trouvé avec l'id: " + request.getSecteurAffectate()));

        professionnel.setNom(request.getNom());
        professionnel.setPrenom(request.getPrenom());
        professionnel.setTelephone(request.getTelephone());
        professionnel.setSecteur(secteur); // Utiliser la relation objet
        professionnel.setTypeIncident(Professionnel.TypeIncident.valueOf(request.getTypeIncident()));

        // Mettre à jour le mot de passe seulement s'il est fourni
        if (request.getMotDePasse() != null && !request.getMotDePasse().isEmpty()) {
            professionnel.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        professionnel = professionnelRepository.save(professionnel);

        log.info("Professionnel mis à jour : id={}, secteur={}", id, secteur.getNom());

        return ResponseEntity.ok(professionnel);
    }

    /**
     * DELETE /api/admin/professionnels/{id}
     * Désactive un professionnel (soft delete)
     */
    @DeleteMapping("/professionnels/{id}")
    public ResponseEntity<Void> deleteProfessionnel(@PathVariable Long id) {
        log.info("Admin : désactivation professionnel {}", id);

        Professionnel professionnel = professionnelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professionnel non trouvé"));

        professionnel.setActif(false);
        professionnel.setDisponible(false);
        professionnelRepository.save(professionnel);

        log.info("Professionnel désactivé : id={}", id);

        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/admin/dashboard
     * Récupère les statistiques pour le dashboard admin
     */
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        log.info("Admin : récupération statistiques dashboard");

        // TODO: Implémenter les statistiques complètes
        Map<String, Object> stats = Map.of(
                "message", "Dashboard stats - À implémenter en Phase 6");

        return ResponseEntity.ok(stats);
    }
}
