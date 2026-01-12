package ma.ehtp.geoinfo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.entity.Incident;
import ma.ehtp.geoinfo.entity.Professionnel;
import ma.ehtp.geoinfo.exception.ResourceNotFoundException;
import ma.ehtp.geoinfo.repository.IncidentRepository;
import ma.ehtp.geoinfo.repository.ProfessionnelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour les fonctionnalités administrateur
 * Gère la validation, le rejet et l'affectation des incidents
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final IncidentRepository incidentRepository;
    private final ProfessionnelRepository professionnelRepository;

    /**
     * Récupère les incidents en attente de validation
     * TRIÉS PAR DATE DE DÉCLARATION (plus récent en premier)
     * 
     * @return Liste des incidents avec statut REDIGE
     */
    @Transactional(readOnly = true)
    public List<IncidentResponse> getIncidentsEnAttente() {
        log.info("Récupération des incidents en attente de validation");

        // Tri par date décroissante (plus récent en premier)
        List<Incident> incidents = incidentRepository.findByStatutOrderByDateDeclarationDesc(
                Incident.StatutIncident.REDIGE);

        log.info("Nombre d'incidents en attente : {}", incidents.size());

        return incidents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Valide un incident
     * Change le statut de REDIGE à VALIDE (publié sur carte)
     * 
     * @param incidentId ID de l'incident
     * @return Incident validé
     */
    @Transactional
    public IncidentResponse validerIncident(Long incidentId) {
        log.info("Validation de l'incident : id={}", incidentId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        // Vérifier que l'incident est en attente
        if (incident.getStatut() != Incident.StatutIncident.REDIGE) {
            throw new IllegalStateException("Seuls les incidents en statut REDIGE peuvent être validés");
        }

        // Changer le statut
        incident.setStatut(Incident.StatutIncident.VALIDE);
        incident = incidentRepository.save(incident);

        log.info("Incident validé : id={}", incidentId);

        return mapToResponse(incident);
    }

    /**
     * Rejette un incident
     * Change le statut de REDIGE à REJETE avec un motif
     * 
     * @param incidentId ID de l'incident
     * @param motifRejet Motif du rejet (obligatoire)
     * @return Incident rejeté
     */
    @Transactional
    public IncidentResponse rejeterIncident(Long incidentId, String motifRejet) {
        log.info("Rejet de l'incident : id={}, motif={}", incidentId, motifRejet);

        if (motifRejet == null || motifRejet.trim().isEmpty()) {
            throw new IllegalArgumentException("Le motif de rejet est obligatoire");
        }

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        // Vérifier que l'incident est en attente
        if (incident.getStatut() != Incident.StatutIncident.REDIGE) {
            throw new IllegalStateException("Seuls les incidents en statut REDIGE peuvent être rejetés");
        }

        // Changer le statut et enregistrer le motif
        incident.setStatut(Incident.StatutIncident.REJETE);
        incident.setMotifRejet(motifRejet);
        incident = incidentRepository.save(incident);

        log.info("Incident rejeté : id={}", incidentId);

        return mapToResponse(incident);
    }

    /**
     * Affecte un incident à un professionnel
     * 
     * @param incidentId      ID de l'incident
     * @param professionnelId ID du professionnel
     * @return Incident affecté
     */
    @Transactional
    public IncidentResponse affecterIncident(Long incidentId, Long professionnelId) {
        log.info("Affectation incident {} au professionnel {}", incidentId, professionnelId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        Professionnel professionnel = professionnelRepository.findById(professionnelId)
                .orElseThrow(() -> new ResourceNotFoundException("Professionnel", "id", professionnelId));

        // Vérifier que le professionnel est actif
        if (!professionnel.getActif()) {
            throw new IllegalStateException("Le professionnel n'est pas actif");
        }

        // Affecter le professionnel
        incident.setProfessionnelAffecte(professionnel);
        incident = incidentRepository.save(incident);

        log.info("Incident affecté avec succès");

        return mapToResponse(incident);
    }

    /**
     * Récupère tous les professionnels actifs
     * 
     * @return Liste des professionnels
     */
    @Transactional(readOnly = true)
    public List<Professionnel> getAllProfessionnels() {
        return professionnelRepository.findByActifTrue();
    }

    /**
     * Convertit une entité Incident en DTO Response
     */
    private IncidentResponse mapToResponse(Incident incident) {
        return IncidentResponse.builder()
                .id(incident.getId())
                .typeIncident(incident.getTypeIncident())
                .description(incident.getDescription())
                .latitude(incident.getLatitude())
                .longitude(incident.getLongitude())
                .province(incident.getProvince())
                .nomLocal(incident.getNomLocal())
                .localisation(incident.getLocalisation())
                .photoUrl(incident.getPhotoUrl())
                .dateDeclaration(incident.getDateDeclaration())
                .statut(incident.getStatut().name())
                .secteurId(incident.getSecteur().getId())
                .secteurNom(incident.getSecteur().getNom())
                .motifRejet(incident.getMotifRejet())
                .descriptionTraitement(incident.getDescriptionTraitement())
                .declarantId(incident.getDeclarant() != null ? incident.getDeclarant().getId() : null)
                .professionnelAffecteId(
                        incident.getProfessionnelAffecte() != null ? incident.getProfessionnelAffecte().getId() : null)
                .deviceId(incident.getDeviceId())
                .build();
    }
}
