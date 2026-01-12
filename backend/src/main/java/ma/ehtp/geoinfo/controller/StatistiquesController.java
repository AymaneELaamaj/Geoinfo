package ma.ehtp.geoinfo.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.response.StatistiquesResponse;
import ma.ehtp.geoinfo.service.IncidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller pour les statistiques publiques
 */
@RestController
@RequestMapping("/api/statistiques")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" })
public class StatistiquesController {

    private final IncidentService incidentService;

    /**
     * GET /api/statistiques
     * Récupère les statistiques globales en temps réel
     *
     * @return Statistiques de la plateforme
     */
    @GetMapping
    public ResponseEntity<StatistiquesResponse> getStatistiques() {
        log.info("Récupération des statistiques publiques");

        StatistiquesResponse stats = incidentService.getStatistiques();

        return ResponseEntity.ok(stats);
    }
}
