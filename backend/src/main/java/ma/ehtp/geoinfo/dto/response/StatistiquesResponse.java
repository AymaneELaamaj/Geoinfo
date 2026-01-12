package ma.ehtp.geoinfo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour les statistiques globales de la plateforme
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesResponse {

    /**
     * Nombre total d'incidents signalés
     */
    private Long totalIncidents;

    /**
     * Nombre d'incidents résolus (statut TRAITE)
     */
    private Long incidentsResolus;

    /**
     * Taux de résolution en pourcentage
     */
    private Integer tauxResolution;

    /**
     * Délai moyen de traitement en heures
     */
    private String delaiMoyen;
}
