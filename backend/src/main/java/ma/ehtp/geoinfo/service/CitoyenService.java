package ma.ehtp.geoinfo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.request.IncidentRequest;
import ma.ehtp.geoinfo.dto.response.AccountRecoveryResponse;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.entity.Incident;
import ma.ehtp.geoinfo.entity.Secteur;
import ma.ehtp.geoinfo.entity.Utilisateur;
import ma.ehtp.geoinfo.exception.ResourceNotFoundException;
import ma.ehtp.geoinfo.repository.IncidentRepository;
import ma.ehtp.geoinfo.repository.SecteurRepository;
import ma.ehtp.geoinfo.repository.UtilisateurRepository;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service pour les fonctionnalités citoyens
 * Gère la déclaration et la consultation des incidents
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CitoyenService {

    private final IncidentRepository incidentRepository;
    private final SecteurRepository secteurRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FileStorageService fileStorageService;
    private final GeolocationService geolocationService;

    /**
     * Déclare un nouvel incident
     * 
     * @param request        Données de l'incident
     * @param photo          Photo optionnelle
     * @param declarantEmail Email du déclarant (peut être null pour déclaration
     *                       anonyme)
     * @return Incident créé
     */
    @Transactional
    public IncidentResponse declarerIncident(IncidentRequest request, MultipartFile photo, String declarantEmail) {
        log.info("=== DÉBUT DÉCLARATION INCIDENT ===");
        log.info("Type: {}, SecteurId: {}, Lat: {}, Lon: {}",
                request.getTypeIncident(), request.getSecteurId(),
                request.getLatitude(), request.getLongitude());

        // Valider le secteurId
        if (request.getSecteurId() == null) {
            log.error("ERREUR: secteurId est null!");
            throw new IllegalArgumentException("Le secteur est obligatoire");
        }

        // Valider et récupérer le secteur
        log.info("Recherche du secteur avec id: {}", request.getSecteurId());
        Secteur secteur = secteurRepository.findById(request.getSecteurId())
                .orElseThrow(() -> {
                    log.error("ERREUR: Secteur non trouvé avec id: {}", request.getSecteurId());
                    return new ResourceNotFoundException("Secteur", "id", request.getSecteurId());
                });
        log.info("Secteur trouvé: {}", secteur.getNom());

        // Récupérer le déclarant si authentifié
        Utilisateur declarant = null;
        if (declarantEmail != null) {
            log.info("Recherche du déclarant: {}", declarantEmail);
            declarant = utilisateurRepository.findByEmail(declarantEmail).orElse(null);
        }

        // Créer le Point PostGIS
        Point location = geolocationService.createPoint(request.getLatitude(), request.getLongitude());

        // Calculer automatiquement la province par intersection spatiale
        String province = geolocationService.findProvinceByCoordinates(request.getLatitude(), request.getLongitude());

        // Gérer l'upload de la photo
        String photoUrl = null;
        if (photo != null && !photo.isEmpty()) {
            // Valider l'image
            if (!fileStorageService.isValidImage(photo)) {
                throw new IllegalArgumentException("Format d'image invalide. Formats acceptés : JPEG, PNG, WEBP");
            }

            // Valider la taille (10MB max)
            if (!fileStorageService.isValidSize(photo, 10 * 1024 * 1024)) {
                throw new IllegalArgumentException("La taille de l'image ne doit pas dépasser 10MB");
            }

            String filename = fileStorageService.storeFile(photo);
            photoUrl = fileStorageService.getFileUrl(filename);
        }

        // Créer l'incident
        Incident incident = new Incident();
        incident.setTypeIncident(request.getTypeIncident());
        incident.setDescription(request.getDescription());
        incident.setNomLocal(request.getNomLocal());
        incident.setLocalisation(request.getLocalisation());
        incident.setLatitude(request.getLatitude());
        incident.setLongitude(request.getLongitude());
        incident.setLocation(location);
        incident.setProvince(province);
        incident.setSecteur(secteur);
        incident.setPhotoUrl(photoUrl);
        incident.setDeclarant(declarant);
        incident.setDeviceId(request.getDeviceId());
        incident.setCitizenEmail(declarantEmail); // Email pour récupération multi-appareils
        incident.setStatut(Incident.StatutIncident.REDIGE); // Statut initial

        // Sauvegarder
        incident = incidentRepository.save(incident);

        log.info("Incident créé : id={}, province={}, statut={}", incident.getId(), province, incident.getStatut());

        return mapToResponse(incident);
    }

    /**
     * Récupère les incidents déclarés par un appareil citoyen (deviceId)
     * TRIÉS PAR DATE DE DÉCLARATION (plus récent en premier)
     * 
     * @param deviceId Identifiant anonyme de l'appareil (UUID)
     * @return Liste des incidents
     */
    @Transactional(readOnly = true)
    public List<IncidentResponse> getIncidentsByDeviceId(String deviceId) {
        // Tri par date décroissante (plus récent en premier)
        List<Incident> incidents = incidentRepository.findByDeviceIdOrderByDateDeclarationDesc(deviceId);
        return incidents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère tous les incidents pour affichage sur carte
     * Retourne uniquement les incidents VALIDES (publiés)
     * 
     * @return Liste des incidents publiés
     */
    @Transactional(readOnly = true)
    public List<IncidentResponse> getIncidentsForMap() {
        List<Incident> incidents = incidentRepository.findByStatut(Incident.StatutIncident.VALIDE);
        return incidents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un compte par UUID (changement d'appareil)
     * 
     * @param uuid Identifiant unique de l'appareil
     * @return Réponse contenant les incidents du compte
     */
    @Transactional(readOnly = true)
    public AccountRecoveryResponse recoverAccount(String uuid) {
        log.info("=== RÉCUPÉRATION COMPTE UUID ===");
        log.info("UUID demandé: {}", uuid);

        // Récupérer tous les incidents liés à cet UUID (triés par date décroissante)
        List<Incident> incidents = incidentRepository.findByDeviceIdOrderByDateDeclarationDesc(uuid);

        if (incidents.isEmpty()) {
            log.warn("Aucun incident trouvé pour UUID: {}", uuid);
            throw new ResourceNotFoundException("Aucun incident trouvé pour cet identifiant");
        }

        log.info("Compte récupéré: {} incident(s) trouvé(s)", incidents.size());

        // Convertir en DTO
        List<IncidentResponse> incidentResponses = incidents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return AccountRecoveryResponse.builder()
                .success(true)
                .incidentsCount(incidents.size())
                .message(String.format("✅ Compte récupéré ! %d incident(s) retrouvé(s)", incidents.size()))
                .incidents(incidentResponses)
                .build();
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
