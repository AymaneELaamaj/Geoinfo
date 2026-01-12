package ma.ehtp.geoinfo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import ma.ehtp.geoinfo.dto.response.IncidentResponse;
import ma.ehtp.geoinfo.dto.response.StatistiquesResponse;
import ma.ehtp.geoinfo.entity.Incident;
import ma.ehtp.geoinfo.repository.IncidentRepository;
import ma.ehtp.geoinfo.repository.SecteurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service pour les endpoints publics d'incidents
 * Consultation et statistiques
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class IncidentService {

        private final IncidentRepository incidentRepository;
        private final SecteurRepository secteurRepository;

        /**
         * Récupère tous les incidents PUBLICS avec pagination
         * Exclut les statuts REDIGE (en attente validation) et BLOQUE
         * 
         * @param pageable Paramètres de pagination
         * @return Page d'incidents publics
         */
        @Transactional(readOnly = true)
        public Page<IncidentResponse> getAllIncidents(Pageable pageable) {
                log.info("Récupération de tous les incidents publics (page {})", pageable.getPageNumber());

                // Exclure REDIGE et BLOQUE des vues publiques
                Page<Incident> incidents = incidentRepository.findByStatutNotIn(
                                Arrays.asList(Incident.StatutIncident.REDIGE, Incident.StatutIncident.BLOQUE),
                                pageable);

                return incidents.map(this::mapToResponse);
        }

        /**
         * Récupère un incident par son ID
         * 
         * @param id ID de l'incident
         * @return Incident
         */
        @Transactional(readOnly = true)
        public IncidentResponse getIncidentById(Long id) {
                log.info("Récupération incident id={}", id);

                Incident incident = incidentRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Incident non trouvé"));

                return mapToResponse(incident);
        }

        /**
         * Récupère tous les incidents associés à un email citoyen
         * 
         * @param email Email du citoyen
         * @return Liste des incidents
         */
        @Transactional(readOnly = true)
        public List<IncidentResponse> getIncidentsByEmail(String email) {
                log.info("Récupération incidents pour email={}", email);

                List<Incident> incidents = incidentRepository.findByCitizenEmailOrderByDateDeclarationDesc(email);

                return incidents.stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Recherche d'incidents avec filtres
         * 
         * @param statut       Statut (optionnel)
         * @param secteurId    Secteur (optionnel)
         * @param typeIncident Type (optionnel)
         * @param province     Province (optionnel)
         * @param pageable     Pagination
         * @return Page d'incidents filtrés
         */
        @Transactional(readOnly = true)
        public Page<IncidentResponse> searchIncidents(
                        String statut,
                        Long secteurId,
                        String typeIncident,
                        String province,
                        Pageable pageable) {

                log.info("Recherche incidents : statut={}, secteur={}, type={}, province={}",
                                statut, secteurId, typeIncident, province);

                Incident.StatutIncident statutEnum = statut != null ? Incident.StatutIncident.valueOf(statut) : null;

                Page<Incident> incidents = incidentRepository.searchIncidents(
                                statutEnum, secteurId, typeIncident, province, pageable);

                return incidents.map(this::mapToResponse);
        }

        /**
         * Calcule les statistiques globales des incidents PUBLICS
         * Exclut REDIGE et BLOQUE
         * 
         * @return Map de statistiques
         */
        @Transactional(readOnly = true)
        public Map<String, Object> getStatistics() {
                log.info("Calcul des statistiques globales (publics uniquement)");

                // Exclure REDIGE et BLOQUE des statistiques publiques
                List<Incident> allIncidents = incidentRepository.findAll().stream()
                                .filter(i -> i.getStatut() != Incident.StatutIncident.REDIGE
                                                && i.getStatut() != Incident.StatutIncident.BLOQUE)
                                .collect(Collectors.toList());

                Map<String, Object> stats = new HashMap<>();

                // Statistiques générales (sans REDIGE ni BLOQUE)
                stats.put("total", allIncidents.size());
                stats.put("valide", countByStatut(allIncidents, Incident.StatutIncident.VALIDE));
                stats.put("prisEnCompte", countByStatut(allIncidents, Incident.StatutIncident.PRIS_EN_COMPTE));
                stats.put("enCours", countByStatut(allIncidents, Incident.StatutIncident.EN_COURS_DE_TRAITEMENT));
                stats.put("traite", countByStatut(allIncidents, Incident.StatutIncident.TRAITE));
                stats.put("rejete", countByStatut(allIncidents, Incident.StatutIncident.REJETE));
                stats.put("redirige", countByStatut(allIncidents, Incident.StatutIncident.REDIRIGE));

                // Statistiques par secteur
                Map<String, Long> parSecteur = allIncidents.stream()
                                .collect(Collectors.groupingBy(
                                                i -> i.getSecteur().getNom(),
                                                Collectors.counting()));
                stats.put("parSecteur", parSecteur);

                // Statistiques par province
                Map<String, Long> parProvince = allIncidents.stream()
                                .filter(i -> i.getProvince() != null)
                                .collect(Collectors.groupingBy(
                                                Incident::getProvince,
                                                Collectors.counting()));
                stats.put("parProvince", parProvince);

                // Statistiques par type
                Map<String, Long> parType = allIncidents.stream()
                                .collect(Collectors.groupingBy(
                                                Incident::getTypeIncident,
                                                Collectors.counting()));
                stats.put("parType", parType);

                // Taux de résolution
                long totalTraites = countByStatut(allIncidents, Incident.StatutIncident.TRAITE);
                double tauxResolution = allIncidents.size() > 0
                                ? (double) totalTraites / allIncidents.size() * 100
                                : 0;
                stats.put("tauxResolution", Math.round(tauxResolution * 100.0) / 100.0);

                log.info("Statistiques calculées : {} incidents au total", allIncidents.size());

                return stats;
        }

        /**
         * Compte les incidents par statut
         */
        private long countByStatut(List<Incident> incidents, Incident.StatutIncident statut) {
                return incidents.stream()
                                .filter(i -> i.getStatut() == statut)
                                .count();
        }

        /**
         * Met à jour le statut d'un incident (pour les professionnels)
         * 
         * @param id          ID de l'incident
         * @param newStatut   Nouveau statut
         * @param commentaire Commentaire (optionnel sauf pour TRAITE et BLOQUE)
         * @return Incident mis à jour
         */
        @Transactional
        public IncidentResponse updateStatus(Long id, String newStatut, String commentaire) {
                log.info("Mise à jour statut incident {} : {} (commentaire: {})", id, newStatut, commentaire);

                Incident incident = incidentRepository.findById(id)
                                .orElseThrow(() -> new RuntimeException("Incident non trouvé: " + id));

                // Convertir le statut
                Incident.StatutIncident statutEnum;
                try {
                        statutEnum = Incident.StatutIncident.valueOf(newStatut);
                } catch (IllegalArgumentException e) {
                        throw new RuntimeException("Statut invalide: " + newStatut);
                }

                // Mettre à jour le statut
                incident.setStatut(statutEnum);

                // Gérer le commentaire selon le statut
                if (statutEnum == Incident.StatutIncident.TRAITE) {
                        incident.setDescriptionTraitement(commentaire);
                } else if (statutEnum == Incident.StatutIncident.BLOQUE) {
                        incident.setMotifRejet(commentaire); // Réutilisation du champ pour le motif de blocage
                }

                Incident saved = incidentRepository.save(incident);
                log.info("Incident {} mis à jour avec statut {}", id, newStatut);

                return mapToResponse(saved);
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
                                                incident.getProfessionnelAffecte() != null
                                                                ? incident.getProfessionnelAffecte().getId()
                                                                : null)
                                .build();
        }

        /**
         * Calcule les statistiques globales de la plateforme
         * 
         * @return Statistiques en temps réel
         */
        @Transactional(readOnly = true)
        public StatistiquesResponse getStatistiques() {
                log.info("Calcul des statistiques globales");

                // Total incidents (tous statuts sauf REDIGE et REJETE)
                List<Incident.StatutIncident> excludedStatuts = Arrays.asList(
                                Incident.StatutIncident.REDIGE,
                                Incident.StatutIncident.REJETE);
                long totalIncidents = incidentRepository.countByStatutNotIn(excludedStatuts);

                // Incidents résolus (statut TRAITE)
                long incidentsResolus = incidentRepository.countByStatut(Incident.StatutIncident.TRAITE);

                // Taux de résolution (pourcentage)
                int tauxResolution = totalIncidents > 0
                                ? (int) Math.round((incidentsResolus * 100.0) / totalIncidents)
                                : 0;

                // Délai moyen de traitement
                String delaiMoyen = calculerDelaiMoyen();

                return StatistiquesResponse.builder()
                                .totalIncidents(totalIncidents)
                                .incidentsResolus(incidentsResolus)
                                .tauxResolution(tauxResolution)
                                .delaiMoyen(delaiMoyen)
                                .build();
        }

        /**
         * Calcule le délai moyen de traitement en heures
         * Basé sur les incidents TRAITE des 30 derniers jours
         */
        private String calculerDelaiMoyen() {
                List<Incident> incidentsTraites = incidentRepository.findByStatut(Incident.StatutIncident.TRAITE);

                if (incidentsTraites.isEmpty()) {
                        return "N/A";
                }

                // Filtrer les incidents des 30 derniers jours avec date de traitement
                LocalDateTime dateLimit = LocalDateTime.now().minusDays(30);
                List<Long> delaisEnHeures = incidentsTraites.stream()
                                .filter(i -> i.getDateTraitement() != null && i.getDateDeclaration() != null)
                                .filter(i -> i.getDateTraitement().isAfter(dateLimit))
                                .map(i -> Duration.between(i.getDateDeclaration(), i.getDateTraitement()).toHours())
                                .filter(h -> h > 0) // Exclure valeurs négatives ou nulles
                                .collect(Collectors.toList());

                if (delaisEnHeures.isEmpty()) {
                        return "N/A";
                }

                // Calculer moyenne
                double moyenneHeures = delaisEnHeures.stream()
                                .mapToLong(Long::longValue)
                                .average()
                                .orElse(0);

                // Formater en heures ou jours
                if (moyenneHeures < 24) {
                        return Math.round(moyenneHeures) + "h";
                } else {
                        long jours = Math.round(moyenneHeures / 24);
                        return jours + "j";
                }
        }
}
