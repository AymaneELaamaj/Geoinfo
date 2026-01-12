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
 * Service pour les fonctionnalités professionnels
 * Gère le traitement des incidents
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProfessionnelService {

    private final IncidentRepository incidentRepository;
    private final ProfessionnelRepository professionnelRepository;

    /**
     * Récupère les incidents d'un professionnel
     * Filtre par secteur et type d'incident du professionnel
     * 
     * @param professionnelId ID du professionnel
     * @return Liste des incidents
     */
    @Transactional(readOnly = true)
    public List<IncidentResponse> getIncidentsProfessionnel(Long professionnelId) {
        log.info("Récupération incidents pour professionnel {}", professionnelId);

        Professionnel professionnel = professionnelRepository.findById(professionnelId)
                .orElseThrow(() -> new ResourceNotFoundException("Professionnel", "id", professionnelId));

        // Récupérer les incidents du secteur du professionnel
        List<Incident> incidents = incidentRepository.findBySecteur(
                professionnel.getSecteurAffectate() != null
                        ? new ma.ehtp.geoinfo.entity.Secteur() {
                            {
                                setId(professionnel.getSecteurAffectate());
                            }
                        }
                        : null);

        // Filtrer par statuts pertinents pour le professionnel
        incidents = incidents.stream()
                .filter(i -> i.getStatut() == Incident.StatutIncident.VALIDE ||
                        i.getStatut() == Incident.StatutIncident.PRIS_EN_COMPTE ||
                        i.getStatut() == Incident.StatutIncident.EN_COURS_DE_TRAITEMENT ||
                        i.getStatut() == Incident.StatutIncident.TRAITE ||
                        i.getStatut() == Incident.StatutIncident.BLOQUE ||
                        i.getStatut() == Incident.StatutIncident.REDIRIGE)
                .collect(Collectors.toList());

        log.info("Nombre d'incidents trouvés : {}", incidents.size());

        return incidents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Prend en compte un incident
     * VALIDE → PRIS_EN_COMPTE
     * 
     * @param incidentId      ID de l'incident
     * @param professionnelId ID du professionnel
     * @return Incident mis à jour
     */
    @Transactional
    public IncidentResponse prendreEnCompte(Long incidentId, Long professionnelId) {
        log.info("Prise en compte incident {} par professionnel {}", incidentId, professionnelId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        Professionnel professionnel = professionnelRepository.findById(professionnelId)
                .orElseThrow(() -> new ResourceNotFoundException("Professionnel", "id", professionnelId));

        // Vérifier le statut
        if (incident.getStatut() != Incident.StatutIncident.VALIDE) {
            throw new IllegalStateException("Seuls les incidents VALIDES peuvent être pris en compte");
        }

        // Mettre à jour
        incident.setStatut(Incident.StatutIncident.PRIS_EN_COMPTE);
        incident.setProfessionnelAffecte(professionnel);
        incident = incidentRepository.save(incident);

        log.info("Incident pris en compte : id={}", incidentId);

        return mapToResponse(incident);
    }

    /**
     * Démarre le traitement d'un incident
     * PRIS_EN_COMPTE → EN_COURS_DE_TRAITEMENT
     * 
     * @param incidentId      ID de l'incident
     * @param professionnelId ID du professionnel
     * @return Incident mis à jour
     */
    @Transactional
    public IncidentResponse demarrerTraitement(Long incidentId, Long professionnelId) {
        log.info("Démarrage traitement incident {} par professionnel {}", incidentId, professionnelId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        // Vérifier que le professionnel est bien affecté
        if (incident.getProfessionnelAffecte() == null ||
                !incident.getProfessionnelAffecte().getId().equals(professionnelId)) {
            throw new IllegalStateException("Vous n'êtes pas affecté à cet incident");
        }

        // Vérifier le statut
        if (incident.getStatut() != Incident.StatutIncident.PRIS_EN_COMPTE) {
            throw new IllegalStateException("Seuls les incidents PRIS_EN_COMPTE peuvent être démarrés");
        }

        // Mettre à jour
        incident.setStatut(Incident.StatutIncident.EN_COURS_DE_TRAITEMENT);
        incident = incidentRepository.save(incident);

        log.info("Traitement démarré : id={}", incidentId);

        return mapToResponse(incident);
    }

    /**
     * Termine le traitement d'un incident
     * EN_COURS_DE_TRAITEMENT → TRAITE
     * 
     * @param incidentId            ID de l'incident
     * @param professionnelId       ID du professionnel
     * @param descriptionTraitement Description du traitement effectué
     * @return Incident mis à jour
     */
    @Transactional
    public IncidentResponse traiterIncident(Long incidentId, Long professionnelId, String descriptionTraitement) {
        log.info("Traitement incident {} par professionnel {}", incidentId, professionnelId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        // Vérifier que le professionnel est bien affecté
        if (incident.getProfessionnelAffecte() == null ||
                !incident.getProfessionnelAffecte().getId().equals(professionnelId)) {
            throw new IllegalStateException("Vous n'êtes pas affecté à cet incident");
        }

        // Vérifier le statut
        if (incident.getStatut() != Incident.StatutIncident.EN_COURS_DE_TRAITEMENT) {
            throw new IllegalStateException("Seuls les incidents EN_COURS_DE_TRAITEMENT peuvent être traités");
        }

        // Mettre à jour
        incident.setStatut(Incident.StatutIncident.TRAITE);
        incident.setDescriptionTraitement(descriptionTraitement);
        incident.setDateTraitement(LocalDateTime.now());
        incident = incidentRepository.save(incident);

        log.info("Incident traité : id={}", incidentId);

        return mapToResponse(incident);
    }

    /**
     * Bloque un incident temporairement
     * EN_COURS_DE_TRAITEMENT → BLOQUE
     * 
     * @param incidentId      ID de l'incident
     * @param professionnelId ID du professionnel
     * @param motif           Motif du blocage
     * @return Incident mis à jour
     */
    @Transactional
    public IncidentResponse bloquerIncident(Long incidentId, Long professionnelId, String motif) {
        log.info("Blocage incident {} par professionnel {}", incidentId, professionnelId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        // Vérifier que le professionnel est bien affecté
        if (incident.getProfessionnelAffecte() == null ||
                !incident.getProfessionnelAffecte().getId().equals(professionnelId)) {
            throw new IllegalStateException("Vous n'êtes pas affecté à cet incident");
        }

        // Mettre à jour
        incident.setStatut(Incident.StatutIncident.BLOQUE);
        incident.setDescriptionTraitement(motif);
        incident = incidentRepository.save(incident);

        log.info("Incident bloqué : id={}", incidentId);

        return mapToResponse(incident);
    }

    /**
     * Débloque un incident
     * BLOQUE → EN_COURS_DE_TRAITEMENT
     * 
     * @param incidentId      ID de l'incident
     * @param professionnelId ID du professionnel
     * @return Incident mis à jour
     */
    @Transactional
    public IncidentResponse debloquerIncident(Long incidentId, Long professionnelId) {
        log.info("Déblocage incident {} par professionnel {}", incidentId, professionnelId);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        // Vérifier que le professionnel est bien affecté
        if (incident.getProfessionnelAffecte() == null ||
                !incident.getProfessionnelAffecte().getId().equals(professionnelId)) {
            throw new IllegalStateException("Vous n'êtes pas affecté à cet incident");
        }

        // Vérifier le statut
        if (incident.getStatut() != Incident.StatutIncident.BLOQUE) {
            throw new IllegalStateException("Seuls les incidents BLOQUÉS peuvent être débloqués");
        }

        // Mettre à jour
        incident.setStatut(Incident.StatutIncident.EN_COURS_DE_TRAITEMENT);
        incident = incidentRepository.save(incident);

        log.info("Incident débloqué : id={}", incidentId);

        return mapToResponse(incident);
    }

    /**
     * Met à jour le statut d'un incident de manière flexible (sans contrainte
     * d'enchaînement)
     * PERMET AU PROFESSIONNEL DE CHOISIR N'IMPORTE QUEL STATUT
     * 
     * @param incidentId      ID de l'incident
     * @param professionnelId ID du professionnel
     * @param nouveauStatut   Nouveau statut à appliquer
     * @param commentaire     Commentaire optionnel (obligatoire pour TRAITE et
     *                        BLOQUE)
     * @return Incident mis à jour
     */
    @Transactional
    public IncidentResponse updateStatut(Long incidentId, Long professionnelId, String nouveauStatut,
            String commentaire) {
        log.info("Mise à jour statut incident {} par professionnel {} vers {}", incidentId, professionnelId,
                nouveauStatut);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident", "id", incidentId));

        // Vérifier que l'incident est dans le secteur du professionnel
        Professionnel professionnel = professionnelRepository.findById(professionnelId)
                .orElseThrow(() -> new ResourceNotFoundException("Professionnel", "id", professionnelId));

        if (incident.getSecteur().getId() != professionnel.getSecteurAffectate()) {
            throw new IllegalStateException("Cet incident n'est pas dans votre secteur");
        }

        // Convertir le statut String en enum
        Incident.StatutIncident statutEnum;
        try {
            statutEnum = Incident.StatutIncident.valueOf(nouveauStatut);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Statut invalide: " + nouveauStatut);
        }

        // Vérifier que le commentaire est fourni pour certains statuts
        if ((statutEnum == Incident.StatutIncident.TRAITE || statutEnum == Incident.StatutIncident.BLOQUE)
                && (commentaire == null || commentaire.trim().isEmpty())) {
            throw new IllegalArgumentException("Un commentaire est obligatoire pour le statut " + nouveauStatut);
        }

        // Affecter automatiquement le professionnel si pas encore affecté
        if (incident.getProfessionnelAffecte() == null) {
            incident.setProfessionnelAffecte(professionnel);
        }

        // Mettre à jour le statut (SANS RESTRICTION D'ENCHAÎNEMENT)
        incident.setStatut(statutEnum);

        // Ajouter le commentaire si fourni
        if (commentaire != null && !commentaire.trim().isEmpty()) {
            incident.setDescriptionTraitement(commentaire);
        }

        // Mettre à jour la date de traitement si incident traité
        if (statutEnum == Incident.StatutIncident.TRAITE) {
            incident.setDateTraitement(LocalDateTime.now());
        }

        incident = incidentRepository.save(incident);

        log.info("Statut incident {} mis à jour vers {}", incidentId, nouveauStatut);

        return mapToResponse(incident);
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
                .build();
    }
}
